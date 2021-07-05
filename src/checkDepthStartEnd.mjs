import each from 'lodash/each'
import get from 'lodash/get'
import cdbl from 'wsemi/src/cdbl.mjs'
import isnum from 'wsemi/src/isnum.mjs'


/**
 * 檢核樣本數據內起訖深度是否有效與連續
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/checkDepthStartEnd.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart)與結束深度(depthEnd)，深度單位為m
 * @returns {Array} 回傳錯誤訊息陣列
 * @example
 *
 * let rows
 * let errs
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *     },
 *     {
 *         depthStart: 10,
 *         depthEnd: 20,
 *     },
 * ]
 * errs = checkDepthStartEnd(rows)
 * console.log(errs)
 * // => []
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *     },
 *     {
 *         depthStart: 10,
 *         depthEnd: 20,
 *     },
 * ]
 * errs = checkDepthStartEnd(rows)
 * console.log(errs)
 * // => [ '第 1 樣本結束深度depthEnd[5]不等於第 2 個樣本起始深度depthStart[10]' ]
 *
 * rows = [
 *     {
 *         depthStart: '0',
 *         depthEnd: '5',
 *     },
 *     {
 *         depthStart: '5',
 *         depthEnd: '10',
 *     },
 * ]
 * errs = checkDepthStartEnd(rows)
 * console.log(errs)
 * // => []
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
 * errs = checkDepthStartEnd(rows)
 * console.log(errs)
 * // => [
 * //     '第 0 樣本起始深度非有效數字: depthStart[0], depthEnd[abc]',
 * //     '第 1 樣本起始深度非有效數字: depthStart[abc], depthEnd[10]'
 * // ]
 *
 */
function checkDepthStartEnd(rows) {
    let errs = []

    //判斷各樣本起始深度需為有效數字
    each(rows, (v, k) => {

        //ds, de
        let ds = get(v, 'depthStart', null)
        let de = get(v, 'depthEnd', null)

        //check
        if (!isnum(ds)) {
            errs.push(`第 ${k} 樣本起始depthStart[${ds}]深度非有效數字`)
        }
        if (!isnum(de)) {
            errs.push(`第 ${k} 樣本結束depthEnd[${de}]深度非有效數字`)
        }

    })

    //each
    each(rows, (v, k) => {
        if (k === 0) {
            return true
        }

        //v0
        let v0 = get(rows, k - 1)
        let v1 = v

        //ds, de
        // let ds0 = get(v0, 'depthStart', null)
        let de0 = get(v0, 'depthEnd', null)
        let ds1 = get(v1, 'depthStart', null)
        // let de1 = get(v1, 'depthEnd', null)

        //比較「上個結束深度」與「下個起始深度」
        let t1 = de0 === ds1 //原數值(不論是字串或數值型別)相等
        let t2 = cdbl(de0) === cdbl(ds1) //數值相等
        let b = t1 || t2 //有字串或數值相等則視為相等
        if (!b) {
            errs.push(`第 ${k} 樣本結束深度depthEnd[${de0}]不等於第 ${k + 1} 個樣本起始深度depthStart[${ds1}]`)
        }

    })

    return errs
}


export default checkDepthStartEnd
