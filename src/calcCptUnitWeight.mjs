import map from 'lodash-es/map.js'
import get from 'lodash-es/get.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isnum from 'wsemi/src/isnum.mjs'
import isint from 'wsemi/src/isint.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cint from 'wsemi/src/cint.mjs'
import dig from 'wsemi/src/dig.mjs'
import cnst from './cnst.mjs'
import { intrpDefPp } from './intrpDefParam.mjs'
import calcVerticalStress from './calcVerticalStress.mjs'
import calcDepthStartEndByDepth from './calcDepthStartEndByDepth.mjs'
import { basic, calcCptCore } from './calcCpt.mjs'


//Pa, 大氣壓(MPa)
let Pa = cnst.Pa


//rw, 水單位重(kN/m3)
let rw = cnst.rw


//zone區對應飽和單位重(kN/m3), Robertson(1986)
let kpCPTClassForRobBqRfqt = {
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


//zone區對應飽和單位重(kN/m3), Lunne(1997)
let kpCPTClassForLunneBqFrQt = {
    1: 17.5, //Sensitive fine-grained
    2: 12.5, //Clay - organic soil
    3: 17.5, //Clays: clay to silty clay
    4: 18, //Silt mixtures: clayey silt & silty clay
    5: 18.25, //Sand mixtures: silty sand to sandy silt, 18.0~18.5(取18.25)
    6: 19, //Sands: clean sands to silty sands
    7: 19.75, //Dense sand to gravelly sand, 19.5~20.0(取19.75)
    8: 19, //Stiff sand to clayey sand
    9: 20.5, //Stiff fine-grained
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

        //rd(kN/m3)
        let rd = rsat - rdiff

        //save
        v.rsat = rsat
        v.rd = rd

        return v
    })
    // console.log('ltdt[0](rsat,rd)', ltdt[0])

    //calcVerticalStress, 後續CPT分析(calcCptCore)採用MPa, 故須指定單位為MPa
    ltdt = calcVerticalStress(ltdt, { ...opt, waterLevelUsual, waterLevelDesign, unitSvSvp: 'MPa' })
    // console.log('ltdt[0](calcVerticalStress)', ltdt[0])
    // ltdt[0](calcVerticalStress) {
    //   depth: 0.005,
    //   qc: 0.409166667,
    //   fs: 0.00225,
    //   u2: -0.005923077,
    //   depthStart: 0,
    //   depthEnd: 0.01,
    //   rsat: 14.66,
    //   u0: 0,
    //   rd: 11.66,
    //   sv: 0.0000733,
    //   svp: 0.00004595,
    //   qt: 0.40768589774999997,
    //   qnet: 0.40759089774999996,
    //   Bq: -0.014531916764326223,
    //   Qt: 8870.313335146899,
    //   Qtn: 188.82998775578392,
    //   Rf: 0.5518954696293514,
    //   Fr: 0.5520241036835077,
    //   Ic: 1.0741456715495592,
    //   Icn: 1.5332416032102212,
    //   n: 0.5,
    //   Cn: 46.975130595353214,
    //   iIc: 1,
    //   iIcn: 2,
    //   iRobBqqt: 4,
    //   iRobRfqt: 1,
    //   iRobBqQt: null,
    //   iRobFrQt: null,
    //   iRobBqQtn: 6,
    //   iRobFrQtn: 6,
    //   iRamBqQt: null,
    //   iRamFrQt: null,
    //   waterLevelUsual: 0,
    //   waterLevelDesign: 0,
    //   svpUsual: 0.00002425,
    //   svpDesign: 0.00002425
    // }

    //轉出svp
    ltdt = map(ltdt, (v) => {

        //svp(MPa)
        let svp = get(v, 'svpUsual')
        v.svp = svp

        //delete
        delete v.svpUsual
        delete v.svpDesign
        delete v.waterLevelUsual
        delete v.waterLevelDesign

        return v
    })
    // console.log('ltdt[0](轉出svp)', ltdt[0])

    return ltdt
}


function estUnitWeightCore(ltdt, opt = {}) {

    //method
    let method = get(opt, 'method', '')
    if (
        method !== 'Robertson(1986)' &&
        method !== 'Lunne(1997)' &&
        method !== 'Lunne(1997) for Robertson stress exponent' &&
        method !== 'Robertson and Cabal(2010)' &&
        method !== 'Mayne(2014)' &&
        true
    ) {
        method = 'Robertson(1986)'
    }

    //rsatIni
    let rsatIni = get(opt, 'rsatIni')
    if (!isnum(rsatIni)) {
        rsatIni = 19.5
    }
    rsatIni = cdbl(rsatIni)

    //rdiff
    let rdiff = get(opt, 'rdiff')
    if (!isnum(rdiff)) {
        rdiff = 3 //預設初始rsat-rd=3(kN/m3)
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

    //stress
    ltdt = stress(ltdt, opt)
    // console.log('stress', ltdt)

    //calcCptCore, CPT分析(calcCptCore)採用MPa, 預設Robertson(1990)迭代計算時useCnLeq使用false, 可得Icn,Qtn供外部使用, 此不影響後面使用Robertson(1986)評估分類與單位重
    ltdt = map(ltdt, (v) => {
        return calcCptCore(v, { unitSvSvp: 'MPa', useCnLeq: false })
    })

    //重算飽和單位重
    let bUpdate = false
    ltdt = map(ltdt, (v, k) => {

        //check 無rsat
        if (!isnum(v.rsat)) {
            console.log('樣本無飽和單位重rsat', k, v)
            throw new Error(`樣本無飽和單位重rsat`)
        }

        //rsat(kN/m3), 飽和單位重
        let rsat = null
        if (method === 'Robertson(1986)') {
            //查 kpCPTClassForRobBqRfqt, Robertson(1986)

            if (rsat === null && isint(v.iRobRfqt)) { //查qt圖優先
                rsat = get(kpCPTClassForRobBqRfqt, v.iRobRfqt, null)
                if (!isnum(rsat)) {
                    throw new Error(`於kpCPTClassForRobBqRfqt找不到iRobRfqt[${v.iRobRfqt}]區域`)
                }
            }

            if (rsat === null && isint(v.iRobBqqt)) { //若查無qt圖才查fs圖
                rsat = get(kpCPTClassForRobBqRfqt, v.iRobBqqt, null)
                if (!isnum(rsat)) {
                    throw new Error(`於kpCPTClassForRobBqRfqt找不到iRobBqqt[${v.iRobBqqt}]區域`)
                }
            }

            //check 無rsat
            if (!isnum(rsat)) {
                rsat = rsatIni
            }

        }
        else if (method === 'Lunne(1997)') {
            //查 kpCPTClassForLunneBqFrQt, Lunne(1997), 於Robertson(1998)之前故是使用FrQt與BqQt

            if (rsat === null && isint(v.iRobFrQt)) { //查FrQt圖優先
                rsat = get(kpCPTClassForLunneBqFrQt, v.iRobFrQt, null)
                if (!isnum(rsat)) {
                    throw new Error(`於kpCPTClassForLunneBqFrQt找不到iRobFrQt[${v.iRobFrQt}]區域`)
                }
            }

            if (rsat === null && isint(v.iRobBqQt)) { //若查無FrQt圖才查BqQt圖
                rsat = get(kpCPTClassForLunneBqFrQt, v.iRobBqQt, null)
                if (!isnum(rsat)) {
                    throw new Error(`於kpCPTClassForLunneBqFrQt找不到iRobBqQt[${v.iRobBqQt}]區域`)
                }
            }

            //check 無rsat
            if (!isnum(rsat)) {
                rsat = rsatIni
            }

        }
        else if (method === 'Lunne(1997) for Robertson stress exponent') {
            //查 kpCPTClassForLunneBqFrQt, Lunne(1997), 改使用Robertson(1998)的FrQtn與BqQtn

            if (rsat === null && isint(v.iRobFrQtn)) { //查FrQtn圖優先
                rsat = get(kpCPTClassForLunneBqFrQt, v.iRobFrQtn, null)
                if (!isnum(rsat)) {
                    throw new Error(`於kpCPTClassForLunneBqFrQt找不到iRobFrQtn[${v.iRobFrQtn}]`)
                }
            }

            if (rsat === null && isint(v.iRobBqQtn)) { //若查無FrQtn圖才查BqQtn圖
                rsat = get(kpCPTClassForLunneBqFrQt, v.iRobBqQtn, null)
                if (!isnum(rsat)) {
                    throw new Error(`於kpCPTClassForLunneBqFrQt找不到iRobBqQtn[${v.iRobBqQtn}]`)
                }
            }

            //check 無rsat
            if (!isnum(rsat)) {
                rsat = rsatIni
            }

        }
        else if (method === 'Robertson and Cabal(2010)') {
            //Robertson and Cabal(2010) 經驗公式

            // r/rw = 0.27 * Math.log10(Rf) + 0.36 * Math.log10(qt/Pa) + 1.236
            // r = rw * ( 0.27 * Math.log10(Rf) + 0.36 * Math.log10(qt/Pa) + 1.236 )
            rsat = rw * (0.27 * Math.log10(v.Rf) + 0.36 * Math.log10(v.qt / Pa) + 1.236)

            //check 無rsat
            if (!isnum(rsat)) {
                rsat = rsatIni
            }

        }
        else if (method === 'Mayne(2014)') {
            //Mayne(2014) 經驗公式

            // rt, Messured Unit Weight, rt(kN/m3), fs(kPa)
            // rt = 26 - ( 14 / ( 1 + ( 0.5 * Math.log10( fs + 1 ) ) ** 2 ) )
            let fs = v.fs * 1000 //MPa -> kPa
            rsat = 26 - (14 / (1 + (0.5 * Math.log10(fs + 1)) ** 2))

            //check 無rsat
            if (!isnum(rsat)) {
                rsat = rsatIni
            }

            //最大最小單位重
            let rsat_min = 12 //kN/m3
            let rsat_max = 23 //kN/m3
            if (rsat < rsat_min) {
            // console.log(`rsat[${rsat}]小於rsat_min[${rsat_min}]`)
                rsat = rsat_min
            }
            if (rsat > rsat_max) {
            // console.log(`rsat[${rsat}]大於rsat_max[${rsat_max}]`)
                rsat = rsat_max
            }

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

            //save rsat
            let rsatTemp = (rsat_ori * r0 + rsat_new * r1)
            v.rsat = fv(rsatTemp).vd
            // console.log(`rsat ${rsat_ori} -> ${rsatTemp}`)

            //save rd
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


function estUnitWeight(ltdt, opt = {}) {

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
        let r = estUnitWeightCore(rs, opt)

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


function calcCptUnitWeight(ltdt, opt = {}) {

    //unitSvSvp
    let unitSvSvp = get(opt, 'unitSvSvp')
    if (unitSvSvp !== 'kPa' && unitSvSvp !== 'MPa') {
        throw new Error(`opt.unitSvSvp[${unitSvSvp}] need kPa or MPa`)
    }

    //rsatIni
    let rsatIni = get(opt, 'rsatIni')
    if (!isnum(rsatIni)) {
        rsatIni = 19.5
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
        ltdt = calcDepthStartEndByDepth(ltdt, opt)
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
                throw new Error(`第 ${k} 樣本的起始深度[${keyDepthStart}]或結束深度[${keyDepthEnd}]非數字`)
            }
            return v
        })

    }
    // console.log('ltdt[0](ds,de)', ltdt[0])

    //check coe_a
    ltdt = map(ltdt, (v, k) => {
        let coe_a = get(v, 'coe_a')
        if (isnum(coe_a)) {
            coe_a = cdbl(coe_a)
        }
        else {
            console.log(k, v)
            throw new Error(`第 ${k} 樣本的coe_a[${coe_a}]非數字`)
        }
        v.coe_a = coe_a
        return v
    })
    // console.log('ltdt[0](rsat)', ltdt[0])

    //add rsat(kN/m3)
    ltdt = map(ltdt, (v) => {
        v.rsat = rsatIni
        return v
    })
    // console.log('ltdt[0](rsat)', ltdt[0])

    //add u0(MPa)
    ltdt = map(ltdt, (v) => {
        //u0(MPa), 現地孔隙壓力
        v.u0 = intrpDefPp(v.depth, 'MPa')
        return v
    })
    // console.log('ltdt[0](u0)', ltdt[0])

    //estUnitWeight
    ltdt = estUnitWeight(ltdt, opt)
    // console.log('ltdt[0](estUnitWeight)', ltdt[0])

    //unitSvSvp, 此處為MPa, 故指定為kPa才要轉
    if (unitSvSvp === 'kPa') {
        ltdt = map(ltdt, (v) => {
            v.sv *= 1000
            v.svp *= 1000
            return v
        })
    }

    return ltdt //qc,fs,u0,u2單位為(MPa)
}


export default calcCptUnitWeight
