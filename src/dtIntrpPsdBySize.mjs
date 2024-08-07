import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import get from 'lodash-es/get.js'
import j2o from 'wsemi/src/j2o.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import intrpPsdBySize from './intrpPsdBySize.mjs'


//partseStrArray
let partseStrArray = (c) => {
    let r = j2o(c)
    if (!isearr(r)) {
        // console.log('c', c)
        // throw new Error('無法解析JSON字串型陣列')
        return null
    }
    return r
}


function dtIntrpPsdBySize(dt, psizes, opt = {}) {

    //keyGSD
    let keyGSD = get(opt, 'keyGSD', '')
    if (!isestr(keyGSD)) {
        keyGSD = 'GSD'
    }

    //keyGSP
    let keyGSP = get(opt, 'keyGSP', '')
    if (!isestr(keyGSP)) {
        keyGSP = 'GSP'
    }

    //keySize
    let keySize = get(opt, 'keySize', '')
    if (!isestr(keySize)) {
        keySize = 'size'
    }

    //keyFraction
    let keyFraction = get(opt, 'keyFraction', '')
    if (!isestr(keyFraction)) {
        keyFraction = 'fraction'
    }

    //showLog
    let showLog = get(opt, 'showLog')
    if (!isbol(showLog)) {
        showLog = true
    }

    //GSD
    let GSD = get(dt, keyGSD, '')
    if (!isestr(GSD) && !isearr(GSD)) {
        if (showLog) console.log('dt', dt)
        throw new Error('invalid dt.GSD')
    }
    if (isestr(GSD)) {
        GSD = partseStrArray(GSD)
    }
    if (!isearr(GSD)) {
        if (showLog) console.log('dt', dt)
        if (showLog) console.log('dt[keyGSD]', dt[keyGSD])
        if (showLog) console.log('GSD', GSD)
        throw new Error('invalid dt.GSD')
    }
    // console.log('GSD', GSD)

    //GSP
    let GSP = get(dt, 'GSP', '')
    if (!isestr(GSP) && !isearr(GSP)) {
        if (showLog) console.log('dt', dt)
        throw new Error('invalid dt.GSP')
    }
    if (isestr(GSP)) {
        GSP = partseStrArray(GSP)
    }
    if (!isearr(GSP)) {
        if (showLog) console.log('dt', dt)
        if (showLog) console.log('dt[keyGSP]', dt[keyGSP])
        if (showLog) console.log('GSP', GSP)
        throw new Error('invalid dt.GSP')
    }
    // console.log('GSP', GSP)

    //one
    let one = false
    if (isnum(psizes)) {
        one = true
    }

    //psizes
    if (isnum(psizes)) {
        psizes = [cdbl(psizes)]
    }
    else if (!isearr(psizes)) {
        //ASTM
        psizes = [
            101.6,
            76.2,
            50.8,
            25.4,
            19.0,
            9.5,
            4.75,
            2.0,
            0.85,
            0.425,
            0.25,
            0.15,
            0.106,
            0.075,
            0.034,
            0.022,
            0.013,
            0.009,
            0.007,
            0.005,
            0.003,
            0.001,
        ]
        // //ISO
        // psizes = [
        //     630,
        //     200,
        //     63,
        //     20,
        //     6.3,
        //     2,
        //     0.63,
        //     0.2,
        //     0.063,
        //     0.02,
        //     0.0063,
        //     0.002,
        // ]
    }

    //fss
    let fss = []
    each(GSD, (_v, k) => {
        let size = get(GSD, k, '')
        if (!isnum(size)) {
            if (showLog) console.log(k, 'size', size)
            throw new Error(`size[${size}] is not an effective number`)
        }
        size = cdbl(size)
        let fraction = get(GSP, k, '')
        if (!isnum(fraction)) {
            if (showLog) console.log(k, 'fraction', fraction)
            throw new Error(`fraction[${fraction}] is not an effective number`)
        }
        fraction = cdbl(fraction)
        fss.push({
            [keySize]: size,
            [keyFraction]: fraction,
        })
    })
    // console.log('fss', fss)

    //重算各size處之通過百分比
    let rts = intrpPsdBySize(fss, psizes, { keySize, keyFraction })
    rts = map(rts, (fraction, k) => {
        let size = get(psizes, k)
        return {
            [keySize]: size,
            [keyFraction]: fraction,
        }
    })
    // console.log('rts', rts)

    //r
    let r = rts
    if (one) {
        r = rts[0]
    }

    return r
}


export default dtIntrpPsdBySize
