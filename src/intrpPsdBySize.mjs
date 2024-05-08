import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import filter from 'lodash-es/filter.js'
import map from 'lodash-es/map.js'
import maxBy from 'lodash-es/maxBy.js'
import minBy from 'lodash-es/minBy.js'
import isnum from 'wsemi/src/isnum.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import interp1 from 'wsemi/src/interp1.mjs'


function intrpPsdBySize(pfss, psizes, opt = {}) {

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

    //check
    let pfs0 = get(pfss, 0)
    let size0 = get(pfs0, keySize, '')
    let fraction0 = get(pfs0, keyFraction, '')
    if (!isnum(size0)) {
        throw new Error(`pfssp[0][${keySize}] is not an effective number`)
    }
    if (!isnum(fraction0)) {
        throw new Error(`fraction0[0][${keyFraction}] is not an effective number`)
    }

    //check
    if (!isnum(psizes) && !isearr(psizes)) {
        console.log('psizes', psizes)
        throw new Error('psizes is not a number or an effective array')
    }

    //one
    let one = false
    if (isnum(psizes)) {
        one = true
        psizes = [cdbl(psizes)]
    }

    //取粒徑size與fraction為數字, 且size大於0(因要轉log內插), fraction要大於等於0, 且無施篩孔時值為-1亦須剔除
    let rs = filter(pfss, (v) => {
        let bs = cdbl(v[keySize]) > 0
        let bf = cdbl(v[keyFraction]) >= 0
        // console.log('bs', bs, v[keySize])
        // console.log('bf', bf, v[keyFraction])
        return bs && bf
    })
    // console.log('rs', rs)

    //check
    if (size(rs) === 0) {
        console.log('pfss', pfss)
        throw new Error(`invalid rs`)
    }

    //lrs
    let lrs = map(rs, (v) => {
        v[keySize] = Math.log(v[keySize])
        return v
    })

    //sizeLogMax, sizeLogMin
    let sizeLogMax = maxBy(lrs, keySize)
    let sizeLogMin = minBy(lrs, keySize)

    //ifs
    let ifs = map(psizes, (psize) => {

        //sizeLog
        let sizeLog = Math.log(psize)
        // console.log('psize', psize)
        // console.log('sizeLog', sizeLog)

        //check
        if (sizeLog >= sizeLogMax[keySize]) {
            return sizeLogMax[keyFraction]
        }
        if (sizeLog <= sizeLogMin[keySize]) {
            return sizeLogMin[keyFraction]
        }

        //interp1
        let optP = {
            keyX: keySize,
            keyY: keyFraction,
        }
        let pfraction = interp1(lrs, sizeLog, optP)
        // console.log('pfraction', pfraction)

        //check
        if (get(pfraction, 'err')) {
            console.log('lrs', lrs)
            console.log('sizeLog', sizeLog)
            console.log('optP', optP)
            console.log('pfraction', pfraction)
            return null
        }

        return pfraction
    })
    // console.log('ifs', ifs)

    //r
    let r = ifs
    if (one) {
        r = ifs[0]
    }

    return r
}


export default intrpPsdBySize
