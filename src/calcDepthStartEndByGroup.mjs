import each from 'lodash-es/each'
import map from 'lodash-es/map'
import get from 'lodash-es/get'
import size from 'lodash-es/size'
import keys from 'lodash-es/keys'
import join from 'lodash-es/join'
import sortBy from 'lodash-es/sortBy'
import pullAt from 'lodash-es/pullAt'
import cloneDeep from 'lodash-es/cloneDeep'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import judge from './judge.mjs'
import calcDepthStartEndByDepth from './calcDepthStartEndByDepth.mjs'


/**
 * 由樣本指定鍵值作為群組代號，並依照樣本中點深度提取各群組之起訖深度
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/calcDepthStartEndByGroup.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart)與結束深度(depthEnd)，深度單位為m
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepth='depth'] 輸入中點深度欄位鍵值字串，預設'depth'
 * @param {String} [opt.keyGroup='group'] 輸入群組代號欄位鍵值字串，預設'group'
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
 *         depth: 0,
 *         group: 'a',
 *     },
 *     {
 *         depth: 6,
 *         group: 'b',
 *     },
 *     {
 *         depth: 20,
 *         group: 'c',
 *     },
 * ]
 * rs = calcDepthStartEndByGroup(rows)
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "group": "a",
 * //     "depthStart": 0,
 * //     "depthEnd": 3,
 * //     "rows": [
 * //       {
 * //         "depth": 0,
 * //         "group": "a",
 * //         "depthStart": 0,
 * //         "depthEnd": 3
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "group": "b",
 * //     "depthStart": 3,
 * //     "depthEnd": 13,
 * //     "rows": [
 * //       {
 * //         "depth": 6,
 * //         "group": "b",
 * //         "depthStart": 3,
 * //         "depthEnd": 13
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "group": "c",
 * //     "depthStart": 13,
 * //     "depthEnd": 20,
 * //     "rows": [
 * //       {
 * //         "depth": 20,
 * //         "group": "c",
 * //         "depthStart": 13,
 * //         "depthEnd": 20
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 * rows = [
 *     {
 *         depth: 2,
 *         group: 'a',
 *     },
 *     {
 *         depth: 6,
 *         group: 'b',
 *     },
 *     {
 *         depth: 20,
 *         group: 'c',
 *     },
 * ]
 * rs = calcDepthStartEndByGroup(rows, { depthEndMax: 25 })
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "group": "a",
 * //     "depthStart": 0,
 * //     "depthEnd": 4,
 * //     "rows": [
 * //       {
 * //         "depth": 2,
 * //         "group": "a",
 * //         "depthStart": 0,
 * //         "depthEnd": 4
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "group": "b",
 * //     "depthStart": 4,
 * //     "depthEnd": 13,
 * //     "rows": [
 * //       {
 * //         "depth": 6,
 * //         "group": "b",
 * //         "depthStart": 4,
 * //         "depthEnd": 13
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "group": "c",
 * //     "depthStart": 13,
 * //     "depthEnd": 25,
 * //     "rows": [
 * //       {
 * //         "depth": 20,
 * //         "group": "c",
 * //         "depthStart": 13,
 * //         "depthEnd": 25
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 * rows = [
 *     {
 *         depth: 0,
 *         group: 'a',
 *     },
 *     {
 *         depth: 2,
 *         group: 'a',
 *     },
 *     {
 *         depth: 4,
 *         group: 'b',
 *     },
 *     {
 *         depth: 6,
 *         group: 'b',
 *     },
 *     {
 *         depth: 8,
 *         group: 'b',
 *     },
 *     {
 *         depth: 10,
 *         group: 'c',
 *     },
 *     {
 *         depth: 12,
 *         group: 'b',
 *     },
 *     {
 *         depth: 14,
 *         group: 'c',
 *     },
 *     {
 *         depth: 16,
 *         group: 'b',
 *     },
 *     {
 *         depth: 18,
 *         group: 'b',
 *     },
 *     {
 *         depth: 30,
 *         group: 'd',
 *     },
 * ]
 * rs = calcDepthStartEndByGroup(rows)
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "group": "a",
 * //     "depthStart": 0,
 * //     "depthEnd": 3,
 * //     "rows": [
 * //       {
 * //         "depth": 0,
 * //         "group": "a",
 * //         "depthStart": 0,
 * //         "depthEnd": 1
 * //       },
 * //       {
 * //         "depth": 2,
 * //         "group": "a",
 * //         "depthStart": 1,
 * //         "depthEnd": 3
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "group": "b",
 * //     "depthStart": 3,
 * //     "depthEnd": 9,
 * //     "rows": [
 * //       {
 * //         "depth": 4,
 * //         "group": "b",
 * //         "depthStart": 3,
 * //         "depthEnd": 5
 * //       },
 * //       {
 * //         "depth": 6,
 * //         "group": "b",
 * //         "depthStart": 5,
 * //         "depthEnd": 7
 * //       },
 * //       {
 * //         "depth": 8,
 * //         "group": "b",
 * //         "depthStart": 7,
 * //         "depthEnd": 9
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "group": "c",
 * //     "depthStart": 9,
 * //     "depthEnd": 11,
 * //     "rows": [
 * //       {
 * //         "depth": 10,
 * //         "group": "c",
 * //         "depthStart": 9,
 * //         "depthEnd": 11
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "group": "b",
 * //     "depthStart": 11,
 * //     "depthEnd": 13,
 * //     "rows": [
 * //       {
 * //         "depth": 12,
 * //         "group": "b",
 * //         "depthStart": 11,
 * //         "depthEnd": 13
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "group": "c",
 * //     "depthStart": 13,
 * //     "depthEnd": 15,
 * //     "rows": [
 * //       {
 * //         "depth": 14,
 * //         "group": "c",
 * //         "depthStart": 13,
 * //         "depthEnd": 15
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "group": "b",
 * //     "depthStart": 15,
 * //     "depthEnd": 24,
 * //     "rows": [
 * //       {
 * //         "depth": 16,
 * //         "group": "b",
 * //         "depthStart": 15,
 * //         "depthEnd": 17
 * //       },
 * //       {
 * //         "depth": 18,
 * //         "group": "b",
 * //         "depthStart": 17,
 * //         "depthEnd": 24
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "group": "d",
 * //     "depthStart": 24,
 * //     "depthEnd": 30,
 * //     "rows": [
 * //       {
 * //         "depth": 30,
 * //         "group": "d",
 * //         "depthStart": 24,
 * //         "depthEnd": 30
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 */
function calcDepthStartEndByGroup(rows, opt = {}) {
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

    //keyGroup
    let keyGroup = get(opt, 'keyGroup')
    if (!isestr(keyGroup)) {
        keyGroup = 'group'
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

    //判斷中點深度需為有效數字
    each(rows, (v, k) => {

        //dc
        let dc = get(v, keyDepth, null)

        //check
        if (!isnum(dc)) {
            errs.push(`第 ${k} 樣本中點深度${keyDepth}[${dc}]非有效數字`)
        }

        //g
        let g = get(v, keyGroup, '')

        //check
        if (!isestr(g) && !isnum(g)) {
            errs.push(`第 ${k} 樣本群組代號${keyGroup}[${g}]非有效字串或數字`)
        }

    })

    //check
    if (size(errs) > 0) {
        throw new Error(join(errs, '; '))
    }

    //sortBy
    rows = sortBy(rows, (v) => {
        return cdbl(v[keyDepth])
    })

    //check
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
        if (judge(dc0, '>=', dc1)) {
            errs.push(`第 ${k - 1} 樣本之中點深度${keyDepth}[${dc0}]大於等於第 ${k} 樣本之中點深度${keyDepth}[${dc1}]`)
        }

    })

    //check
    if (size(errs) > 0) {
        throw new Error(join(errs, '; '))
    }

    //ks,ng
    let kg = {}
    each(rows, (v) => {
        let k = v[keyGroup]
        kg[k] = true
    })
    let ks = keys(kg) //全部群組代號陣列
    let ng = size(ks) //群數

    //check
    if (ng === 0) {
        throw new Error('無有效群數')
    }

    //calcDepthStartEndByDepth
    rows = calcDepthStartEndByDepth(rows, { keyDepth, keyDepthStart, keyDepthEnd, depthEndMax })

    //ts, 備份
    let ts = cloneDeep(rows)

    //merge
    let k = -1
    while (true) {
        k++

        //check
        if (k >= size(rows) - 1) { //遇到最後1層就跳出
            break
        }

        //v0, v1, v2
        // let v0 = get(rows, k - 1)
        let v1 = get(rows, k)
        let v2 = get(rows, k + 1)

        //g0, g1, g2
        // let g0 = get(v0, keyGroup, null)
        let g1 = get(v1, keyGroup, 'g1')
        let g2 = get(v2, keyGroup, 'g2')

        //detect
        if (g1 === g2) {
            rows[k][keyDepthEnd] = rows[k + 1][keyDepthEnd] //下層深度儲存至本層
            pullAt(rows, k + 1) //刪除下層
            k--
        }

    }

    //pure
    let rs = map(rows, (v) => {
        return {
            [keyGroup]: v[keyGroup],
            [keyDepthStart]: v[keyDepthStart],
            [keyDepthEnd]: v[keyDepthEnd],
        }
    })

    //add rows
    rs = map(rs, (v) => {
        let ds = v[keyDepthStart]
        let de = v[keyDepthEnd]

        let rdels = [] //本群(輪)可刪除的ts指標
        let rrows = [] //本群(輪)所屬的ts樣本
        each(ts, (t, kt) => {
            let rdc = t[keyDepth]
            if (judge(rdc, '>=', ds) && judge(rdc, '<=', de)) {
                rdels.push(kt)
                rrows.push(t)
            }
            if (judge(rdc, '>', de)) {
                return false //break
            }
        })

        //save
        v.rows = cloneDeep(rrows)

        //pullAt
        pullAt(ts, rdels)

        return v
    })

    return rs
}


export default calcDepthStartEndByGroup
