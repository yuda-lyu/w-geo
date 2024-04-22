import map from 'lodash-es/map.js'
import get from 'lodash-es/get.js'
import sortBy from 'lodash-es/sortBy.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import size from 'lodash-es/size.js'
import join from 'lodash-es/join.js'
import cdbl from 'wsemi/src/cdbl.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cnst from './cnst.mjs'
import checkDepthStartEnd from './checkDepthStartEnd.mjs'


//rw, 水單位重(kN/m3)
let rw = cnst.rw


function checkVerticalStress(v, depth, unit, lable = '') {

    //check v
    if (!isnum(v)) {
        throw new Error(`v[${v}] is not a number`)
    }
    v = cdbl(v)

    //check depth
    if (!isnum(depth)) {
        throw new Error(`depth[${depth}] is not a number`)
    }
    depth = cdbl(depth)

    //check unit
    if (unit !== 'kPa' && unit !== 'MPa') {
        throw new Error(`unit[${unit}] need kPa or MPa`)
    }

    //最大最小單位重
    let rmin = 2 //kN/m3, 若最小飽和單位重12, 扣水單位重9.81, 最小乾單位重至少要低於2
    let rmax = 25 //kN/m3

    //最大最小應力
    let vmin = rmin * depth //kPa
    let vmax = rmax * depth //kPa

    //unit
    if (unit === 'MPa') {
        vmin /= 1000
        vmax /= 1000
    }

    //lable
    if (!isestr(lable)) {
        lable = `v`
    }

    //check
    if (v < vmin) {
        throw new Error(`${lable}[${v}](${unit}) < min[${vmin}](${unit}) in depth[${depth}](m)`)
        // console.log(`${lable}[${v}](${unit}) < min[${vmin}](${unit}) in depth[${depth}](m)`)
    }
    if (v > vmax) {
        throw new Error(`${lable}[${v}](${unit}) > max[${vmax}](${unit}) in depth[${depth}](m)`)
        // console.log(`${lable}[${v}](${unit}) > max[${vmax}](${unit}) in depth[${depth}](m)`)
    }

}


function core(rows, waterLevel, opt = {}) {

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
    rows = cloneDeep(rows)

    //each
    let sv_bottom = 0
    rows = map(rows, (v, k) => {

        //err
        let err = get(v, 'err', '')

        //ds, de
        let ds = get(v, keyDepthStart, null)
        let de = get(v, keyDepthEnd, null)

        try {

            //check
            if (!isnum(ds)) {
                throw new Error(`第 ${k} 樣本起始深度(${keyDepthStart})非數值: ${ds}`)
            }
            if (!isnum(de)) {
                throw new Error(`第 ${k} 樣本結束深度(${keyDepthEnd})非數值: ${de}`)
            }
            ds = cdbl(ds)
            de = cdbl(de)

            //depth, 土層中點深度(m)
            v[keyDepth] = (de + ds) / 2

            //rT, 使用單位重(kN/m3)
            let rT = null
            if (ds < waterLevel && de > waterLevel) { //樣本半乾半飽和
                let rsat = get(v, 'rsat', null) //飽和單位重(kN/m3)
                if (!isnum(rsat)) {
                    throw new Error(`第 ${k} 樣本飽和單位重(rsat)非數值: ${rsat}`)
                }
                let rd = get(v, 'rd', null) //乾單位重(kN/m3)
                if (!isnum(rd)) {
                    throw new Error(`第 ${k} 樣本乾單位重(rd)非數值: ${rd}`)
                }
                rd = cdbl(rd)
                let u = waterLevel - ds
                let d = de - waterLevel
                rT = (u * rd + d * rsat) / (u + d) //平均單位重
            }
            else if (de <= waterLevel) { //樣本結束深度小於等於地下水位, 代表整個樣本都在水上, 全乾
                let rd = get(v, 'rd', null) //乾單位重(kN/m3)
                if (!isnum(rd)) {
                    throw new Error(`第 ${k} 樣本乾單位重(rd)非數值: ${rd}`)
                }
                rT = rd
            }
            else if (ds >= waterLevel) { //樣本起始深度大於等於地下水位, 代表整個樣本都在水裡, 飽和
                let rsat = get(v, 'rsat', null)
                if (!isnum(rsat)) {
                    throw new Error(`第 ${k} 樣本飽和單位重(rsat)非數值: ${rsat}`)
                }
                rT = rsat
            }
            else {
                throw new Error('深度條件出現非預期情形')
            }

            //層厚度(m)
            let dd = (de - ds)

            //check sv_bottom
            if (sv_bottom === 0 && ds > 0) {
                //若第1筆數據深度>0, 則sv_bottom得要暴力計算基礎值, 否則會缺覆土應力
                sv_bottom = ds * rT
            }

            //sv(kN/m2), 土層中點深度之垂直總應力
            let dsv = dd * rT
            let sv = sv_bottom + dsv / 2
            v.sv = sv
            // console.log('sv', sv)
            // if (de <= 0.011) {
            //     console.log('dd', dd, 'rT', rT, 'sv_bottom', sv_bottom, 'sv', sv)
            // }

            //更新土層底部之垂直總應力
            sv_bottom += dsv

            //dpp(m), 土層中點深度之水頭高
            let dpp = Math.max(((ds + de) / 2 - waterLevel), 0)
            // console.log('dpp', dpp)
            // if (de <= 0.011) {
            //     console.log('ds', ds, 'de', de, 'waterLevel', waterLevel, 'dpp', dpp)
            // }

            //pp(kN/m2), 土層中點深度之水壓
            let pp = dpp * rw
            // console.log('pp', pp)

            //svp(kN/m2), 土層中點深度之垂直有效應力
            v.svp = Math.max(sv - pp, 0)
            // console.log('svp', v.svp)
            // if (de <= 0.011) {
            //     console.log('v.sv', v.sv, 'pp', pp, v.svp, 'v.svp')
            // }

        }
        catch (e) {
            let ce = e.toString()
            if (err === '') {
                err = ce
            }
            else {
                if (err.indexOf(ce) < 0) { //若不存在才加入
                    err += `, ${ce}`
                }
            }
            v.sv = ''
            v.svp = ''
            v.err = err
        }

        return v
    })

    return rows
}


/**
 * 計算樣本數據垂直總應力與有效應力
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/checkDepthStartEnd.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart，單位m)與結束深度(depthEnd，單位m)，位於地下水位以上之樣本需提供乾單位重(rd，單位kN/m3)，位於地下水位以下之樣本需提供飽和單位重(rsat，單位kN/m3)，若地下水位位於該樣本起訖深度內，則需同時提供乾單位重與飽和單位重
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepth='depth'] 輸入中點深度欄位鍵值字串，預設'depth'
 * @param {String} [opt.keyDepthStart='depthStart'] 輸入起始深度欄位鍵值字串，預設'depthStart'
 * @param {String} [opt.keyDepthEnd='depthEnd'] 輸入結束深度欄位鍵值字串，預設'depthEnd'
 * @param {Number} [opt.waterLevelUsual=0] 輸入常時地下水位數字，單位m，預設0
 * @param {Number} [opt.waterLevelDesign=0] 輸入設計地下水位數字，單位m，預設0
 * @returns {Array} 回傳計算後數據陣列
 * @example
 *
 * let waterLevelUsual
 * let waterLevelDesign
 * let rows
 * let rowsNew
 *
 * waterLevelUsual = 0
 * waterLevelDesign = 0
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         rsat: 18, //kN/m3
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *         rsat: 18, //kN/m3
 *     },
 *     {
 *         depthStart: 10,
 *         depthEnd: 20,
 *         rsat: 18, //kN/m3
 *     },
 * ]
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
 * console.log(rowsNew, (18 - 9.81) * 15) //地下 15(m) 處之垂直有效應力為 122.85(kN/m2)
 * // => [
 * //   {
 * //     depthStart: 0,
 * //     depthEnd: 5,
 * //     rsat: 18,
 * //     waterLevelUsual: 0,
 * //     waterLevelDesign: 0,
 * //     sv: 45,
 * //     svpUsual: 20.474999999999998,
 * //     svpDesign: 20.474999999999998,
 * //     depth: 2.5
 * //   },
 * //   {
 * //     depthStart: 5,
 * //     depthEnd: 10,
 * //     rsat: 18,
 * //     waterLevelUsual: 0,
 * //     waterLevelDesign: 0,
 * //     sv: 135,
 * //     svpUsual: 61.425,
 * //     svpDesign: 61.425,
 * //     depth: 7.5
 * //   },
 * //   {
 * //     depthStart: 10,
 * //     depthEnd: 20,
 * //     rsat: 18,
 * //     waterLevelUsual: 0,
 * //     waterLevelDesign: 0,
 * //     sv: 270,
 * //     svpUsual: 122.85,
 * //     svpDesign: 122.85,
 * //     depth: 15
 * //   }
 * // ] 122.85
 *
 * waterLevelUsual = 0
 * waterLevelDesign = 0
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         rsat: 18, //kN/m3
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *         rsat: 19, //kN/m3
 *     },
 *     {
 *         depthStart: 10,
 *         depthEnd: 20,
 *         rsat: 20, //kN/m3
 *     },
 * ]
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
 * console.log(rowsNew, (19 - 9.81) * 15) //地下 15(m) 處之垂直有效應力為 137.85(kN/m2)
 * // => [
 * //   {
 * //     depthStart: 0,
 * //     depthEnd: 5,
 * //     rsat: 18,
 * //     waterLevelUsual: 0,
 * //     waterLevelDesign: 0,
 * //     sv: 45,
 * //     svpUsual: 20.474999999999998,
 * //     svpDesign: 20.474999999999998,
 * //     depth: 2.5
 * //   },
 * //   {
 * //     depthStart: 5,
 * //     depthEnd: 10,
 * //     rsat: 19,
 * //     waterLevelUsual: 0,
 * //     waterLevelDesign: 0,
 * //     sv: 137.5,
 * //     svpUsual: 63.925,
 * //     svpDesign: 63.925,
 * //     depth: 7.5
 * //   },
 * //   {
 * //     depthStart: 10,
 * //     depthEnd: 20,
 * //     rsat: 20,
 * //     waterLevelUsual: 0,
 * //     waterLevelDesign: 0,
 * //     sv: 285,
 * //     svpUsual: 137.85,
 * //     svpDesign: 137.85,
 * //     depth: 15
 * //   }
 * // ] 137.85
 *
 * waterLevelUsual = 20
 * waterLevelDesign = 20
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         rd: 18, //kN/m3
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *         rd: 18, //kN/m3
 *     },
 *     {
 *         depthStart: 10,
 *         depthEnd: 20,
 *         rd: 18, //kN/m3
 *     },
 * ]
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
 * console.log(rowsNew, (18) * 15) //地下 15(m) 處之垂直總應力與垂直有效應力為 270(kN/m2)
 * // => [
 * //   {
 * //     depthStart: 0,
 * //     depthEnd: 5,
 * //     rd: 18,
 * //     waterLevelUsual: 20,
 * //     waterLevelDesign: 20,
 * //     sv: 45,
 * //     svpUsual: 45,
 * //     svpDesign: 45,
 * //     depth: 2.5
 * //   },
 * //   {
 * //     depthStart: 5,
 * //     depthEnd: 10,
 * //     rd: 18,
 * //     waterLevelUsual: 20,
 * //     waterLevelDesign: 20,
 * //     sv: 135,
 * //     svpUsual: 135,
 * //     svpDesign: 135,
 * //     depth: 7.5
 * //   },
 * //   {
 * //     depthStart: 10,
 * //     depthEnd: 20,
 * //     rd: 18,
 * //     waterLevelUsual: 20,
 * //     waterLevelDesign: 20,
 * //     sv: 270,
 * //     svpUsual: 270,
 * //     svpDesign: 270,
 * //     depth: 15
 * //   }
 * // ] 270
 *
 * waterLevelUsual = 3
 * waterLevelDesign = 3
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 3,
 *         rd: 18, //kN/m3
 *     },
 *     {
 *         depthStart: 3,
 *         depthEnd: 11,
 *         rsat: 20, //kN/m3
 *     },
 * ]
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
 * console.log(rowsNew, 18 * 3 + (20 * 4 - 9.81 * 4)) //地下 7(m) 處之垂直有效應力為 94.76(kN/m2)
 * // => [
 * //   {
 * //     depthStart: 0,
 * //     depthEnd: 3,
 * //     rd: 18,
 * //     waterLevelUsual: 3,
 * //     waterLevelDesign: 3,
 * //     sv: 27,
 * //     svpUsual: 27,
 * //     svpDesign: 27,
 * //     depth: 1.5
 * //   },
 * //   {
 * //     depthStart: 3,
 * //     depthEnd: 11,
 * //     rsat: 20,
 * //     waterLevelUsual: 3,
 * //     waterLevelDesign: 3,
 * //     sv: 134,
 * //     svpUsual: 94.75999999999999,
 * //     svpDesign: 94.75999999999999,
 * //     depth: 7
 * //   }
 * // ] 94.75999999999999
 *
 * waterLevelUsual = 3
 * waterLevelDesign = 3
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 1,
 *         rd: 18, //kN/m3
 *     },
 *     {
 *         depthStart: 1,
 *         depthEnd: 5,
 *         rd: 18, //kN/m3
 *         rsat: 20, //kN/m3
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 9,
 *         rsat: 20, //kN/m3
 *     },
 * ]
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
 * console.log(rowsNew, 18 * 3 + (20 * 4 - 9.81 * 4)) //地下 7(m) 處之垂直有效應力為 94.76(kN/m2)
 * // => [
 * //   {
 * //     depthStart: 0,
 * //     depthEnd: 1,
 * //     rd: 18,
 * //     waterLevelUsual: 3,
 * //     waterLevelDesign: 3,
 * //     sv: 9,
 * //     svpUsual: 9,
 * //     svpDesign: 9,
 * //     depth: 0.5
 * //   },
 * //   {
 * //     depthStart: 1,
 * //     depthEnd: 5,
 * //     rd: 18,
 * //     rsat: 20,
 * //     waterLevelUsual: 3,
 * //     waterLevelDesign: 3,
 * //     sv: 56,
 * //     svpUsual: 56,
 * //     svpDesign: 56,
 * //     depth: 3
 * //   },
 * //   {
 * //     depthStart: 5,
 * //     depthEnd: 9,
 * //     rsat: 20,
 * //     waterLevelUsual: 3,
 * //     waterLevelDesign: 3,
 * //     sv: 134,
 * //     svpUsual: 94.75999999999999,
 * //     svpDesign: 94.75999999999999,
 * //     depth: 7
 * //   }
 * // ] 94.75999999999999
 *
 * waterLevelUsual = 3
 * waterLevelDesign = 0
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 1,
 *         rd: 18, //kN/m3
 *         rsat: 20, //kN/m3
 *     },
 *     {
 *         depthStart: 1,
 *         depthEnd: 5,
 *         rd: 18, //kN/m3
 *         rsat: 20, //kN/m3
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 9,
 *         rsat: 20, //kN/m3
 *     },
 * ]
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
 * console.log(rowsNew, 18 * 3 + (20 * 4 - 9.81 * 4), (20 - 9.81) * 7) //地下 7(m) 處之常時垂直有效應力為 94.76(kN/m2), 設計垂直有效應力為 71.33(kN/m2)
 * // => [
 * //   {
 * //     depthStart: 0,
 * //     depthEnd: 1,
 * //     rd: 18,
 * //     rsat: 20,
 * //     waterLevelUsual: 3,
 * //     waterLevelDesign: 0,
 * //     sv: 9,
 * //     svpUsual: 9,
 * //     svpDesign: 5.095,
 * //     depth: 0.5
 * //   },
 * //   {
 * //     depthStart: 1,
 * //     depthEnd: 5,
 * //     rd: 18,
 * //     rsat: 20,
 * //     waterLevelUsual: 3,
 * //     waterLevelDesign: 0,
 * //     sv: 56,
 * //     svpUsual: 56,
 * //     svpDesign: 30.57,
 * //     depth: 3
 * //   },
 * //   {
 * //     depthStart: 5,
 * //     depthEnd: 9,
 * //     rsat: 20,
 * //     waterLevelUsual: 3,
 * //     waterLevelDesign: 0,
 * //     sv: 134,
 * //     svpUsual: 94.75999999999999,
 * //     svpDesign: 71.33,
 * //     depth: 7
 * //   }
 * // ] 94.75999999999999 71.33
 *
 */
function calcVerticalStress(rows, opt = {}) {

    //check
    if (!isearr(rows)) {
        throw new Error(`無有效數據`)
    }

    //unitSvSvp
    let unitSvSvp = get(opt, 'unitSvSvp')
    if (unitSvSvp !== 'kPa' && unitSvSvp !== 'MPa') {
        throw new Error(`opt.unitSvSvp[${unitSvSvp}] need kPa or MPa`)
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
    rows = cloneDeep(rows)

    //checkDepthStartEnd
    let ckds = checkDepthStartEnd(rows, opt)
    if (size(ckds) > 0) {
        throw new Error(join(ckds, '; '))
    }

    //sortBy
    rows = sortBy(rows, (v) => {
        return cdbl(v[keyDepthStart])
    })

    //waterLevelUsual
    let waterLevelUsual = get(opt, 'waterLevelUsual')
    if (!isnum(waterLevelUsual)) {
        waterLevelUsual = 0
    }
    waterLevelUsual = cdbl(waterLevelUsual)

    //waterLevelDesign
    let waterLevelDesign = get(opt, 'waterLevelDesign')
    if (!isnum(waterLevelDesign)) {
        waterLevelDesign = 0
    }
    waterLevelDesign = cdbl(waterLevelDesign)

    //usual
    let rowsUsual = core(rows, waterLevelUsual, { keyDepth, keyDepthStart, keyDepthEnd })
    // console.log('rowsUsual[0]', rowsUsual[0])

    //design
    let rowsDesign = core(rows, waterLevelDesign, { keyDepth, keyDepthStart, keyDepthEnd })
    // console.log('rowsDesign[0]', rowsDesign[0])

    //each
    rows = map(rows, (v, k) => {

        //save water
        v.waterLevelUsual = waterLevelUsual
        v.waterLevelDesign = waterLevelDesign

        //sv, svpUsual, svpDesign(kN/m2)
        let vUsual = rowsUsual[k]
        let vDesign = rowsDesign[k]
        v.sv = vUsual.sv //地下水位差異僅影響垂直有效應力, 故垂直總應力使用常時資料
        v.svpUsual = vUsual.svp //主要是給液化分析時CN與CRR使用, 其需使用鑽探時地下水位所計算得垂直有效應力
        v.svpDesign = vDesign.svp
        v[keyDepth] = vUsual[keyDepth] //重算中點深度

        return v
    })

    //unitSvSvp, 此處限制用kPa, 故指定為輸出MPa才要轉MPa
    if (unitSvSvp === 'MPa') {
        rows = map(rows, (v) => {
            v.sv /= 1000
            v.svpUsual /= 1000
            v.svpDesign /= 1000
            return v
        })
    }

    return rows
}


export {
    checkVerticalStress,
    calcVerticalStress
}
export default { //整合輸出預設得要有default
    checkVerticalStress,
    calcVerticalStress
}
