import get from 'lodash-es/get.js'
import set from 'lodash-es/set.js'
import each from 'lodash-es/each.js'
import size from 'lodash-es/size.js'
import isNumber from 'lodash-es/isNumber.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import cdbl from 'wsemi/src/cdbl.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'


function gv(rows, key, k) {
    let v = get(rows, `${k}.${key}`)
    if (isnum(v)) {
        v = cdbl(v)
    }
    else {
        v = null
    }
    return v
}


function findJump(rows, keyDepth, keyValue) {
    let jps = []
    each(rows, (dt, k) => {
        if (k === 0) {
            return true //跳出換下一個
        }
        let d0 = gv(rows, keyDepth, k - 1) //'depth(m)'
        let v0 = gv(rows, keyValue, k - 1)
        let v1 = gv(rows, keyValue, k)
        if (isnum(v0) && !isnum(v1)) {
            jps.push({
                k: k - 1,
                depth: d0,
                value: v0,
            })
        }
    })
    return jps
}


function getSuitableBefore(rows, keyDepth, keyValue, indJump, searchLen, closedValue, opt = {}) {
    return getSuitable(rows, keyDepth, keyValue, indJump, searchLen, closedValue, { dir: 'before', ...opt })
}


function getSuitableAfter(rows, keyDepth, keyValue, indJump, searchLen, closedValue, opt = {}) {
    return getSuitable(rows, keyDepth, keyValue, indJump, searchLen, closedValue, { dir: 'after', ...opt })
}


function getSuitable(rows, keyDepth, keyValue, indJump, searchLen, closedValue, opt = {}) {

    //dir
    let dir = get(opt, 'dir')
    if (dir !== 'before' && dir !== 'after') {
        dir = 'after'
    }

    //searchMode
    let searchMode = get(opt, 'searchMode')
    if (searchMode !== 'all' && searchMode !== 'no' && searchMode !== 'peak' && searchMode !== 'half-closed-value' && searchMode !== 'double-closed-value' && searchMode !== 'closed-value') {
        searchMode = 'all'
    }
    // console.log('getSuitableAfter searchMode', searchMode)

    //check rows
    if (size(rows) === 0) {
        return null
    }

    //no search
    if (searchMode === 'no') {
        return {
            k: indJump,
            depth: get(rows, `${indJump}.${keyDepth}`),
            value: get(rows, `${indJump}.${keyValue}`),
        }
    }

    //check closedValue
    if (!isnum(closedValue)) {
        return {
            k: indJump,
            depth: get(rows, `${indJump}.${keyDepth}`),
            value: get(rows, `${indJump}.${keyValue}`),
        }
    }

    //d1
    let d1 = gv(rows, keyDepth, indJump)

    //tps
    let tps = []
    if (dir === 'after') {
        for (let k = indJump + 1; k < size(rows) - 1; k++) {
            let d2 = gv(rows, keyDepth, k)
            let v2 = gv(rows, keyValue, k)
            let outRange = Math.abs(d2 - d1) > searchLen
            tps.push({
                k,
                depth: d2,
                value: v2,
                outRange,
            })
        }
    }
    else {
        for (let k = indJump - 1; k > 0; k--) {
            let d0 = gv(rows, keyDepth, k)
            let v0 = gv(rows, keyValue, k)
            let outRange = Math.abs(d0 - d1) > searchLen
            tps.push({
                k,
                depth: d0,
                value: v0,
                outRange,
            })
        }
    }

    //ps
    let ps = []
    for (let k = 0; k < tps.length; k++) {
        let tp = tps[k]
        if (isNumber(tp.depth)) {
            if (tp.outRange && size(ps) > 0) { //至少有找到1個點才可跳出, 否則超過searchLen繼續找
                break
            }
            if (isNumber(tp.value)) {
                ps.push(tp)
            }
        }
    }
    // console.log('ps', ps)

    //check
    if (size(ps) === 0) {
        return null
    }

    //往下找第一個peak
    if (searchMode === 'all' || searchMode === 'peak') {
        for (let i = 1; i < ps.length - 1; i++) {
            let p0 = ps[i - 1]
            let p1 = ps[i + 0]
            let p2 = ps[i + 1]
            let r = 1
            if (closedValue !== 0) { //closedValue非0才計算r, 否則就使用1直接視為在有效值域內
                r = p1.value / closedValue
            }
            if (p1.value >= p0.value && p1.value >= p2.value && p0.value !== p2.value && r > 0.5 && r < 2) { //尋覓值至少要大於0.5*closedValue與小於2*closedValue
                return {
                    k: p1.k,
                    depth: p1.depth,
                    value: p1.value,
                }
            }
        }
    }

    //往下找在range內找最靠近closedValue的點
    if (searchMode === 'all' || searchMode === 'closed-value') {
        let diff = 1e20
        let vbest = null
        for (let i = 0; i < ps.length; i++) {
            let p1 = ps[i + 0]
            if (p1.outRange) {
                break //跳出迴圈, 已超過range
            }
            let difft = Math.abs(p1.value - closedValue) //尋覓值最接近closedValue/2
            if (diff > difft) {
                diff = difft
                vbest = {
                    k: p1.k,
                    depth: p1.depth,
                    value: p1.value,
                }
            }
        }
        if (vbest !== null) {
            return vbest
        }
    }

    //往下找最靠近closedValue/2的點
    let vbestLow = null
    if (searchMode === 'all' || searchMode === 'half-closed-value') {
        let diff = 1e20
        let vbest = null
        for (let i = 0; i < ps.length; i++) {
            let p1 = ps[i + 0]
            let difft = Math.abs(p1.value - closedValue / 2) //尋覓值最接近closedValue/2
            if (diff > difft) {
                diff = difft
                vbest = {
                    diff,
                    k: p1.k,
                    depth: p1.depth,
                    value: p1.value,
                }
            }
        }
        if (vbest !== null) {
            vbestLow = vbest
        }
    }

    //往下找最靠近closedValue*1.5的點
    let vbestUp = null
    if (searchMode === 'all' || searchMode === 'double-closed-value') {
        let diff = 1e20
        let vbest = null
        for (let i = 0; i < ps.length; i++) {
            let p1 = ps[i + 0]
            let difft = Math.abs(p1.value - closedValue * 1.5) //尋覓值最接近closedValue*1.5
            if (diff > difft) {
                diff = difft
                vbest = {
                    diff,
                    k: p1.k,
                    depth: p1.depth,
                    value: p1.value,
                }
            }
        }
        if (vbest !== null) {
            vbestUp = vbest
        }
    }

    //check
    if (vbestLow !== null && vbestUp === null) {
        delete vbestLow.diff
        return vbestLow
    }
    else if (vbestLow === null && vbestUp !== null) {
        delete vbestUp.diff
        return vbestUp
    }
    else if (vbestLow === null && vbestUp === null) {
        //比對vbestLow(closedValue/2)與vbestUp(closedValue*1.5), 選差值最小的回傳
        let vbest = null
        if (vbestLow.diff <= vbestUp.diff) {
            vbest = vbestLow
        }
        else {
            vbest = vbestUp
        }
        delete vbest.diff
        return vbest
    }

    return null
}


function cmpLinearFill(rows, keys, k0, k1) {

    //check
    if (k0 === k1) {
        return
    }
    else if (k0 > k1) {
        throw new Error('k0 > k1')
    }

    //cloneDeep
    let rowsTemp = cloneDeep(rows)

    //keys
    each(keys, (key) => {

        //v0, v1
        let v0 = gv(rows, key, k0)
        let v1 = gv(rows, key, k1)
        let len = k1 - k0

        //set
        for (let k = k0; k <= k1; k++) {
            let w0 = (k - k0) / len
            let w1 = (k1 - k) / len
            let v = w1 * v0 + w0 * v1
            // console.log('set', key, 'w0, w1', w0, w1, 'k, v', k, v, 'v0', v0, 'v1', v1)
            set(rowsTemp, `${k}.${key}`, v)
        }

    })

    return rowsTemp
}


function cmpCut(rows, keys, k0, k1) {

    //check
    if (k0 === k1) {
        return
    }
    else if (k0 > k1) {
        throw new Error('k0 > k1')
    }

    //cloneDeep
    let rowsTemp = cloneDeep(rows)

    //keys
    each(keys, (key) => {

        //set
        for (let k = k0; k <= k1; k++) {
            set(rowsTemp, `${k}.${key}`, '')
        }

    })

    return rowsTemp
}


/**
 * 數據急墜段偵測與處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/complementDepthData.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含深度(depth，單位m)與任意數值
 * @param {String} keyDepth 輸入深度欄位字串
 * @param {String} keyValue 輸入偵測數值欄位字串
 * @param {Array} keysValueCmp 輸入偵測數值與連帶處理欄位陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.searchLen=0.5] 輸入偵測有效深度範圍數字，單位m，預設0.5
 * @param {String} [opt.beforeSearchMode='no'] 輸入偵測急墜段時之往上提取起始點方式字串，可選'all'、'no'、'peak'、'half-closed-value'、'double-closed-value'、'closed-value'，預設'no'
 * @param {String} [opt.afterSearchMode='all'] 輸入偵測急墜段時之往下提取結束點方式字串，可選'all'、'no'、'peak'、'half-closed-value'、'double-closed-value'、'closed-value'，預設'all'
 * @param {String} [opt.cmpMode='linear-fill'] 輸入偵測急墜段並標註起訖點時之處理方式字串，可選'linear-fill'、'cut'，預設'linear-fill'
 * @returns {Array} 回傳計算後數據陣列
 * @example
 *
 * let rows = [
 *     {
 *         'depth(m)': 0,
 *         'qc(MPa)': 0,
 *         'fs(MPa)': 0,
 *         'u2(MPa)': 0,
 *     },
 *     {
 *         'depth(m)': 0.1,
 *         'qc(MPa)': 0.12,
 *         'fs(MPa)': 0.02,
 *         'u2(MPa)': 0.05,
 *     },
 * ]
 *
 * let keyDepth = 'depth(m)'
 * let keyValue = 'qc(MPa)'
 * let keysValueCmp = ['qc(MPa)', 'fs(MPa)', 'u2(MPa)']
 *
 * let rsFill = complementDepthData(rows, keyDepth, keyValue, keysValueCmp, { cmpMode: 'linear-fill' })
 *
 * let rsCut = complementDepthData(rows, keyDepth, keyValue, keysValueCmp, { cmpMode: 'cut' })
 *
 */
function complementDepthData(rows, keyDepth, keyValue, keysValueCmp, opt = {}) {

    //check
    if (!isestr(keyDepth)) {
        throw new Error('invalid keyDepth')
    }
    if (!isestr(keyValue)) {
        throw new Error('invalid keyValue')
    }
    if (!isearr(keysValueCmp)) {
        throw new Error('invalid keysValueCmp')
    }

    //cloneDeep
    rows = cloneDeep(rows)

    //searchLen
    let searchLen = get(opt, 'searchLen')
    if (!isnum(searchLen)) {
        searchLen = 0.5
    }

    //beforeSearchMode
    let beforeSearchMode = get(opt, 'beforeSearchMode')
    if (beforeSearchMode !== 'all' && beforeSearchMode !== 'no' && beforeSearchMode !== 'peak' && beforeSearchMode !== 'half-closed-value' && beforeSearchMode !== 'double-closed-value' && beforeSearchMode !== 'closed-value') {
        beforeSearchMode = 'no'
    }

    //afterSearchMode
    let afterSearchMode = get(opt, 'afterSearchMode')
    if (afterSearchMode !== 'all' && afterSearchMode !== 'no' && afterSearchMode !== 'peak' && afterSearchMode !== 'half-closed-value' && afterSearchMode !== 'double-closed-value' && afterSearchMode !== 'closed-value') {
        afterSearchMode = 'all'
    }

    //cmpMode
    let cmpMode = get(opt, 'cmpMode')
    if (cmpMode !== 'linear-fill' && cmpMode !== 'cut') {
        cmpMode = 'linear-fill'
    }

    //findJump
    let jps = findJump(rows, keyDepth, keyValue)
    // console.log('jps', jps)

    each(jps, (jp) => {
        // console.log('jp', jp)

        //getSuitableBefore
        let pbef = null
        pbef = getSuitableBefore(rows, keyDepth, keyValue, jp.k, searchLen, get(jp, 'value'), { searchMode: beforeSearchMode })

        //check
        if (pbef === null) {
            return true //跳出換下一個
        }
        // console.log('pbef', pbef)

        //getSuitableAfter
        let paft = null
        paft = getSuitableAfter(rows, keyDepth, keyValue, jp.k, searchLen, get(pbef, 'value') || get(jp, 'value'), { searchMode: afterSearchMode })

        //check
        if (paft === null) {
            return true //跳出換下一個
        }
        // console.log('paft', paft)

        //cmpLinearFill
        if (cmpMode === 'linear-fill') {
            rows = cmpLinearFill(rows, keysValueCmp, pbef.k, paft.k)
        }
        else if (cmpMode === 'cut') {
            rows = cmpCut(rows, keysValueCmp, pbef.k, paft.k)
        }

    })

    return rows
}


export default complementDepthData
