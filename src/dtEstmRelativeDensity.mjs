import get from 'lodash-es/get.js'
import isestr from 'wsemi/src/isestr.mjs'
import estmRelativeDensity from './estmRelativeDensity.mjs'


function dtEstmRelativeDensity(dt, opt = {}) {

    //keyRd
    let keyRd = get(opt, 'keyRd')
    if (!isestr(keyRd)) {
        keyRd = 'rd'
    }

    //keyRdMin
    let keyRdMin = get(opt, 'keyRdMin')
    if (!isestr(keyRdMin)) {
        keyRdMin = 'rdMin'
    }

    //keyRdMax
    let keyRdMax = get(opt, 'keyRdMax')
    if (!isestr(keyRdMax)) {
        keyRdMax = 'rdMax'
    }

    //rd, rdMin, rdMax
    let rd = get(dt, keyRd, null)
    let rdMin = get(dt, keyRdMin, null)
    let rdMax = get(dt, keyRdMax, null)

    //estmRelativeDensity
    let r = estmRelativeDensity(rd, rdMin, rdMax, opt)
    r = {
        ...dt,
        ...r,
    }

    return r
}


export default dtEstmRelativeDensity
