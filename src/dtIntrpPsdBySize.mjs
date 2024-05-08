import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import get from 'lodash-es/get.js'
import j2o from 'wsemi/src/j2o.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import intrpPsdBySize from './intrpPsdBySize.mjs'


//parseStrArray
let parseStrArray = (c) => {
    let r = j2o(c)
    if (!isearr(r)) {
        console.log('c', c)
        throw new Error('無法解析JSON字串型陣列')
    }
    return r
}


function dtIntrpPsdBySize(dt, psizes, opt = {}) {

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

    //GSD
    let GSD = get(dt, 'GSD', '')
    if (!isestr(GSD) && !isearr(GSD)) {
        throw new Error('invalid GSD')
    }
    if (isestr(GSD)) {
        GSD = parseStrArray(GSD)
    }
    // console.log('GSD', GSD)

    //GSP
    let GSP = get(dt, 'GSP', '')
    if (!isestr(GSP) && !isearr(GSP)) {
        throw new Error('invalid GSP')
    }
    if (isestr(GSP)) {
        GSP = parseStrArray(GSP)
    }
    // console.log('GSP', GSP)

    //psizes
    if (!isearr(psizes)) {
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
            console.log(k, 'size', size)
            throw new Error(`size[${size}] is not an effective number`)
        }
        size = cdbl(size)
        let fraction = get(GSP, k, '')
        if (!isnum(fraction)) {
            console.log(k, 'fraction', fraction)
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
    let rs = intrpPsdBySize(fss, psizes, { keySize, keyFraction })
    rs = map(rs, (fraction, k) => {
        let size = get(psizes, k)
        return {
            [keySize]: size,
            [keyFraction]: fraction,
        }
    })
    // console.log('rs', rs)

    return rs
}


export default dtIntrpPsdBySize
