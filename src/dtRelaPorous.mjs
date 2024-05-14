import get from 'lodash-es/get.js'
import relaPorous from './relaPorous.mjs'


function dtRelaPorous(dt, opt = {}) {

    //rd, rsat, GS, e
    let rd = get(dt, 'rd', null)
    let rsat = get(dt, 'rsat', null)
    let GS = get(dt, 'GS', null)
    let e = get(dt, 'e', null)

    //relaPorous
    let r = relaPorous(rd, rsat, GS, e, opt)

    //merge
    dt = {
        ...dt,
        ...r,
    }

    return dt
}


export default dtRelaPorous
