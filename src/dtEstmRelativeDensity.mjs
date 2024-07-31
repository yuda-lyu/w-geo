import get from 'lodash-es/get.js'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isbol from 'wsemi/src/isbol.mjs'
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

    //keyDr
    let keyDr = get(opt, 'keyDr')
    if (!isestr(keyDr)) {
        keyDr = 'Dr'
    }

    //checkLimit
    let checkLimit = get(opt, 'checkLimit')
    if (!isbol(checkLimit)) {
        checkLimit = true
    }

    //showLog
    let showLog = get(opt, 'showLog')
    if (!isbol(showLog)) {
        showLog = true
    }

    //rd, rdMin, rdMax
    let rd = get(dt, keyRd, null)
    let rdMin = get(dt, keyRdMin, null)
    let rdMax = get(dt, keyRdMax, null)

    //check
    if (!isnum(rd)) {
        if (showLog) console.log('dt', dt)
        throw new Error(`rd[${rd}] is not a number`)
    }
    if (!isnum(rdMin)) {
        if (showLog) console.log('dt', dt)
        throw new Error(`rdMin[${rdMin}] is not a number`)
    }
    if (!isnum(rdMax)) {
        if (showLog) console.log('dt', dt)
        throw new Error(`rdMax[${rdMax}] is not a number`)
    }

    //estmRelativeDensity
    let r = estmRelativeDensity(rd, rdMin, rdMax, opt)
    r = {
        ...dt,
        [keyRd]: rd,
        [keyRdMin]: rdMin,
        [keyRdMax]: rdMax,
        [keyDr]: r.Dr,
    }

    return r
}


export default dtEstmRelativeDensity
