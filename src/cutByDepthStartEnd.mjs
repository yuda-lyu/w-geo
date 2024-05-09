import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import min from 'lodash-es/min.js'
import max from 'lodash-es/max.js'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'


function cutByDepthStartEnd(ltdt, depthStart, depthEnd, opt = {}) {

    //check depthStart
    if (!isnum(depthStart)) {
        throw new Error(`depthStart[${depthStart}] is not a number`)
    }
    depthStart = cdbl(depthStart)

    //check depthEnd
    if (!isnum(depthEnd)) {
        throw new Error(`depthEnd[${depthEnd}] is not a number`)
    }
    depthEnd = cdbl(depthEnd)

    //check depthStart<=depthEnd
    if (depthStart > depthEnd) {
        throw new Error(`depthStart[${depthStart}] > depthEnd[${depthEnd}]`)
    }

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

    //rs
    let rs = []
    each(ltdt, (v) => {

        //check
        if (!isnum(v[keyDepth])) {
            return true //跳出找下一個
        }

        //dc
        let dc = cdbl(v[keyDepth])
        let ds = cdbl(v[keyDepthStart])
        let de = cdbl(v[keyDepthEnd])

        //dmin, dmax
        let dmin = min([dc, ds, de])
        let dmax = max([dc, ds, de])

        //push
        if (dmin >= depthStart && dmax <= depthEnd) {
            rs.push(v)
        }

    })

    return rs
}


export default cutByDepthStartEnd
