import get from 'lodash-es/get.js'
import estmRelativeDensity from './estmRelativeDensity.mjs'


function dtEstmRelativeDensity(dt, opt = {}) {

    //rd, Gt_dry_min, Gt_dry_max
    let rd = get(dt, 'rd', null)
    let Gt_dry_min = get(dt, 'Gt_dry_min', null)
    let Gt_dry_max = get(dt, 'Gt_dry_max', null)

    //estmRelativeDensity
    let r = estmRelativeDensity(rd, Gt_dry_min, Gt_dry_max, opt)
    r = {
        ...dt,
        ...r,
    }

    return r
}


export default dtEstmRelativeDensity
