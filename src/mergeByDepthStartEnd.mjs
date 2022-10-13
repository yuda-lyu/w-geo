import get from 'lodash/get'
import size from 'lodash/size'
import join from 'lodash/join'
import sortBy from 'lodash/sortBy'
import pullAt from 'lodash/pullAt'
import cloneDeep from 'lodash/cloneDeep'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isfun from 'wsemi/src/isfun.mjs'
// import judge from './judge.mjs'
import checkDepthStartEnd from './checkDepthStartEnd.mjs'


/**
 * 基於各樣本之起訖深度與指定欄位值進行合併
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/mergeByDepthStartEnd.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart)與結束深度(depthEnd)，深度單位為m
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepthStart='depthStart'] 輸入欲儲存之起始深度欄位鍵值字串，預設'depthStart'
 * @param {String} [opt.keyDepthEnd='depthEnd'] 輸入欲儲存之結束深度欄位鍵值字串，預設'depthEnd'
 * @param {String} [opt.keyValue='value'] 輸入指定偵測欄位鍵值字串，預設'value'
 * @returns {Array} 回傳合併後的數據陣列
 * @example
 *
 * let rows
 * let rs
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         value: 'a',
 *         ext: 12.3,
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 7,
 *         value: 'b',
 *         ext: 12.4,
 *     },
 *     {
 *         depthStart: 7,
 *         depthEnd: 11,
 *         value: 'b',
 *         ext: 2.5,
 *     },
 *     {
 *         depthStart: 11,
 *         depthEnd: 15,
 *         value: 'a',
 *         ext: 2.3,
 *     },
 * ]
 * rs = mergeByDepthStartEnd(rows)
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "depthStart": 0,
 * //     "depthEnd": 5,
 * //     "value": "a",
 * //     "ext": 12.3
 * //   },
 * //   {
 * //     "depthStart": 5,
 * //     "depthEnd": 11,
 * //     "value": "b",
 * //     "ext": 2.5
 * //   },
 * //   {
 * //     "depthStart": 11,
 * //     "depthEnd": 15,
 * //     "value": "a",
 * //     "ext": 2.3
 * //   }
 * // ]
 *
 * rows = [
 *     {
 *         ds: 0,
 *         de: 5,
 *         value: 'a',
 *         ext: 12.3,
 *     },
 *     {
 *         ds: 5,
 *         de: 7,
 *         value: 'b',
 *         ext: 12.4,
 *     },
 *     {
 *         ds: 7,
 *         de: 11,
 *         value: 'b',
 *         ext: 2.5,
 *     },
 *     {
 *         ds: 11,
 *         de: 15,
 *         value: 'a',
 *         ext: 2.3,
 *     },
 * ]
 * rs = mergeByDepthStartEnd(rows, { keyDepthStart: 'ds', keyDepthEnd: 'de' })
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "ds": 0,
 * //     "de": 5,
 * //     "value": "a",
 * //     "ext": 12.3
 * //   },
 * //   {
 * //     "ds": 5,
 * //     "de": 11,
 * //     "value": "b",
 * //     "ext": 2.5
 * //   },
 * //   {
 * //     "ds": 11,
 * //     "de": 15,
 * //     "value": "a",
 * //     "ext": 2.3
 * //   }
 * // ]
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         data: 'a',
 *         ext: 12.3,
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 7,
 *         data: 'b',
 *         ext: 12.4,
 *     },
 *     {
 *         depthStart: 7,
 *         depthEnd: 11,
 *         data: 'b',
 *         ext: 2.5,
 *     },
 *     {
 *         depthStart: 11,
 *         depthEnd: 15,
 *         data: 'a',
 *         ext: 2.3,
 *     },
 * ]
 * rs = mergeByDepthStartEnd(rows, { keyValue: 'data' })
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "depthStart": 0,
 * //     "depthEnd": 5,
 * //     "data": "a",
 * //     "ext": 12.3
 * //   },
 * //   {
 * //     "depthStart": 5,
 * //     "depthEnd": 11,
 * //     "data": "b",
 * //     "ext": 2.5
 * //   },
 * //   {
 * //     "depthStart": 11,
 * //     "depthEnd": 15,
 * //     "data": "a",
 * //     "ext": 2.3
 * //   }
 * // ]
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         value: 'a',
 *         ext: 12.3,
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 7,
 *         value: 'b',
 *         ext: 12.4,
 *     },
 *     {
 *         depthStart: 7,
 *         depthEnd: 11,
 *         value: 'b',
 *         ext: 2.5,
 *     },
 *     {
 *         depthStart: 11,
 *         depthEnd: 15,
 *         value: 'b',
 *         ext: 2.3,
 *     },
 *     {
 *         depthStart: 15,
 *         depthEnd: 18,
 *         value: 'a',
 *         ext: 7.9,
 *     },
 * ]
 * rs = mergeByDepthStartEnd(rows, {
 *     funMerge: (v0, v1) => {
 *         return {
 *             // depthStart: null,
 *             // depthEnd: null,
 *             value: v1.value,
 *             ext: v1.ext,
 *             _v0: v0,
 *             _v1: v1,
 *         }
 *     }
 * })
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "depthStart": 0,
 * //     "depthEnd": 5,
 * //     "value": "a",
 * //     "ext": 12.3
 * //   },
 * //   {
 * //     "value": "b",
 * //     "ext": 2.3,
 * //     "_v0": {
 * //       "value": "b",
 * //       "ext": 2.5,
 * //       "_v0": {
 * //         "depthStart": 5,
 * //         "depthEnd": 7,
 * //         "value": "b",
 * //         "ext": 12.4
 * //       },
 * //       "_v1": {
 * //         "depthStart": 7,
 * //         "depthEnd": 11,
 * //         "value": "b",
 * //         "ext": 2.5
 * //       },
 * //       "depthStart": 5,
 * //       "depthEnd": 11
 * //     },
 * //     "_v1": {
 * //       "depthStart": 11,
 * //       "depthEnd": 15,
 * //       "value": "b",
 * //       "ext": 2.3
 * //     },
 * //     "depthStart": 5,
 * //     "depthEnd": 15
 * //   },
 * //   {
 * //     "depthStart": 15,
 * //     "depthEnd": 18,
 * //     "value": "a",
 * //     "ext": 7.9
 * //   }
 * // ]
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *         value: 'a',
 *         ext: 12.3,
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 7,
 *         value: 'b',
 *         ext: 12.4,
 *     },
 *     {
 *         depthStart: 7,
 *         depthEnd: 11,
 *         value: 'b',
 *         ext: 2.5,
 *     },
 *     {
 *         depthStart: 11,
 *         depthEnd: 15,
 *         value: 'b',
 *         ext: 2.3,
 *     },
 *     {
 *         depthStart: 15,
 *         depthEnd: 18,
 *         value: 'a',
 *         ext: 7.9,
 *     },
 * ]
 * rs = mergeByDepthStartEnd(rows, { typeMerge: 'up' })
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "depthStart": 0,
 * //     "depthEnd": 5,
 * //     "value": "a",
 * //     "ext": 12.3
 * //   },
 * //   {
 * //     "depthStart": 5,
 * //     "depthEnd": 15,
 * //     "value": "b",
 * //     "ext": 12.4
 * //   },
 * //   {
 * //     "depthStart": 15,
 * //     "depthEnd": 18,
 * //     "value": "a",
 * //     "ext": 7.9
 * //   }
 * // ]
 *
 */
function mergeByDepthStartEnd(rows, opt = {}) {
    // let errs = []

    //check
    if (!isearr(rows)) {
        throw new Error(`無有效數據`)
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

    //keyValue
    let keyValue = get(opt, 'keyValue')
    if (!isestr(keyValue)) {
        keyValue = 'value'
    }

    //funMerge
    let funMerge = get(opt, 'funMerge')

    //typeMerge
    let typeMerge = get(opt, 'typeMerge')
    if (typeMerge !== 'up' && typeMerge !== 'down') {
        typeMerge = 'down'
    }

    //cloneDeep
    rows = cloneDeep(rows)

    //checkDepthStartEnd
    let ckds = checkDepthStartEnd(rows, { keyDepthStart, keyDepthEnd })
    if (size(ckds) > 0) {
        throw new Error(join(ckds, ', '))
    }

    //sortBy
    rows = sortBy(rows, (v) => {
        return cdbl(v[keyDepthStart])
    })

    //proc
    let proc = (rows) => {

        //偵測合併, 前面已檢查checkDepthStartEnd, 故各樣本起訖深度為接合
        let b = false
        for (let i = 1; i < size(rows); i++) {

            //v0, v1
            let v0 = rows[i - 1]
            let v1 = rows[i]

            //ds0, de0, vl0
            let ds0 = get(v0, keyDepthStart, null)
            // let de0 = get(v0, keyDepthEnd, null)
            let vl0 = get(v0, keyValue, null)

            //ds1, de1, vl1
            // let ds1 = get(v1, keyDepthStart, null)
            let de1 = get(v1, keyDepthEnd, null)
            let vl1 = get(v1, keyValue, null)

            //check
            if (vl0 !== null && vl1 !== null && vl0 === vl1) {
                // console.log('v0', v0, 'v1', v1)

                //vm
                let vm = null
                if (isfun(funMerge)) {

                    //r
                    vm = funMerge(v0, v1)

                    //check
                    if (!iseobj(vm)) {
                        throw new Error(`funMerge回傳[${vm}]非有效物件`)
                    }

                }
                else {
                    if (typeMerge === 'up') {
                        vm = {
                            ...v1,
                            ...v0,
                        }
                    }
                    else if (typeMerge === 'down') {
                        vm = {
                            ...v0,
                            ...v1,
                        }
                    }
                }

                //更新起訖深度
                vm[keyDepthStart] = ds0
                vm[keyDepthEnd] = de1
                // console.log('vm', vm)

                //儲存合併與刪除
                rows = cloneDeep(rows)
                rows[i - 1] = vm
                pullAt(rows, i)
                // console.log('rows pullAt', rows)

                b = true
                break
            }

        }

        return {
            merge: b,
            rows,
        }
    }

    //while proc
    let r = proc(rows)
    while (r.merge) {
        r = proc(rows)
        rows = r.rows
    }

    return rows
}


export default mergeByDepthStartEnd
