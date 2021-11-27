import each from 'lodash/each'
import map from 'lodash/map'
import get from 'lodash/get'
import size from 'lodash/size'
import join from 'lodash/join'
import pullAt from 'lodash/pullAt'
import uniq from 'lodash/uniq'
import cloneDeep from 'lodash/cloneDeep'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import arrInsert from 'wsemi/src/arrInsert.mjs'
import { judge } from './dm.mjs'
import checkDepthStartEnd from './checkDepthStartEnd.mjs'
import checkDepth from './checkDepth.mjs'


/**
 * 通過指定樣本(例如中點)深度對各樣本起訖深度進行分切
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/sepDepthStartEndByDepth.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart)與結束深度(depthEnd)，深度單位為m
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepth='depth'] 輸入中點深度欄位鍵值字串，預設'depth'
 * @param {String} [opt.keyDepthStart='depthStart'] 輸入欲儲存之起始深度欄位鍵值字串，預設'depthStart'
 * @param {String} [opt.keyDepthEnd='depthEnd'] 輸入欲儲存之結束深度欄位鍵值字串，預設'depthEnd'
 * @returns {Array} 回傳添加起訖深度的數據陣列
 * @example
 *
 * let rows
 * let points
 * let r
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         data: 'abc',
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *         data: 'def',
 *     },
 * ]
 * points = [{ depth: 2.5 }]
 * r = sepDepthStartEndByDepth(rows, points)
 * console.log(r)
 * // => [
 * //  { depthStart: 0, depthEnd: 2.5, data: 'abc' },
 * //  { depthStart: 2.5, depthEnd: 5, data: 'abc' },
 * //  { depthStart: 5, depthEnd: 10, data: 'def' }
 * //]
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         data: 'abc',
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *         data: 'def',
 *     },
 * ]
 * points = [{ depth: 0 }]
 * r = sepDepthStartEndByDepth(rows, points)
 * console.log(r)
 * // => [
 * //  { depthStart: 0, depthEnd: 5, data: 'abc' },
 * //  { depthStart: 5, depthEnd: 10, data: 'def' }
 * //]
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         data: 'abc',
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *         data: 'def',
 *     },
 * ]
 * points = [{ depth: 5 }]
 * r = sepDepthStartEndByDepth(rows, points)
 * console.log(r)
 * // => [
 * //  { depthStart: 0, depthEnd: 5, data: 'abc' },
 * //  { depthStart: 5, depthEnd: 10, data: 'def' }
 * //]
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         data: 'abc',
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *         data: 'def',
 *     },
 * ]
 * points = [{ depth: -1 }]
 * r = sepDepthStartEndByDepth(rows, points)
 * console.log(r)
 * // => [
 * //  { depthStart: 0, depthEnd: 5, data: 'abc' },
 * //  { depthStart: 5, depthEnd: 10, data: 'def' }
 * //]
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         data: 'abc',
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *         data: 'def',
 *     },
 * ]
 * points = [{ depth: 11 }]
 * r = sepDepthStartEndByDepth(rows, points)
 * console.log(r)
 * // => [
 * //  { depthStart: 0, depthEnd: 5, data: 'abc' },
 * //  { depthStart: 5, depthEnd: 10, data: 'def' }
 * //]
 *
 * rows = [
 *     {
 *         top_depth: 0,
 *         bottom_depth: 5,
 *         data: 'abc',
 *     },
 *     {
 *         top_depth: 5,
 *         bottom_depth: 10,
 *         data: 'def',
 *     },
 * ]
 * points = [{ center_depth: 5.5 }]
 * r = sepDepthStartEndByDepth(rows, points, { keyDepthStart: 'top_depth', keyDepthEnd: 'bottom_depth', keyDepth: 'center_depth' })
 * console.log(r)
 * // => [
 * //  { top_depth: 0, bottom_depth: 5, data: 'abc' },
 * //  { top_depth: 5, bottom_depth: 5.5, data: 'def' },
 * //  { top_depth: 5.5, bottom_depth: 10, data: 'def' }
 * //]
 *
 */
function sepDepthStartEndByDepth(rows, points, opt = {}) {

    //check
    if (!isearr(rows)) {
        throw new Error('無有效資料')
    }

    //check
    if (!isearr(points)) {
        return rows
    }

    //keyDepthStart, 為rows內各元素必須有的鍵
    let keyDepthStart = get(opt, 'keyDepthStart')
    if (!isestr(keyDepthStart)) {
        keyDepthStart = 'depthStart'
    }

    //keyDepthEnd, 為rows內各元素必須有的鍵
    let keyDepthEnd = get(opt, 'keyDepthEnd')
    if (!isestr(keyDepthEnd)) {
        keyDepthEnd = 'depthEnd'
    }

    //keyDepth, 為points內各元素必須有的鍵
    let keyDepth = get(opt, 'keyDepth')
    if (!isestr(keyDepth)) {
        keyDepth = 'depth'
    }

    //cloneDeep
    rows = cloneDeep(rows)

    //checkDepthStartEnd
    let ckds = checkDepthStartEnd(rows, { keyDepthStart, keyDepthEnd })
    if (size(ckds) > 0) {
        throw new Error(join(ckds, ', '))
    }

    //checkDepth
    let ckd = checkDepth(points, { keyDepth })
    if (size(ckd) > 0) {
        throw new Error(join(ckd, ', '))
    }

    //depthInserts, 欲分割的深度
    let depthInserts = map(points, (v) => {
        return v[keyDepth]
    })

    //uniq
    depthInserts = uniq(depthInserts)

    //wrap
    let wrap = (rows, di) => {

        //cloneDeep
        rows = cloneDeep(rows)

        //detect
        each(rows, (v, k) => {

            //ds, de
            let ds = get(v, keyDepthStart, null)
            let de = get(v, keyDepthEnd, null)
            ds = cdbl(ds)
            de = cdbl(de)

            //check
            //if (di > ds && di < de) {
            if (judge(di, '>', ds) && judge(di, '<', de)) { //需位於土層內, 故判斷中為不等於起訖深度

                //rowNew1, rowNew2
                let rowNew1 = cloneDeep(v)
                let rowNew2 = cloneDeep(v)
                rowNew1[keyDepthEnd] = di //結束深度換成內插值
                rowNew2[keyDepthStart] = di //起始深度換成di內插值

                //pullAt
                pullAt(rows, k)

                //arrInsert
                rows = arrInsert(rows, k, [rowNew1, rowNew2])

                return false //強制跳出, 一次只插入一個, 故rows也需滿足checkDepthStartEnd
            }

        })

        return rows
    }

    //wrap
    each(depthInserts, (di) => {
        rows = wrap(rows, di)
    })

    return rows
}


export default sepDepthStartEndByDepth
