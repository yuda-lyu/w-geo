import get from 'lodash/get'
import each from 'lodash/each'
import isNumber from 'lodash/isNumber'
import isnum from 'wsemi/src/isnum.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function getDepthMaxCeil(depth, interval) {

    //interval
    if (!isNumber(interval)) {
        interval = 0.1
    }

    //ceil
    depth = Math.ceil(depth / interval) * interval //以 interval(m)為單位, 取較大數值

    return depth
}


function getDepthMinFloor(depth, interval) {

    //interval
    if (!isNumber(interval)) {
        interval = 0.1
    }

    //ceil
    depth = Math.floor(depth / interval) * interval //以 interval(m)為單位, 取較大數值

    return depth
}


function getDepthMax(ltdt, opt = {}) {
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
            r = Math.max(r, cdbl(v[keyDepth])) //cpt只有depth
        }
    })

    //approximate
    if (approximate) {

        //getDepthMaxCeil
        r = getDepthMaxCeil(r)

    }

    return r
}


function getDepthMin(ltdt, opt = {}) {
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
            r = Math.min(r, cdbl(v[keyDepth])) //cpt只有depth
        }
    })

    //approximate
    if (approximate) {

        //getDepthMinFloor
        r = getDepthMinFloor(r)

    }

    return r
}


function getDepthMaxMin(ltdt, opt = {}) {

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

    //getDepthMax
    let depthMax = getDepthMax(ltdt, opt)

    //getDepthMin
    let depthMin = getDepthMin(ltdt, opt)

    return {
        depthMax,
        depthMin,
    }
}


export {
    getDepthMaxCeil,
    getDepthMinFloor,
    getDepthMax,
    getDepthMin,
    getDepthMaxMin
}
export default { //整合輸出預設得要有default
    getDepthMaxCeil,
    getDepthMinFloor,
    getDepthMax,
    getDepthMin,
    getDepthMaxMin
}
