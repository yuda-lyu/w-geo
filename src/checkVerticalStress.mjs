import cdbl from 'wsemi/src/cdbl.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'


function checkVerticalStress(v, depth, unit, lable = '') {

    //check v
    if (!isnum(v)) {
        throw new Error(`v[${v}] is not a number`)
    }
    v = cdbl(v)

    //check depth
    if (!isnum(depth)) {
        throw new Error(`depth[${depth}] is not a number`)
    }
    depth = cdbl(depth)

    //check unit
    if (unit !== 'kPa' && unit !== 'MPa') {
        throw new Error(`unit[${unit}] need kPa or MPa`)
    }

    //最大最小單位重
    let rmin = 2 //kN/m3, 若最小飽和單位重12, 扣水單位重9.81, 最小乾單位重至少要低於2
    let rmax = 25 //kN/m3

    //最大最小應力
    let vmin = rmin * depth //kPa
    let vmax = rmax * depth //kPa

    //unit
    if (unit === 'MPa') {
        vmin /= 1000
        vmax /= 1000
    }

    //lable
    if (!isestr(lable)) {
        lable = `v`
    }

    //check
    if (v < vmin) {
        throw new Error(`${lable}[${v}](${unit}) < min[${vmin}](${unit}) in depth[${depth}](m)`)
        // console.log(`${lable}[${v}](${unit}) < min[${vmin}](${unit}) in depth[${depth}](m)`)
    }
    if (v > vmax) {
        throw new Error(`${lable}[${v}](${unit}) > max[${vmax}](${unit}) in depth[${depth}](m)`)
        // console.log(`${lable}[${v}](${unit}) > max[${vmax}](${unit}) in depth[${depth}](m)`)
    }

}


export default checkVerticalStress
