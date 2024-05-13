import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import dtEstmOcr from './dtEstmOcr.mjs'


function calcEstmOcr(ltdt, opt = {}) {

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

    let rs = map(ltdt, (dt) => {

        //compressiveStrength, 壓縮強度(kPa)
        let compressiveStrength = get(dt, keyCompressiveStrength, null)

        //svp, 垂直有效應力(kPa)
        let svp = get(dt, 'svp', null) //svp的key不提供修改

        //dtEstmOcr
        let r = {
            [keyCompressiveStrength]: compressiveStrength,
            svp, //svp的key不提供修改
        }
        if (isnum(compressiveStrength) && isnum(svp)) {
            r = dtEstmOcr(r, opt)
        }

        //merge
        dt = {
            ...dt,
            ...r,
        }

        return dt
    })
    return rs
}


export default calcEstmOcr
