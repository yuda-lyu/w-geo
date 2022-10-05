import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cnst from './cnst.mjs'


function intrpDefPp(depth) {

    //check
    if (!isnum(depth)) {
        return null
    }
    depth = cdbl(depth)

    let rw = cnst.rw //水單位重(kN/m3)

    let r = depth * rw //kPa

    return r
}


function intrpDefSvSvp(depth) {

    //check
    if (!isnum(depth)) {
        return null
    }
    depth = cdbl(depth)

    //sv(kPa)
    let sv = depth * cnst.assesment_rsat //飽和單位重(kN/m3)

    //pp(kPa)
    let pp = intrpDefPp(depth)

    //svp(kPa)
    let svp = sv - pp
    svp = Math.max(svp, 0)

    //svdry(kPa)
    let svdry = depth * cnst.assesment_rd //乾單位重(kN/m3)

    return {
        sv,
        svp,
        svdry,
    }
}


export {
    intrpDefPp,
    intrpDefSvSvp
}
