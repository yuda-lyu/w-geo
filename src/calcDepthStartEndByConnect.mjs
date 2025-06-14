import each from 'lodash-es/each.js'
import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import join from 'lodash-es/join.js'
import isNumber from 'lodash-es/isNumber.js'
import sortBy from 'lodash-es/sortBy.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import judge from 'wsemi/src/judge.mjs'


/**
 * 調整各樣本起訖深度成為各層互相接續狀態
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/calcDepthStartEndByConnect.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart)與結束深度(depthEnd)，深度單位為m
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepthStart='depthStart'] 輸入欲儲存之起始深度欄位鍵值字串，預設'depthStart'
 * @param {String} [opt.keyDepthEnd='depthEnd'] 輸入欲儲存之結束深度欄位鍵值字串，預設'depthEnd'
 * @param {Number} [opt.depthEndMax=null] 輸入最大結束深度數字，若最深樣本的結束深度若小於depthEndMax，則自動給予depthEndMax，預設null
 * @returns {Array} 回傳群組化後添加起訖深度與所屬原數據的陣列
 * @example
 *
 * let rows
 * let rs
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 4,
 *     },
 *     {
 *         depthStart: 6,
 *         depthEnd: 10,
 *     },
 *     {
 *         depthStart: 11,
 *         depthEnd: 15,
 *     },
 * ]
 * rs = calcDepthStartEndByConnect(rows)
 * console.log(rs)
 * // => [
 * //   { depthStart: 0, depthEnd: 5 },
 * //   { depthStart: 5, depthEnd: 10.5 },
 * //   { depthStart: 10.5, depthEnd: 15 }
 * // ]
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *     },
 *     {
 *         depthStart: 4,
 *         depthEnd: 15,
 *     },
 * ]
 * try {
 *     rs = calcDepthStartEndByConnect(rows)
 * }
 * catch (err) {
 *     rs = err.toString()
 * }
 * console.log(rs)
 * // => Error: 第 0 樣本之結束深度depthEnd[5]大於第 1 樣本之起點深度depthStart[4]
 *
 * rows = [
 *     {
 *         depthStart: '0',
 *         depthEnd: '4',
 *     },
 *     {
 *         depthStart: '6',
 *         depthEnd: '10',
 *     },
 * ]
 * rs = calcDepthStartEndByConnect(rows)
 * console.log(rs)
 * // => [ { depthStart: '0', depthEnd: 5 }, { depthStart: 5, depthEnd: '10' } ]
 *
 * rows = [
 *     {
 *         depthStart: '0',
 *         depthEnd: 'abc',
 *     },
 *     {
 *         depthStart: 'abc',
 *         depthEnd: '10',
 *     },
 * ]
 * try {
 *     rs = calcDepthStartEndByConnect(rows)
 * }
 * catch (err) {
 *     rs = err.toString()
 * }
 * console.log(rs)
 * // => Error: 第 0 樣本結束深度depthEnd[abc]非有效數字, 第 1 樣本起始深度depthStart[abc]非有效數字
 *
 * rows = [
 *     {
 *         top_depth: 0,
 *         bottom_depth: 4,
 *     },
 *     {
 *         top_depth: 6,
 *         bottom_depth: 10,
 *     },
 * ]
 * rs = calcDepthStartEndByConnect(rows, { keyDepthStart: 'top_depth', keyDepthEnd: 'bottom_depth' })
 * console.log(rs)
 * // => [
 * //   { top_depth: 0, bottom_depth: 5 },
 * //   { top_depth: 5, bottom_depth: 10 }
 * // ]
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 4,
 *     },
 *     {
 *         depthStart: 6,
 *         depthEnd: 10,
 *     },
 *     {
 *         depthStart: 11,
 *         depthEnd: 15,
 *     },
 * ]
 * rs = calcDepthStartEndByConnect(rows, { depthEndMax: 20 })
 * console.log(rs)
 * // => [
 * //   { depthStart: 0, depthEnd: 5 },
 * //   { depthStart: 5, depthEnd: 10.5 },
 * //   { depthStart: 10.5, depthEnd: 20 }
 * // ]
 *
 */
function calcDepthStartEndByConnect(rows, opt = {}) {
    let errs = []

    //check
    if (!isearr(rows)) {
        throw new Error('無有效資料')
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

    //depthEndMax
    let depthEndMax = get(opt, 'depthEndMax')
    if (isnum(depthEndMax)) {
        depthEndMax = cdbl(depthEndMax)
    }
    else {
        depthEndMax = null
    }

    //cloneDeep
    rows = cloneDeep(rows)

    //判斷各樣本起訖深度需為有效數字
    each(rows, (v, k) => {

        //ds, de
        let ds = get(v, keyDepthStart, null)
        let de = get(v, keyDepthEnd, null)

        //check
        if (!isnum(ds)) {
            errs.push(`第 ${k} 樣本起始深度${keyDepthStart}[${ds}]非有效數字`)
        }
        if (!isnum(de)) {
            errs.push(`第 ${k} 樣本結束深度${keyDepthEnd}[${de}]非有效數字`)
        }

    })

    //check
    if (size(errs) > 0) {
        throw new Error(join(errs, ', '))
    }

    //sortBy
    rows = sortBy(rows, (v) => {
        return cdbl(v[keyDepthStart])
    })

    //判斷上層樣本結束深度不得大於下層樣本起始深度
    each(rows, (v, k) => {
        if (k === 0) {
            return true
        }

        //de0, ds1
        let de0 = get(rows, `${k - 1}.${keyDepthEnd}`, null)
        let ds1 = get(v, keyDepthStart, null)
        de0 = cdbl(de0)
        ds1 = cdbl(ds1)

        //check
        if (judge(de0, '>', ds1)) {
            errs.push(`第 ${k - 1} 樣本之結束深度${keyDepthEnd}[${de0}]大於第 ${k} 樣本之起點深度${keyDepthStart}[${ds1}]`)
        }

    })

    //check
    if (size(errs) > 0) {
        throw new Error(join(errs, ', '))
    }

    //each
    each(rows, (v, k) => {
        if (k === 0) {
            return true
        }

        //de0, ds1
        let de0 = get(rows, `${k - 1}.${keyDepthEnd}`, null)
        let ds1 = get(v, keyDepthStart, null)
        de0 = cdbl(de0)
        ds1 = cdbl(ds1)

        //check
        if (judge(de0, '<', ds1)) {
            let dc = (de0 + ds1) / 2
            rows[k - 1][keyDepthEnd] = dc
            rows[k + 0][keyDepthStart] = dc
        }

    })

    //depthEndMax
    if (isNumber(depthEndMax)) {
        let up = size(rows) - 1
        let rowsEnd = rows[up]
        let de = rowsEnd[keyDepthEnd]
        if (judge(de, '<', depthEndMax)) {
            rows[up][keyDepthEnd] = depthEndMax
        }
    }

    return rows
}


export default calcDepthStartEndByConnect
