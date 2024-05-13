import get from 'lodash-es/get.js'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import estmOcr from './estmOcr.mjs'


function dtEstmOcr(dt, opt = {}) {

    //keyCompressiveStrength
    let keyCompressiveStrength = get(opt, 'keyCompressiveStrength')
    if (!isestr(keyCompressiveStrength)) {
        keyCompressiveStrength = 'compressiveStrength'
    }

    // //keySvp, svp的key不提供修改
    // let keySvp = get(opt, 'keySvp')
    // if (!isestr(keySvp)) {
    //     keySvp = 'svp'
    // }

    //keyOcr
    let keyOcr = get(opt, 'keyOcr')
    if (!isestr(keyOcr)) {
        keyOcr = 'ocr'
    }

    //compressiveStrength, svp
    let compressiveStrength = get(dt, keyCompressiveStrength, null)
    let svp = get(dt, 'svp', null) //svp的key不提供修改

    //check
    if (!isnum(compressiveStrength)) {
        throw new Error(`compressiveStrength[${compressiveStrength}] is not a number`)
    }
    if (!isnum(svp)) {
        throw new Error(`svp[${svp}] is not a number`)
    }

    //estmOcr
    let r = estmOcr(compressiveStrength, svp, opt)
    r = {
        ...dt,
        [keyCompressiveStrength]: r.compressiveStrength,
        svp: r.svp, //svp的key不提供修改
        [keyOcr]: r.ocr,
    }

    return r
}


export default dtEstmOcr
