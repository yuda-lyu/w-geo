import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import isNumber from 'lodash-es/isNumber.js'
import isnum from 'wsemi/src/isnum.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function calcDepthMaxCeil(depth, interval) {

    //interval
    if (!isNumber(interval)) {
        interval = 0.1
    }

    //ceil
    depth = Math.ceil(depth / interval) * interval //以 interval(m)為單位, 取較大數值

    return depth
}


function calcDepthMinFloor(depth, interval) {

    //interval
    if (!isNumber(interval)) {
        interval = 0.1
    }

    //ceil
    depth = Math.floor(depth / interval) * interval //以 interval(m)為單位, 取較大數值

    return depth
}


function calcDepthMax(ltdt, opt = {}) {
    //取數據列最大深度

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

    //approximate
    let approximate = get(opt, 'approximate')
    if (!isbol(approximate)) {
        approximate = false
    }

    //r
    let r = -1e20
    each(ltdt, (v) => {
        if (isnum(v[keyDepthStart])) {
            r = Math.max(r, cdbl(v[keyDepthStart]))
        }
        if (isnum(v[keyDepthEnd])) {
            r = Math.max(r, cdbl(v[keyDepthEnd]))
        }
        if (isnum(v[keyDepth])) {
            r = Math.max(r, cdbl(v[keyDepth]))
        }
    })

    //approximate
    if (approximate) {

        //calcDepthMaxCeil
        r = calcDepthMaxCeil(r)

    }

    return r
}


function calcDepthMin(ltdt, opt = {}) {
    //取數據列最小深度

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

    //approximate
    let approximate = get(opt, 'approximate')
    if (!isbol(approximate)) {
        approximate = false
    }

    //r
    let r = 1e20
    each(ltdt, (v) => {
        if (isnum(v[keyDepthStart])) {
            r = Math.min(r, cdbl(v[keyDepthStart]))
        }
        if (isnum(v[keyDepthEnd])) {
            r = Math.min(r, cdbl(v[keyDepthEnd]))
        }
        if (isnum(v[keyDepth])) {
            r = Math.min(r, cdbl(v[keyDepth]))
        }
    })

    //approximate
    if (approximate) {

        //calcDepthMinFloor
        r = calcDepthMinFloor(r)

    }

    return r
}


function calcDepthMaxMin(ltdt, opt = {}) {

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

    //approximate
    let approximate = get(opt, 'approximate')
    if (!isbol(approximate)) {
        approximate = false
    }

    //calcDepthMax
    let depthMax = calcDepthMax(ltdt, opt)

    //calcDepthMin
    let depthMin = calcDepthMin(ltdt, opt)

    return {
        depthMax,
        depthMin,
    }
}


export {
    calcDepthMaxCeil,
    calcDepthMinFloor,
    calcDepthMax,
    calcDepthMin,
    calcDepthMaxMin
}
export default { //整合輸出預設得要有default
    calcDepthMaxCeil,
    calcDepthMinFloor,
    calcDepthMax,
    calcDepthMin,
    calcDepthMaxMin
}
