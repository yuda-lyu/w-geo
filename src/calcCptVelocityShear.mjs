import map from 'lodash-es/map.js'
import get from 'lodash-es/get.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cnst from './cnst.mjs'


//Pa, 大氣壓(MPa)
let Pa = cnst.Pa


function calcCptVelocityShear(ltdt, opt = {}) {

    //method
    let method = get(opt, 'method', '')
    if (

        method !== 'Baldi(1989) for sand' &&
        method !== 'Hegazy and Mayne(1995) by svp for sand' &&
        method !== 'Hegazy and Mayne(1995) by fs for sand' &&
        method !== 'Robertson(2009) for sand' &&
        method !== 'Sinotech(2023) for sand' &&

        method !== 'Hegazy and Mayne(1995) by fs for clay' &&
        method !== 'Mayne & Rix(1995) for clay' &&
        method !== 'Mayne(2006) for clay' &&
        method !== 'Sinotech(2023) for clay' &&

        method !== 'Hegazy and Mayne(1995) for all' &&
        method !== 'Andrus(2007) for Holocene soil' &&
        method !== 'Andrus(2007) for Pleistocene soil' &&

        true
    ) {
        method = 'Hegazy and Mayne(1995) for all'
    }

    //unitSvSvp
    let unitSvSvp = get(opt, 'unitSvSvp')
    if (unitSvSvp !== 'kPa' && unitSvSvp !== 'MPa') {
        throw new Error(`opt.unitSvSvp[${unitSvSvp}] need kPa or MPa`)
    }

    //keyDepth
    let keyDepth = get(opt, 'keyDepth')
    if (!isestr(keyDepth)) {
        keyDepth = 'depth'
    }

    //keyDepthStart
    let keyDepthStart = get(opt, 'keyDepthStart')
    if (!isestr(keyDepthStart)) {
        keyDepthStart = 'depthStart'
    }

    //keyDepthEnd
    let keyDepthEnd = get(opt, 'keyDepthEnd')
    if (!isestr(keyDepthEnd)) {
        keyDepthEnd = 'depthEnd'
    }

    //sepIc
    let sepIc = get(opt, 'sepIc')
    if (!isnum(sepIc)) {
        sepIc = 2.6
    }
    sepIc = cdbl(sepIc)

    //sepIcn
    let sepIcn = get(opt, 'sepIcn')
    if (!isnum(sepIcn)) {
        sepIcn = 2.6
    }
    sepIcn = cdbl(sepIcn)

    //cloneDeep
    ltdt = cloneDeep(ltdt)

    //計算vs
    ltdt = map(ltdt, (v) => {

        //vs(m/s), 剪力波速單位
        let vs = null

        if (method === 'Baldi(1989) for sand') {
            // let Ic = get(v, 'Ic', null)
            // let Ic = get(v, 'Icn', null) //bbb
            let Ic = get(v, '_Ic', null) //bbb
            let qc = get(v, 'qc', null)
            // let svp = get(v, 'svp', null)
            let svp = get(v, '_svp', null) //bbb
            if (isnum(Ic) && isnum(qc) && isnum(svp)) {
                Ic = cdbl(Ic)
                if (Ic <= sepIc) {
                    qc = cdbl(qc)
                    svp = cdbl(svp)
                    qc *= 1000 //MPa -> kPa
                    svp *= 1000 //MPa -> kPa
                    vs = 17.48 * (qc ** 0.13) * (svp ** 0.27)
                }
            }
        }
        else if (method === 'Hegazy and Mayne(1995) by svp for sand') {
            // let Ic = get(v, 'Ic', null)
            // let Ic = get(v, 'Icn', null) //bbb
            let Ic = get(v, '_Ic', null) //bbb
            let qc = get(v, 'qc', null)
            // let svp = get(v, 'svp', null)
            let svp = get(v, '_svp', null) //bbb
            if (isnum(Ic) && isnum(qc) && isnum(svp)) {
                Ic = cdbl(Ic)
                if (Ic <= sepIc) {
                    qc = cdbl(qc)
                    svp = cdbl(svp)
                    qc *= 1000 //MPa -> kPa
                    svp *= 1000 //MPa -> kPa
                    vs = 13.18 * (qc ** 0.192) * (svp ** 0.179)
                }
            }
        }
        else if (method === 'Hegazy and Mayne(1995) by fs for sand') {
            // let Ic = get(v, 'Ic', null)
            // let Ic = get(v, 'Icn', null) //bbb
            let Ic = get(v, '_Ic', null) //bbb
            let qc = get(v, 'qc', null)
            let fs = get(v, 'fs', null)
            if (isnum(Ic) && isnum(qc) && isnum(fs)) {
                Ic = cdbl(Ic)
                if (Ic <= sepIc) {
                    qc = cdbl(qc)
                    fs = cdbl(fs)
                    qc *= 1000 //MPa -> kPa
                    fs *= 1000 //MPa -> kPa
                    vs = 12.02 * (qc ** 0.319) * (fs ** (-0.0466))
                }
            }
        }
        else if (method === 'Robertson(2009) for sand') {
            // let Icn = get(v, 'Icn', null)
            let Icn = get(v, '_Ic', null) //bbb
            let qnet = get(v, 'qnet', null)
            if (isnum(Icn) && isnum(qnet)) {
                Icn = cdbl(Icn)
                if (Icn <= sepIcn) {
                    qnet = cdbl(qnet)
                    qnet *= 1000 //MPa -> kPa
                    let Pat = Pa * 1000
                    let alpha_vs = 10 ** (0.55 * Icn + 1.68)
                    vs = Math.sqrt(alpha_vs * qnet / Pat) //注意單位qnet(kPa), Pa(kPa), 可不轉單位因分子分母會相消單位
                }
            }
        }
        else if (method === 'Sinotech(2023) for sand') {
            let qt = get(v, 'qt', null)
            // let Icn = get(v, 'Icn', null)
            let Icn = get(v, '_Ic', null) //bbb
            let depth = get(v, 'depth', null)
            if (isnum(Icn) && isnum(qt)) {
                Icn = cdbl(Icn)
                if (Icn <= sepIcn) {
                    qt = cdbl(qt)
                    Icn = cdbl(Icn)
                    depth = cdbl(depth)
                    qt *= 1000 //MPa -> kPa
                    let ASF = 1
                    vs = 2.27 * (qt ** 0.451) * (Icn ** 1.250) * (depth ** (-0.103)) * ASF
                }
            }
        }
        else if (method === 'Hegazy and Mayne(1995) by fs for clay') {
            // let Ic = get(v, 'Ic', null)
            // let Ic = get(v, 'Icn', null) //bbb
            let Ic = get(v, '_Ic', null) //bbb
            let qc = get(v, 'qc', null)
            let fs = get(v, 'fs', null)
            if (isnum(Ic) && isnum(qc) && isnum(fs)) {
                Ic = cdbl(Ic)
                if (Ic > sepIc) {
                    qc = cdbl(qc)
                    fs = cdbl(fs)
                    qc *= 1000 //MPa -> kPa
                    fs *= 1000 //MPa -> kPa
                    vs = 3.18 * (qc ** 0.549) * (fs ** 0.025)
                }
            }
        }
        else if (method === 'Mayne & Rix(1995) for clay') {
            // let Ic = get(v, 'Ic', null)
            // let Ic = get(v, 'Icn', null) //bbb
            let Ic = get(v, '_Ic', null) //bbb
            let qc = get(v, 'qc', null)
            if (isnum(Ic) && isnum(qc)) {
                Ic = cdbl(Ic)
                if (Ic > sepIc) {
                    qc = cdbl(qc)
                    qc *= 1000 //MPa -> kPa
                    vs = 1.75 * (qc ** 0.627)
                }
            }
        }
        else if (method === 'Mayne(2006) for clay') {
            // let Icn = get(v, 'Icn', null)
            let Icn = get(v, '_Ic', null) //bbb
            let fs = get(v, 'fs', null)
            if (isnum(Icn) && isnum(fs)) {
                Icn = cdbl(Icn)
                if (Icn > sepIcn) {
                    fs = cdbl(fs)
                    fs *= 1000 //MPa -> kPa
                    vs = 118.8 * Math.log10(fs) + 18.5
                }
            }
        }
        else if (method === 'Sinotech(2023) for clay') {
            let qt = get(v, 'qt', null)
            // let Icn = get(v, 'Icn', null)
            let Icn = get(v, '_Ic', null) //bbb
            let depth = get(v, 'depth', null)
            if (isnum(Icn) && isnum(qt)) {
                Icn = cdbl(Icn)
                if (Icn > sepIcn) {
                    qt = cdbl(qt)
                    Icn = cdbl(Icn)
                    depth = cdbl(depth)
                    qt *= 1000 //MPa -> kPa
                    let ASF = 1
                    vs = 2.27 * (qt ** 0.360) * (Icn ** 1.992) * (depth ** (-0.096)) * ASF
                }
            }
        }
        else if (method === 'Hegazy and Mayne(1995) for all') {
            let qc = get(v, 'qc', null)
            let fs = get(v, 'fs', null)
            if (isnum(qc) && isnum(fs)) {
                qc = cdbl(qc)
                fs = cdbl(fs)
                qc *= 1000 //MPa -> kPa
                fs *= 1000 //MPa -> kPa
                if (qc > 0) {
                    vs = (10.1 * Math.log10(qc) - 11.4) ** 1.67 * (fs / qc * 100) ** 0.3
                }
            }
        }
        else if (method === 'Andrus(2007) for Holocene soil') {
            let qt = get(v, 'qt', null)
            // let Icn = get(v, 'Icn', null)
            let Icn = get(v, '_Ic', null) //bbb
            let depth = get(v, 'depth', null)
            if (isnum(Icn) && isnum(qt)) {
                Icn = cdbl(Icn)
                qt = cdbl(qt)
                Icn = cdbl(Icn)
                depth = cdbl(depth)
                qt *= 1000 //MPa -> kPa
                let ASF = 1
                vs = 2.27 * (qt ** 0.412) * (Icn ** 0.989) * (depth ** 0.033) * ASF
            }
        }
        else if (method === 'Andrus(2007) for Pleistocene soil') {
            let qt = get(v, 'qt', null)
            // let Icn = get(v, 'Icn', null)
            let Icn = get(v, '_Ic', null) //bbb
            let depth = get(v, 'depth', null)
            if (isnum(Icn) && isnum(qt)) {
                qt = cdbl(qt)
                Icn = cdbl(Icn)
                depth = cdbl(depth)
                qt *= 1000 //MPa -> kPa
                let ASF = 1.115
                vs = 2.62 * (qt ** 0.395) * (Icn ** 0.912) * (depth ** 0.124) * ASF
            }
        }

        //save vs
        v.vs = vs

        return v
    })
    // console.log('ltdt[0]', ltdt[0])

    return ltdt
}


export default calcCptVelocityShear
