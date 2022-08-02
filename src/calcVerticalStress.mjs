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


function core(rows, waterLevel) {

    //cloneDeep
    rows = cloneDeep(rows)

    //each
    let sv_bottom = 0
    rows = map(rows, (v, k) => {

        //err
        let err = get(v, 'err', '')

        //ds, de
        let ds = get(v, 'depthStart', null)
        let de = get(v, 'depthEnd', null)

        try {

            //check
            if (!isnum(ds)) {
                throw new Error(`第 ${k} 樣本起始深度(depthStart)非數值: ${ds}`)
            }
            if (!isnum(de)) {
                throw new Error(`第 ${k} 樣本結束深度(depthEnd)非數值: ${de}`)
            }
            ds = cdbl(ds)
            de = cdbl(de)

            //depth, 土層中點深度(m)
            v.depth = (de + ds) / 2

            //rT, 使用單位重(kN/m3)
            let rT = null
            if (ds < waterLevel && de > waterLevel) { //樣本半乾半飽和
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
            }
            else if (de <= waterLevel) { //樣本結束深度小於等於地下水位, 代表整個樣本都在水上, 全乾
                let rd = get(v, 'rd', null)
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
            v.svp = Math.max(sv - pp, 0)

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
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign })
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
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign })
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
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign })
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
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign })
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
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign })
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
 * rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign })
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

    //cloneDeep
    rows = cloneDeep(rows)

    //check
    if (!isearr(rows)) {
        throw new Error(`樣本數據(rows)非有效陣列`)
    }

    //待補上可變更起訖深度鍵值

    //checkDepthStartEnd
    let ckds = checkDepthStartEnd(rows)
    if (size(ckds) > 0) {
        throw new Error(join(ckds, '; '))
    }

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
    let rowsUsual = core(rows, waterLevelUsual)

    //design
    let rowsDesign = core(rows, waterLevelDesign)

    //each
    rows = map(rows, (v, k) => {

        //save water
        v.waterLevelUsual = waterLevelUsual
        v.waterLevelDesign = waterLevelDesign

        //save stress
        let vUsual = rowsUsual[k]
        let vDesign = rowsDesign[k]
        v.sv = vUsual.sv //地下水位差異僅影響垂直有效應力, 故垂直總應力使用常時資料
        v.svpUsual = vUsual.svp //主要是給液化分析時CN與CRR使用, 其需使用鑽探時地下水位所計算得垂直有效應力
        v.svpDesign = vDesign.svp
        v.depth = vUsual.depth

        return v
    })

    return rows
}


export default calcVerticalStress
