import map from 'lodash/map'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import isnum from 'wsemi/src/isnum.mjs'
import isint from 'wsemi/src/isint.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cint from 'wsemi/src/cint.mjs'
import dig from 'wsemi/src/dig.mjs'
import { intrpDefPp } from './intrpDefParam.mjs'
import calcVerticalStress from './calcVerticalStress.mjs'
import calcDepthStartEndFromCenter from './calcDepthStartEndFromCenter.mjs'
import { simplifyRobertson1986 } from './calcCptClassify.mjs'
import { basic, calcCptCore } from './calcCpt.mjs'


//defRsat(kN/m3)
let defRsat = 19.5


//zone區對應飽和單位重(kN/m3)
let kpCPTClassForRobBqRfqt = { //Robertson(1986)
    1: 17.5, //'Sensitive fine grained',
    2: 12.5, //'Organic material',
    3: 17.5, //'Clay',
    4: 18, //'Silty clay to clay',
    5: 18, //'Clayey silt to silty clay',
    6: 18, //'Sandy silt to clayey silt',
    7: 18.5, //'Silty sand to sandy silt',
    8: 19, //'Sand to silty sand',
    9: 19.5, //'Sand',
    10: 20, // 'Gravelly sand to sand',
    11: 20.5, // 'Very stiff find grained(overconsolidated or cemented)',
    12: 19, // 'Sand to clayer sand(overconsolidated or cemented)',
    13: (19.5 + 20 + 20.5 + 19) / 4, // '9,10,11,12',
}


function stress(ltdt, opt = {}) {

    //waterLevel
    let waterLevel = get(opt, 'waterLevel')
    if (!isnum(waterLevel)) {
        waterLevel = 0 //地下水位以0m處估計
    }
    waterLevel = cdbl(waterLevel)

    //rdiff
    let rdiff = get(opt, 'rdiff')
    if (!isnum(rdiff)) {
        rdiff = 3 //預設rd小rsat為3(kN/m3)
    }
    rdiff = cdbl(rdiff)

    //waterLevelUsual, waterLevelDesign
    let waterLevelUsual = waterLevel
    let waterLevelDesign = waterLevel

    //cloneDeep
    ltdt = cloneDeep(ltdt)

    //預設每個樣本都有rsat, 更新rd
    ltdt = map(ltdt, (v, k) => {

        //rsat(kN/m3)
        let rsat = get(v, 'rsat')

        //check
        if (!isnum(rsat)) {
            console.log('stress', k, v)
            throw new Error(`stress: 樣本無飽和單位重rsat`)
        }

        //cdbl
        rsat = cdbl(rsat)

        //rd
        let rd = rsat - rdiff

        //save
        v.rsat = rsat
        v.rd = rd

        return v
    })

    //calcVerticalStress
    ltdt = calcVerticalStress(ltdt, { ...opt, waterLevelUsual, waterLevelDesign })
    // console.log('calcVerticalStress', ltdt[0])
    // calcVerticalStress {
    //   depth: 0.005,
    //   qc: 0,
    //   fs: 0,
    //   u2: 0,
    //   depthStart: 0,
    //   depthEnd: 0.01,
    //   rsat: 19.5, //kN/m3
    //   u0: 0,
    //   rd: 16.5, //kN/m3
    //   waterLevelUsual: 0,
    //   waterLevelDesign: 0,
    //   sv: 0.0975,
    //   svpUsual: 0.04845,
    //   svpDesign: 0.04845
    // }

    //轉出svp
    ltdt = map(ltdt, (v) => {

        //add svp
        let svp = get(v, 'svpUsual')
        v.svp = svp

        //轉換單位kPa至MPa
        v.sv /= 1000
        v.svp /= 1000

        //delete
        delete v.svpUsual
        delete v.svpDesign
        delete v.waterLevelUsual
        delete v.waterLevelDesign

        return v
    })


    return ltdt
}


function estUnitWeightCore(ltdt, coe_a, opt = {}) {

    //rdiff
    let rdiff = get(opt, 'rdiff')
    if (!isnum(rdiff)) {
        rdiff = 3 //預設rd小rsat為3(kN/m3)
    }
    rdiff = cdbl(rdiff)

    //ratio
    let ratio = get(opt, 'ratio')
    if (!isnum(ratio)) {
        ratio = 0.8
    }
    ratio = cdbl(ratio)
    if (ratio <= 0) {
        throw new Error(`ratio[${ratio}]<=0`)
    }
    else if (ratio > 1) {
        throw new Error(`ratio[${ratio}]>1`)
    }

    //fv
    let fv = (v) => {
        let vi = dig(v, 2)
        let vd = cdbl(vi)
        return { vi, vd }
    }

    //r0, r1
    let r0 = 1 - ratio
    let r1 = ratio

    //calcCptCore
    ltdt = map(ltdt, (v) => {
        return calcCptCore(v, coe_a)
    })

    //新飽和單位重
    let bUpdate = false
    ltdt = map(ltdt, (v, k) => {

        //check 無rsat
        if (!isnum(v.rsat)) {
            console.log('estUnitWeight', k, v)
            throw new Error(`estUnitWeight: 樣本無飽和單位重rsat`)
        }

        //izone
        let izone = null
        if (isint(v.iRobFrQt) && isint(v.iRobBqQt)) {

            //simplifyRobertson1986
            izone = simplifyRobertson1986(v.iRobFrQt, v.iRobBqQt, { numOfType: 3, returnZone: true })

        }

        //check 無izone
        if (!isint(izone)) {
            //無izone時則優先取用iRobBqQt或iRobFrQt
            if (isint(v.iRobBqQt)) {
                izone = v.iRobBqQt //優先使用砂的iRobBqQt
            }
            else if (isint(v.iRobFrQt)) {
                izone = v.iRobFrQt
            }
        }

        //rsat(kN/m3)
        let rsat = null
        if (isint(izone)) {
            //有izone時則查表得飽和單位重
            izone = cint(izone)
            rsat = get(kpCPTClassForRobBqRfqt, izone, null)
            if (!isnum(rsat)) {
                throw new Error(`於kpCPTClassForRobBqRfqt找不到izone[${izone}]`)
            }
        }

        //check 無rsat
        if (!isnum(rsat)) {
            rsat = defRsat
        }

        //rsat_ori, rsat_new
        let rsat_ori = cdbl(v.rsat)
        let rsat_new = rsat
        let vo = fv(rsat_ori)
        let vn = fv(rsat_new)
        let rsat_ori_dig = vo.vi
        let rsat_new_dig = vn.vi
        rsat_ori = vo.vd
        rsat_new = vn.vd

        //update
        if (rsat_ori_dig !== rsat_new_dig) {
            bUpdate = true

            //rsat
            let rsatTemp = (rsat_ori * r0 + rsat_new * r1)
            v.rsat = fv(rsatTemp).vd
            // console.log(`rsat ${rsat_ori} -> ${rsatTemp}`)

            //rd
            let rdTemp = rsatTemp - rdiff
            v.rd = fv(rdTemp).vd

        }


        return v
    })

    return {
        bUpdate,
        ltdt,
    }
}


function estUnitWeight(ltdt, coe_a, opt = {}) {

    //countMax
    let countMax = get(opt, 'countMax')
    if (!isint(countMax)) {
        countMax = 100
    }
    countMax = cint(countMax)

    //rs
    let i = -1
    let bUpdate = true
    let rs = ltdt
    while (bUpdate) { //直到無更新單位重才跳出
        i++
        // console.log(`迭代 ${i} 次`)

        //estUnitWeightCore
        let r = estUnitWeightCore(rs, coe_a, opt)

        //update
        bUpdate = r.bUpdate
        rs = r.ltdt

        //check
        if (i >= countMax) {
            break
        }

    }

    return rs
}


function calcCptUnitWeight(ltdt, rsatIni, opt = {}) {

    //rsatIni
    if (!isnum(rsatIni)) {
        rsatIni = defRsat
    }
    rsatIni = cdbl(rsatIni)
    if (rsatIni <= 0) {
        throw new Error(`rsatIni[${rsatIni}]<=0`)
    }

    //keyDepth
    let keyDepth = get(opt, 'keyDepth')
    if (!isestr(keyDepth)) {
        keyDepth = 'depth'
    }

    //keyDepthStart
    let keyDepthStart = get(opt, 'keyDepthStart')
    if (!isestr(keyDepthStart)) {
        keyDepthStart = 'depthStart'
    }

    //keyDepthEnd
    let keyDepthEnd = get(opt, 'keyDepthEnd')
    if (!isestr(keyDepthEnd)) {
        keyDepthEnd = 'depthEnd'
    }

    //coe_a
    let coe_a = get(opt, 'coe_a')
    if (!isnum(coe_a)) {
        coe_a = 0.8
    }
    coe_a = cdbl(coe_a)

    //cloneDeep
    ltdt = cloneDeep(ltdt)

    //basic
    ltdt = basic(ltdt, opt)
    // console.log('basic', ltdt)

    //計算keyDepth, keyDepthStart, keyDepthEnd
    let dc0 = get(ltdt, `0.${keyDepth}`)
    let ds0 = get(ltdt, `0.${keyDepthStart}`)
    let de0 = get(ltdt, `0.${keyDepthEnd}`)
    if (isnum(dc0) && !isnum(ds0) && !isnum(de0)) {
        ltdt = calcDepthStartEndFromCenter(ltdt, opt)
    }
    else if (!isnum(dc0) && isnum(ds0) && isnum(de0)) {
        ltdt = map(ltdt, (v, k) => {
            let ds = get(v, keyDepthStart)
            let de = get(v, keyDepthEnd)
            if (isnum(ds) && isnum(de)) {
                ds = cdbl(ds)
                de = cdbl(de)
                let dc = (ds + de) / 2
                v[keyDepth] = dc
            }
            else {
                console.log(k, v)
                throw new Error(`第 ${k} 樣本無起始深度(${keyDepthStart})或結束深度(${keyDepthEnd})數據`)
            }
            return v
        })

    }

    //add rsat
    ltdt = map(ltdt, (v) => {
        v.rsat = rsatIni
        return v
    })

    //add u0
    ltdt = map(ltdt, (v) => {
        //u0(MPa), 現地孔隙壓力
        let u0 = intrpDefPp(v.depth) //u0(kPa)
        u0 = u0 / 1000 //kPa -> MPa
        v.u0 = u0
        return v
    })

    //stress
    ltdt = stress(ltdt, opt)
    // console.log('stress', ltdt)

    //estUnitWeight
    ltdt = estUnitWeight(ltdt, coe_a, opt)
    // console.log('estUnitWeight', ltdt)

    return ltdt //回傳qc,fs,u0,u2,sv,svp單位為MPa
}


export default calcCptUnitWeight
