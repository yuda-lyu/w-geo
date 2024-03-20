import each from 'lodash-es/each'
import get from 'lodash-es/get'
import size from 'lodash-es/size'
import sortBy from 'lodash-es/sortBy'
import cloneDeep from 'lodash-es/cloneDeep'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import judge from './judge.mjs'


/**
 * 檢核樣本數據內深度是否有效與連續
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/checkDepth.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart)與結束深度(depthEnd)，深度單位為m
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepth='depth'] 輸入深度欄位鍵值字串，預設'depth'
 * @returns {Array} 回傳錯誤訊息陣列
 * @example
 *
 * let rows
 * let errs
 *
 * rows = [
 *     {
 *         depth: 0,
 *     },
 *     {
 *         depth: 5,
 *     },
 *     {
 *         depth: 10,
 *     },
 * ]
 * errs = checkDepth(rows)
 * console.log(errs)
 * // => []
 *
 * rows = [
 *     {
 *         depth: 0,
 *     },
 *     {
 *         depth: 10,
 *     },
 * ]
 * errs = checkDepth(rows)
 * console.log(errs)
 * // => []
 *
 * rows = [
 *     {
 *         depth: '0',
 *     },
 *     {
 *         depth: '5',
 *     },
 * ]
 * errs = checkDepth(rows)
 * console.log(errs)
 * // => []
 *
 * rows = [
 *     {
 *         depth: '0',
 *     },
 *     {
 *         depth: 'abc',
 *     },
 * ]
 * errs = checkDepth(rows)
 * console.log(errs)
 * // => [ '第 1 樣本中點深度depth[abc]非有效數字' ]
 *
 * rows = [
 *     {
 *         center_depth: 0,
 *     },
 *     {
 *         center_depth: 5,
 *     },
 * ]
 * errs = checkDepth(rows, { keyDepth: 'center_depth' })
 * console.log(errs)
 * // => []
 *
 */
function checkDepth(rows, opt = {}) {
    let errs = []

    //check
    if (!isearr(rows)) {
        return errs
    }

    //keyDepth
    let keyDepth = get(opt, 'keyDepth')
    if (!isestr(keyDepth)) {
        keyDepth = 'depth'
    }

    //cloneDeep
    rows = cloneDeep(rows)

    //判斷深度(例如中點)需為有效數字
    each(rows, (v, k) => {

        //dc
        let dc = get(v, keyDepth, null)

        //check
        if (!isnum(dc)) {
            errs.push(`第 ${k} 樣本中點深度${keyDepth}[${dc}]非有效數字`)
        }

    })

    //check
    if (size(errs) > 0) {
        return errs
    }

    //sortBy
    rows = sortBy(rows, (v) => {
        return cdbl(v[keyDepth])
    })

    //check, 排序後仍可能有同值, 故仍需檢核
    each(rows, (v, k) => {
        if (k === 0) {
            return true
        }

        //dc0, dc1
        let dc0 = get(rows, `${k - 1}.${keyDepth}`, null)
        let dc1 = get(v, keyDepth, null)
        dc0 = cdbl(dc0)
        dc1 = cdbl(dc1)

        //check
        //if (dc0 >= dc1) {
        if (judge(dc0, '>=', dc1)) {
            errs.push(`第 ${k - 1} 樣本之中點深度${keyDepth}[${dc0}]大於等於第 ${k} 樣本之中點深度${keyDepth}[${dc1}]`)
        }

    })

    return errs
}


export default checkDepth
