import get from 'lodash-es/get.js'
import relaPlasticity from './relaPlasticity.mjs'


function dtRelaPlasticity(dt, opt = {}) {

    //LL, PI, PL, WC
    let LL = get(dt, 'LL', null)
    let PI = get(dt, 'PI', null)
    let PL = get(dt, 'PL', null)
    let WC = get(dt, 'WC', null)

    //relaPlasticity
    let r = relaPlasticity(LL, PI, PL, WC, opt)

    //merge
    dt = {
        ...dt,
        ...r,
    }

    return dt
}


export default dtRelaPlasticity
