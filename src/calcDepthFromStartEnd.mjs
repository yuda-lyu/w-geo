import each from 'lodash/each'
import get from 'lodash/get'
import size from 'lodash/size'
import join from 'lodash/join'
import sortBy from 'lodash/sortBy'
import cloneDeep from 'lodash/cloneDeep'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isnum from 'wsemi/src/isnum.mjs'


/**
 * 由樣本起訖深度反算中點深度
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/calcDepthFromStartEnd.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart)與結束深度(depthEnd)，深度單位為m
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepthStart='depthStart'] 輸入起始深度欄位鍵值字串，預設'depthStart'
 * @param {String} [opt.keyDepthEnd='depthEnd'] 輸入結束深度欄位鍵值字串，預設'depthEnd'
 * @param {String} [opt.keyDepth='depth'] 輸入欲儲存之中點深度欄位鍵值字串，預設'depth'
 * @returns {Array} 回傳添加起訖深度的數據陣列
 * @example
 *
 * let rows
 * let rs
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 3,
 *     },
 *     {
 *         depthStart: 3,
 *         depthEnd: 13,
 *     },
 *     {
 *         depthStart: 13,
 *         depthEnd: 20,
 *     },
 * ]
 * rs = calcDepthFromStartEnd(rows)
 * console.log(rs)
 * // => [
 * //   { depthStart: 0, depthEnd: 3, depth: 1.5 },
 * //   { depthStart: 3, depthEnd: 13, depth: 8 },
 * //   { depthStart: 13, depthEnd: 20, depth: 16.5 }
 * // ]
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 3,
 *     },
 *     {
 *         depthStart: 13,
 *         depthEnd: 20,
 *     },
 * ]
 * rs = calcDepthFromStartEnd(rows)
 * console.log(rs)
 * // => [
 * //   { depthStart: 0, depthEnd: 3, depth: 1.5 },
 * //   { depthStart: 13, depthEnd: 20, depth: 16.5 }
 * // ]
 *
 * rows = [
 *     {
 *         ds: 0,
 *         de: 3,
 *     },
 *     {
 *         ds: 3,
 *         de: 13,
 *     },
 *     {
 *         ds: 13,
 *         de: 20,
 *     },
 * ]
 * rs = calcDepthFromStartEnd(rows, { keyDepthStart: 'ds', keyDepthEnd: 'de', keyDepth: 'dc' })
 * console.log(rs)
 * // => [
 * //   { ds: 0, de: 3, dc: 1.5 },
 * //   { ds: 3, de: 13, dc: 8 },
 * //   { ds: 13, de: 20, dc: 16.5 }
 * // ]
 *
 */
function calcDepthFromStartEnd(rows, opt = {}) {
    let errs = []

    //check
    if (!isearr(rows)) {
        throw new Error('無有效資料')
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

    //判斷起訖深度需為有效數字
    each(rows, (v, k) => {

        //ds
        let ds = get(v, keyDepthStart, null)

        //check
        if (!isnum(ds)) {
            errs.push(`第 ${k} 樣本開始深度${keyDepthStart}[${ds}]非有效數字`)
        }

        //de
        let de = get(v, keyDepthEnd, null)

        //check
        if (!isnum(de)) {
            errs.push(`第 ${k} 樣本結束深度${keyDepthEnd}[${de}]非有效數字`)
        }

    })

    //check
    if (size(errs) > 0) {
        throw new Error(join(errs, '; '))
    }

    //sortBy
    rows = sortBy(rows, (v) => {
        return cdbl(v[keyDepthStart])
    })

    //計算中點深度
    each(rows, (v, k) => {

        //ds, de
        let ds = get(v, keyDepthStart, null)
        let de = get(v, keyDepthEnd, null)

        //cdbl
        ds = cdbl(ds)
        de = cdbl(de)

        //dc
        let dc = (ds + de) / 2

        //save
        v[keyDepth] = dc

    })

    return rows
}


export default calcDepthFromStartEnd
