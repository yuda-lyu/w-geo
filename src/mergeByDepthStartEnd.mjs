import get from 'lodash-es/get'
import each from 'lodash-es/each'
import map from 'lodash-es/map'
import size from 'lodash-es/size'
import join from 'lodash-es/join'
import sortBy from 'lodash-es/sortBy'
import pullAt from 'lodash-es/pullAt'
import filter from 'lodash-es/filter'
import cloneDeep from 'lodash-es/cloneDeep'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isarr from 'wsemi/src/isarr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import judge from './judge.mjs'
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
 * @param {Boolean} [opt.saveFromInds=false] 輸入是否儲存合併來源指標布林值，預設false
 * @param {String} [opt.keyInd='ind'] 輸入標記來源指標欄位字串，預設'ind'
 * @param {String} [opt.keyFromInds='fromInds'] 輸入儲存來源指標欄位字串，預設'fromInds'
 * @param {String} [opt.typeDetect='fromInds'] 輸入偵測合併機制字串，可選'sequence'、'iterate'，前者代表一次性偵測合併，後者代表迭代多次偵測合併，預設'sequence'
 * @param {Function} [opt.funMerge=null] 輸入字定義合併函數，輸入為v0與v1上下兩土層參數物件，回傳合併後參數物件，預設null
 * @param {String} [opt.typeMerge='down'] 輸入合併方向字串，可選'down'、'up'，前者代表以下層土層參數為主，後者以上層土層參數為主，預設'down'
 * @returns {Array} 回傳合併後的數據陣列
 * @example
 *
 * let rows
 * let rows
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
 * rows = mergeByDepthStartEnd(rows)
 * console.log(JSON.stringify(rows, null, 2))
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
 * rows = mergeByDepthStartEnd(rows, { keyDepthStart: 'ds', keyDepthEnd: 'de' })
 * console.log(JSON.stringify(rows, null, 2))
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
 * rows = mergeByDepthStartEnd(rows, { keyValue: 'data' })
 * console.log(JSON.stringify(rows, null, 2))
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
 * rows = mergeByDepthStartEnd(rows, {
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
 * console.log(JSON.stringify(rows, null, 2))
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
 * rows = mergeByDepthStartEnd(rows, { typeMerge: 'up' })
 * console.log(JSON.stringify(rows, null, 2))
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

    //check
    if (!isearr(rows)) {
        throw new Error(`無有效數據`)
    }

    // //keyDepthStart
    // let keyDepthStart = get(opt, 'keyDepthStart')
    // if (!isestr(keyDepthStart)) {
    //     keyDepthStart = 'depthStart'
    // }

    // //keyDepthEnd
    // let keyDepthEnd = get(opt, 'keyDepthEnd')
    // if (!isestr(keyDepthEnd)) {
    //     keyDepthEnd = 'depthEnd'
    // }

    // //keyValue
    // let keyValue = get(opt, 'keyValue')
    // if (!isestr(keyValue)) {
    //     keyValue = 'value'
    // }

    // //saveFromInds
    // let saveFromInds = get(opt, 'saveFromInds')
    // if (!isbol(saveFromInds)) {
    //     saveFromInds = false
    // }

    // //keyInd
    // let keyInd = get(opt, 'keyInd')
    // if (!isestr(keyInd)) {
    //     keyInd = 'ind'
    // }

    // //keyFromInds
    // let keyFromInds = get(opt, 'keyFromInds')
    // if (!isestr(keyFromInds)) {
    //     keyFromInds = 'fromInds'
    // }

    // //funMerge
    // let funMerge = get(opt, 'funMerge')
    // let useFunMerge = isfun(funMerge)

    // //typeMerge
    // let typeMerge = get(opt, 'typeMerge')
    // if (typeMerge !== 'up' && typeMerge !== 'down') {
    //     typeMerge = 'down'
    // }

    // //cloneDeep
    // rows = cloneDeep(rows)

    // //checkDepthStartEnd
    // let ckds = checkDepthStartEnd(rows, { keyDepthStart, keyDepthEnd })
    // if (size(ckds) > 0) {
    //     throw new Error(join(ckds, ', '))
    // }

    // //sortBy
    // rows = sortBy(rows, (v) => {
    //     return cdbl(v[keyDepthStart])
    // })

    // //saveFromInds
    // if (saveFromInds) {
    //     rows = map(rows, (v, k) => {
    //         if (!isnum(v[keyInd])) {
    //             v[keyInd] = k
    //         }
    //         return v
    //     })
    // }

    // //proc
    // let proc = (rows) => {

    //     //偵測合併, 前面已檢查checkDepthStartEnd, 故各樣本起訖深度為接合
    //     let b = false
    //     for (let k = 1; k < size(rows); k++) {

    //         //v0, v1
    //         let v0 = rows[k - 1]
    //         let v1 = rows[k]

    //         //ds0, de0, vl0
    //         let ds0 = get(v0, keyDepthStart, null)
    //         // let de0 = get(v0, keyDepthEnd, null)
    //         let vl0 = get(v0, keyValue, null)

    //         //ds1, de1, vl1
    //         // let ds1 = get(v1, keyDepthStart, null)
    //         let de1 = get(v1, keyDepthEnd, null)
    //         let vl1 = get(v1, keyValue, null)

    //         //check
    //         if (vl0 === vl1) {
    //             // console.log('v0', v0, 'v1', v1)

    //             //saveFromInds
    //             if (saveFromInds) {

    //                 //check
    //                 if (!isarr(v0[keyFromInds])) {
    //                     v0[keyFromInds] = [v0[keyInd]]
    //                 }

    //                 //check
    //                 if (!isarr(v1[keyFromInds])) {
    //                     v1[keyFromInds] = [v1[keyInd]]
    //                 }

    //                 //merge
    //                 v1[keyFromInds] = [
    //                     ...v0[keyFromInds],
    //                     ...v1[keyFromInds],
    //                 ]

    //             }

    //             //vm
    //             let vm = null
    //             if (useFunMerge) {

    //                 //r
    //                 vm = funMerge(v0, v1)

    //                 //check
    //                 if (!iseobj(vm)) {
    //                     throw new Error(`funMerge回傳[${vm}]非有效物件`)
    //                 }

    //             }
    //             else {
    //                 if (typeMerge === 'up') {
    //                     vm = {
    //                         ...v1,
    //                         ...v0,
    //                     }
    //                 }
    //                 else if (typeMerge === 'down') {
    //                     vm = {
    //                         ...v0,
    //                         ...v1,
    //                     }
    //                 }
    //             }

    //             //合併深度
    //             vm[keyDepthStart] = ds0
    //             vm[keyDepthEnd] = de1
    //             // console.log('vm', vm)

    //             //儲存合併與刪除
    //             rows = cloneDeep(rows)
    //             rows[k - 1] = vm
    //             pullAt(rows, k)
    //             // console.log('rows pullAt', rows)

    //             b = true
    //             break
    //         }

    //     }

    //     return {
    //         merge: b,
    //         rows,
    //     }
    // }

    // //while proc
    // let r = proc(rows)
    // while (r.merge) {
    //     r = proc(rows)
    //     rows = r.rows
    // }

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

    //saveFromInds
    let saveFromInds = get(opt, 'saveFromInds')
    if (!isbol(saveFromInds)) {
        saveFromInds = false
    }

    //keyInd
    let keyInd = get(opt, 'keyInd')
    if (!isestr(keyInd)) {
        keyInd = 'ind'
    }

    //keyFromInds
    let keyFromInds = get(opt, 'keyFromInds')
    if (!isestr(keyFromInds)) {
        keyFromInds = 'fromInds'
    }

    //typeDetect
    let typeDetect = get(opt, 'typeDetect')
    if (typeDetect !== 'sequence' && typeDetect !== 'iterate') {
        typeDetect = 'sequence'
    }

    //funMerge
    let funMerge = get(opt, 'funMerge')
    let useFunMerge = isfun(funMerge)

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

    //saveFromInds
    if (saveFromInds) {
        rows = map(rows, (v, k) => {
            if (!isnum(v[keyInd])) {
                v[keyInd] = k
            }
            return v
        })
    }

    //typeDetect
    if (typeDetect === 'iterate') {

        //proc
        let proc = (rows) => {

            //偵測合併, 前面已檢查checkDepthStartEnd, 故各樣本起訖深度為接合
            let b = false
            for (let k = 1; k < size(rows); k++) {

                //v0, v1
                let v0 = rows[k - 1]
                let v1 = rows[k]

                //ds0, de0, vl0
                let ds0 = get(v0, keyDepthStart, null)
                let de0 = get(v0, keyDepthEnd, null)
                let vl0 = get(v0, keyValue, null)

                //ds1, de1, vl1
                let ds1 = get(v1, keyDepthStart, null)
                let de1 = get(v1, keyDepthEnd, null)
                let vl1 = get(v1, keyValue, null)

                //check
                if (vl0 === null) {
                    console.log('v0', v0, 'keyValue', keyValue)
                    throw new Error(`invalid vl0`)
                }
                if (vl1 === null) {
                    console.log('v1', v1, 'keyValue', keyValue)
                    throw new Error(`invalid vl1`)
                }

                //check
                if (!isnum(ds0) || !isnum(de0) || !isnum(ds1) || !isnum(de1)) {
                    return true //跳出換下一個
                }

                //cdbl
                ds0 = cdbl(ds0)
                de0 = cdbl(de0)
                ds1 = cdbl(ds1)
                de1 = cdbl(de1)

                //check
                if (vl0 === vl1 && judge(de0, '===', ds1)) {
                // console.log('v0', v0, 'v1', v1)

                    //saveFromInds
                    if (saveFromInds) {

                        //check
                        if (!isarr(v0[keyFromInds])) {
                            v0[keyFromInds] = [v0[keyInd]]
                        }

                        //check
                        if (!isarr(v1[keyFromInds])) {
                            v1[keyFromInds] = [v1[keyInd]]
                        }

                        //merge
                        v1[keyFromInds] = [
                            ...v0[keyFromInds],
                            ...v1[keyFromInds],
                        ]

                    }

                    //vm
                    let vm = null
                    if (useFunMerge) {

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
                    rows[k - 1] = vm
                    pullAt(rows, k)
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

    }
    else if (typeDetect === 'sequence') {

        //偵測各層
        each(rows, (v, k) => {

            //check
            if (k === 0) {
                return true //跳出換下一個
            }

            //check
            if (!iseobj(v)) {
                throw new Error(`rows[${k}] is not an object`)
            }

            //v0, v1
            let v0 = get(rows, k - 1)
            let v1 = v

            //ds0, de0, vl0
            let ds0 = get(v0, keyDepthStart, null)
            let de0 = get(v0, keyDepthEnd, null)
            let vl0 = get(v0, keyValue, null)

            //ds1, de1, vl1
            let ds1 = get(v1, keyDepthStart, null)
            let de1 = get(v1, keyDepthEnd, null)
            let vl1 = get(v1, keyValue, null)

            //check
            if (vl0 === null) {
                console.log('v0', v0, 'keyValue', keyValue)
                throw new Error(`invalid vl0`)
            }
            if (vl1 === null) {
                console.log('v1', v1, 'keyValue', keyValue)
                throw new Error(`invalid vl1`)
            }

            //check
            if (!isnum(ds0) || !isnum(de0) || !isnum(ds1) || !isnum(de1)) {
                return true //跳出換下一個
            }

            //cdbl
            ds0 = cdbl(ds0)
            de0 = cdbl(de0)
            ds1 = cdbl(ds1)
            de1 = cdbl(de1)

            //check
            if (vl0 === vl1 && judge(de0, '===', ds1)) {

                //saveFromInds
                if (saveFromInds) {

                    //check
                    if (!isarr(v0[keyFromInds])) {
                        v0[keyFromInds] = [v0[keyInd]]
                    }

                    //check
                    if (!isarr(v1[keyFromInds])) {
                        v1[keyFromInds] = [v1[keyInd]]
                    }

                    //merge
                    v1[keyFromInds] = [
                        ...v0[keyFromInds],
                        ...v1[keyFromInds],
                    ]

                }

                //vm
                let vm = null
                if (useFunMerge) {

                    //r
                    vm = funMerge(v0, v1) //funMerge須回傳合併層參數, 除起始深度會自動給予上層, 其他參數得自行回傳

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

                //合併深度
                vm[keyDepthStart] = ds0
                vm[keyDepthEnd] = de1

                //儲存數據至下層
                rows[k] = vm

                //標注上層為null(待刪除)
                rows[k - 1] = null

            }

        })

        //filter
        rows = filter(rows, iseobj)

    }

    return rows
}


export default mergeByDepthStartEnd
