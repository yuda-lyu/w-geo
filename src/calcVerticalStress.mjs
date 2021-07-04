import map from 'lodash/map'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import size from 'lodash/size'
import join from 'lodash/join'
import cdbl from 'wsemi/src/cdbl.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import cnst from './cnst.mjs'
import checkDepthStartEnd from './checkDepthStartEnd.mjs'


//rw, 水單位重(kN/m3)
let rw = cnst.rw


/**
 * 計算樣本數據垂直總應力與有效應力
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/checkDepthStartEnd.test.js Github}
 * @memberOf w-geo
 * @param {Array} waterLevel 輸入地下水位數字，單位為m
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart，單位m)與結束深度(depthEnd，單位m)，位於地下水位以上之樣本需提供乾單位重(rd，單位kN/m3)，位於地下水位以下之樣本需提供飽和單位重(rsat，單位kN/m3)，若地下水位位於該樣本起訖深度內，則需同時提供乾單位重與飽和單位重
 * @returns {Array} 回傳計算後數據陣列
 * @example
 *
 * let waterLevel
 * let rows
 * let rowsNew
 *
 * waterLevel = 0
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
 * rowsNew = calcVerticalStress(waterLevel, rows)
 * console.log(rowsNew, (18 - 9.81) * 15) //地下 15(m) 處之垂直有效應力為 122.85(kN/m2)
 * // => [
 * //     {
 * //       depthStart: 0,
 * //       depthEnd: 5,
 * //       rsat: 18,
 * //       waterLevel: 0,
 * //       sv: 45,
 * //       svp: 20.474999999999998,
 * //       zsv: 2.5
 * //     },
 * //     {
 * //       depthStart: 5,
 * //       depthEnd: 10,
 * //       rsat: 18,
 * //       waterLevel: 0,
 * //       sv: 135,
 * //       svp: 61.425,
 * //       zsv: 7.5
 * //     },
 * //     {
 * //       depthStart: 10,
 * //       depthEnd: 20,
 * //       rsat: 18,
 * //       waterLevel: 0,
 * //       sv: 270,
 * //       svp: 122.85,
 * //       zsv: 15
 * //     }
 * // ]
 *
 * waterLevel = 0
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
 * rowsNew = calcVerticalStress(waterLevel, rows)
 * console.log(rowsNew, (19 - 9.81) * 15) //地下 15(m) 處之垂直有效應力為 137.85(kN/m2)
 * // => [
 * //     {
 * //       depthStart: 0,
 * //       depthEnd: 5,
 * //       rsat: 18,
 * //       waterLevel: 0,
 * //       sv: 45,
 * //       svp: 20.474999999999998,
 * //       zsv: 2.5
 * //     },
 * //     {
 * //       depthStart: 5,
 * //       depthEnd: 10,
 * //       rsat: 19,
 * //       waterLevel: 0,
 * //       sv: 137.5,
 * //       svp: 63.925,
 * //       zsv: 7.5
 * //     },
 * //     {
 * //       depthStart: 10,
 * //       depthEnd: 20,
 * //       rsat: 20,
 * //       waterLevel: 0,
 * //       sv: 285,
 * //       svp: 137.85,
 * //       zsv: 15
 * //     }
 * // ]
 *
 * waterLevel = 20
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
 * rowsNew = calcVerticalStress(waterLevel, rows)
 * console.log(rowsNew, (18) * 15) //地下 15(m) 處之垂直總應力與垂直有效應力為 270(kN/m2)
 * // => [
 * //     {
 * //       depthStart: 0,
 * //       depthEnd: 5,
 * //       rd: 18,
 * //       waterLevel: 20,
 * //       sv: 45,
 * //       svp: 45,
 * //       zsv: 2.5
 * //     },
 * //     {
 * //       depthStart: 5,
 * //       depthEnd: 10,
 * //       rd: 18,
 * //       waterLevel: 20,
 * //       sv: 135,
 * //       svp: 135,
 * //       zsv: 7.5
 * //     },
 * //     {
 * //       depthStart: 10,
 * //       depthEnd: 20,
 * //       rd: 18,
 * //       waterLevel: 20,
 * //       sv: 270,
 * //       svp: 270,
 * //       zsv: 15
 * //     }
 * // ]
 *
 * waterLevel = 3
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
 * rowsNew = calcVerticalStress(waterLevel, rows)
 * console.log(rowsNew) //地下 7(m) 處之垂直有效應力為 94.76(kN/m2)
 * // => [
 * //     {
 * //       depthStart: 0,
 * //       depthEnd: 3,
 * //       rd: 18,
 * //       waterLevel: 3,
 * //       sv: 27,
 * //       svp: 27,
 * //       zsv: 1.5
 * //     },
 * //     {
 * //       depthStart: 3,
 * //       depthEnd: 11,
 * //       rsat: 20,
 * //       waterLevel: 3,
 * //       sv: 134,
 * //       svp: 94.75999999999999,
 * //       zsv: 7
 * //     }
 * // ]
 *
 * waterLevel = 3
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
 * rowsNew = calcVerticalStress(waterLevel, rows)
 * console.log(rowsNew) //地下 7(m) 處之垂直有效應力為 94.76(kN/m2)
 * // => [
 * //     {
 * //       depthStart: 0,
 * //       depthEnd: 1,
 * //       rd: 18,
 * //       waterLevel: 3,
 * //       sv: 9,
 * //       svp: 9,
 * //       zsv: 0.5
 * //     },
 * //     {
 * //       depthStart: 1,
 * //       depthEnd: 5,
 * //       rd: 18,
 * //       rsat: 20,
 * //       waterLevel: 3,
 * //       sv: 56,
 * //       svp: 56,
 * //       zsv: 3
 * //     },
 * //     {
 * //       depthStart: 5,
 * //       depthEnd: 9,
 * //       rsat: 20,
 * //       waterLevel: 3,
 * //       sv: 134,
 * //       svp: 94.75999999999999,
 * //       zsv: 7
 * //     }
 * // ]
 *
 */
function calcVerticalStress(waterLevel, rows) {

    //cloneDeep
    rows = cloneDeep(rows)

    //check
    if (!isearr(rows)) {
        throw new Error(`樣本數據(rows)非有效陣列`)
    }

    //checkDepthStartEnd
    let ckds = checkDepthStartEnd(rows)
    if (size(ckds) > 0) {
        throw new Error(join(ckds, '; '))
    }

    //waterLevel
    if (!isnum(waterLevel)) {
        throw new Error(`地下水位(waterLevel)非數值`)
    }
    waterLevel = cdbl(waterLevel)

    //each
    let sv_bottom = 0
    rows = map(rows, (v, k) => {

        //save waterLevel
        v.waterLevel = waterLevel

        //ds, de
        let ds = get(v, 'depthStart', null)
        let de = get(v, 'depthEnd', null)

        //check
        if (!isnum(ds)) {
            throw new Error(`第 ${k} 樣本起始深度(depthStart)非數值: ${ds}`)
        }
        if (!isnum(de)) {
            throw new Error(`第 ${k} 樣本結束深度(depthEnd)非數值: ${de}`)
        }
        ds = cdbl(ds)
        de = cdbl(de)

        //rT, 使用單位重(kN/m3)
        let rT = null
        if (ds < waterLevel && de > waterLevel) {
            let rsat = get(v, 'rsat', null)
            if (!isnum(rsat)) {
                throw new Error(`第 ${k} 樣本飽和單位重(rsat)非數值: ${rsat}`)
            }
            let rd = get(v, 'rd', null)
            if (!isnum(rd)) {
                throw new Error(`第 ${k} 樣本乾單位重(rd)非數值: ${rd}`)
            }
            rd = cdbl(rd)
            let u = waterLevel - ds
            let d = de - waterLevel
            rT = (u * rd + d * rsat) / (u + d) //平均單位重
            // console.log('計算平均單位重', rT)
        }
        else if (de <= waterLevel) { //樣本結束深度小於等於地下水位, 代表整個樣本都在水上, 全乾
            let rd = get(v, 'rd', null)
            if (!isnum(rd)) {
                throw new Error(`第 ${k} 樣本乾單位重(rd)非數值: ${rd}`)
            }
            rT = rd
            // console.log('使用乾單位重rd', rT)
        }
        else if (ds >= waterLevel) { //樣本起始深度大於等於地下水位, 代表整個樣本都在水裡, 飽和
            let rsat = get(v, 'rsat', null)
            if (!isnum(rsat)) {
                throw new Error(`第 ${k} 樣本飽和單位重(rsat)非數值: ${rsat}`)
            }
            rT = rsat
            // console.log('使用飽和單位重rsat', rT)
        }
        else {
            throw new Error('非預期情形')
        }

        //層厚度(m)
        let dd = (de - ds)

        //sv, 土層中點深度之垂直總應力(kN/m2)
        let dsv = rT * dd
        let sv = sv_bottom + dsv / 2
        v.sv = sv

        //更新土層底部之垂直總應力
        sv_bottom += dsv

        //土層中點深度之水頭高(m)
        let dpp = Math.max(((ds + de) / 2 - waterLevel), 0)
        // console.log('dpp', dpp)

        //pp, 土層中點深度之水壓(kN/m2)
        let pp = dpp * rw
        // console.log('pp', pp)

        //svp, 土層中點深度之垂直有效應力(kN/m2)
        v.svp = sv - pp

        //zsv, 土層中點深度(m)
        v.zsv = (de + ds) / 2

        return v
    })

    return rows
}


export default calcVerticalStress
