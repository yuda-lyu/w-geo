import get from 'lodash-es/get.js'
import relaRelativeDensity from './relaRelativeDensity.mjs'


function dtRelaRelativeDensity(dt, opt = {}) {

    //rd, Gt_dry_min, Gt_dry_max
    let rd = get(dt, 'rd', null)
    let Gt_dry_min = get(dt, 'Gt_dry_min', null)
    let Gt_dry_max = get(dt, 'Gt_dry_max', null)

    //relaRelativeDensity
    let r = relaRelativeDensity(rd, Gt_dry_min, Gt_dry_max, opt)
    r = {
        ...dt,
        ...r,
    }

    return r
}


export default dtRelaRelativeDensity
