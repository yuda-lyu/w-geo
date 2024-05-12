import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function estmRelativeDensity(rd, Gt_dry_min, Gt_dry_max, opt = {}) {
    //rd, 乾單位重(kN/m3)

    //check rd
    if (!isnum(rd)) {
        throw new Error(`rd[${rd}] is not a number`)
    }
    rd = cdbl(rd)

    //check Gt_dry_min
    if (!isnum(Gt_dry_min)) {
        throw new Error(`Gt_dry_min[${Gt_dry_min}] is not a number`)
    }
    Gt_dry_min = cdbl(Gt_dry_min)

    //check Gt_dry_max
    if (!isnum(Gt_dry_max)) {
        throw new Error(`Gt_dry_max[${Gt_dry_max}] is not a number`)
    }
    Gt_dry_max = cdbl(Gt_dry_max)

    //check Gt_dry_min > Gt_dry_max
    if (Gt_dry_min > Gt_dry_max) {
        throw new Error(`Gt_dry_min[${Gt_dry_min}] > Gt_dry_max[${Gt_dry_max}]`)
    }

    //check rd < Gt_dry_min
    if (rd < Gt_dry_min) {
        throw new Error(`rd[${rd}] < Gt_dry_min[${Gt_dry_min}]`)
    }

    //check rd > Gt_dry_max
    if (rd > Gt_dry_max) {
        throw new Error(`rd[${rd}] > Gt_dry_max[${Gt_dry_max}]`)
    }

    //dr1, dr2
    let dr1 = Gt_dry_max * (rd - Gt_dry_min)
    let dr2 = rd * (Gt_dry_max - Gt_dry_min)

    //Dr, 相對密度(%)
    let Dr = null
    if (dr2 > 0) {

        //Dr
        Dr = dr1 / dr2 * 100

        //因試驗誤差, 可能出現小於0或大於100
        Dr = Math.max(Dr, 0)
        Dr = Math.min(Dr, 100)

    }

    //r
    let r = {
        rd,
        Gt_dry_min,
        Gt_dry_max,
        Dr,
    }

    return r
}


export default estmRelativeDensity
