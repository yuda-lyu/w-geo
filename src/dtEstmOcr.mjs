import get from 'lodash-es/get.js'
import estmOcr from './estmOcr.mjs'


function dtEstmOcr(dt, opt = {}) {

    //compressiveStrength, svp
    let compressiveStrength = get(dt, 'compressiveStrength', null)
    let svp = get(dt, 'svp', null)

    //estmOcr
    let r = estmOcr(compressiveStrength, svp, opt)
    r = {
        ...dt,
        ...r,
    }

    return r
}


export default dtEstmOcr
