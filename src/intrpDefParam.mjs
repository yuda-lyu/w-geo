import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cnst from './cnst.mjs'


function intrpDefPp(depth, unit = 'kPa') {

    //check
    if (unit !== 'kPa' && unit !== 'MPa') {
        throw new Error(`unit[${unit}] need kPa or MPa`)
    }

    //check
    if (!isnum(depth)) {
        return null
    }
    depth = cdbl(depth)

    let rw = cnst.rw //水單位重(kN/m3)

    let r = depth * rw //kPa

    //unit
    if (unit === 'MPa') {
        r /= 1000
    }

    return r
}


function intrpDefSvSvp(depth, unit = 'kPa') {

    //check
    if (unit !== 'kPa' && unit !== 'MPa') {
        throw new Error(`unit[${unit}] need kPa or MPa`)
    }

    //check
    if (!isnum(depth)) {
        return null
    }
    depth = cdbl(depth)

    //sv(kPa)
    let sv = depth * cnst.assesment_rsat //飽和單位重(kN/m3)

    //pp(kPa)
    let pp = intrpDefPp(depth, 'kPa')

    //svp(kPa)
    let svp = sv - pp
    svp = Math.max(svp, 0)

    //svdry(kPa)
    let svdry = depth * cnst.assesment_rd //乾單位重(kN/m3)

    //unit
    if (unit === 'MPa') {
        sv /= 1000
        pp /= 1000
        svdry /= 1000
    }

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
export default { //整合輸出預設得要有default
    intrpDefPp,
    intrpDefSvSvp
}
