import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import interp1 from 'wsemi/src/interp1.mjs'
import buildSvsAndSvps from './buildSvsAndSvps.mjs'
import { intrpDefSvSvp } from './intrpDefParam.mjs'


function buildIntrpSvSvp(ed, depth) {

    //interp1
    let _sv = interp1(ed.svs, depth)

    //check
    if (get(_sv, 'err')) {
        console.log(_sv.err, 'depth', depth, 'ed.svs', ed.svs)
        throw new Error('無法建構內插垂直總應力函數')
    }

    //interp1
    let _svp = interp1(ed.svps, depth)

    //check
    if (get(_svp, 'err')) {
        console.log(_svp.err, 'depth', depth, 'ed.svps', ed.svps)
        throw new Error('無法建構內插垂直有效應力函數')
    }

    //interp1
    let _rd = interp1(ed.rds, depth)

    //check
    if (get(_rd, 'err')) {
        console.log(_rd.err, 'depth', depth, 'ed.rds', ed.rds)
        throw new Error('無法建構內插乾單位重函數')
    }

    //interp1
    let _rsat = interp1(ed.rsats, depth)

    //check
    if (get(_rsat, 'err')) {
        console.log(_rsat.err, 'depth', depth, 'ed.rsats', ed.rsats)
        throw new Error('無法建構內插乾單位重函數')
    }

    return {
        sv: _sv,
        svp: _svp,
        rd: _rd,
        rsat: _rsat,
    }
}


function calcEstmVerticalStress(ltdt, opt = {}) {

    //keyDepth
    let keyDepth = get(opt, 'keyDepth')
    if (!isestr(keyDepth)) {
        keyDepth = 'depth'
    }

    //keyRd
    let keyRd = get(opt, 'keyRd')
    if (!isestr(keyRd)) {
        keyRd = 'rd'
    }

    //keyRsat
    let keyRsat = get(opt, 'keyRsat')
    if (!isestr(keyRsat)) {
        keyRsat = 'rsat'
    }

    //waterLevelUsual
    let waterLevelUsual = get(opt, 'waterLevelUsual')
    if (!isnum(waterLevelUsual)) {
        waterLevelUsual = 0
    }
    waterLevelUsual = cdbl(waterLevelUsual)

    //waterLevelDesign
    let waterLevelDesign = get(opt, 'waterLevelDesign')
    if (!isnum(waterLevelDesign)) {
        waterLevelDesign = 0
    }
    waterLevelDesign = cdbl(waterLevelDesign)

    //buildSvsAndSvps
    let ed = buildSvsAndSvps(ltdt, {
        keyDepth,
        keyRd,
        keyRsat,
        waterLevelUsual,
        waterLevelDesign,
    })
    // console.log('ed', ed)

    //intrp
    let intrp = (depth) => {
        if (iseobj(ed)) {
            return buildIntrpSvSvp(ed, depth)
        }
        else {
            let r = intrpDefSvSvp(depth)
            r = {
                ...r,
                [keyRd]: null,
                [keyRsat]: null,
            }
            return r
        }
    }

    //bIntrpSvSvp
    let bIntrpSvSvp = isfun(intrp)

    //rs
    let rs = map(ltdt, (dt) => {

        //rd(kN/m3)
        let rd = get(dt, keyRd)

        //rsat(kN/m3)
        let rsat = get(dt, keyRsat)

        //sv(kN/m2)
        let sv = get(dt, 'sv')

        //svp(kN/m2)
        let svp = get(dt, 'svp')

        //check
        if ((!isnum(sv) || !isnum(svp)) && bIntrpSvSvp) {

            //depth
            let depth = get(dt, keyDepth)

            //check
            if (isnum(depth)) {

                //cdbl
                depth = cdbl(depth)

                //intrp
                let r = intrp(depth)
                sv = r.sv
                svp = r.svp
                rd = r.rd
                rsat = r.rsat

                //check
                if (!isnum(sv)) {
                    console.log('dt', dt)
                    console.log('keyDepth', keyDepth)
                    console.log('r', r)
                    console.log('無法內插垂直總應力')
                }

                //check
                if (!isnum(svp)) {
                    console.log('dt', dt)
                    console.log('keyDepth', keyDepth)
                    console.log('r', r)
                    console.log('無法內插垂直有效應力')
                }

                //check
                if (!isnum(rd)) {
                    console.log('dt', dt)
                    console.log('keyDepth', keyDepth)
                    console.log('r', r)
                    console.log('無法內插乾單位重')
                }

                //check
                if (!isnum(rsat)) {
                    console.log('dt', dt)
                    console.log('keyDepth', keyDepth)
                    console.log('r', r)
                    console.log('無法內插飽和單位重')
                }

            }

        }

        //merge
        dt = {
            ...dt,
            [keyRd]: rd,
            [keyRsat]: rsat,
            sv,
            svp,
        }

        return dt
    })

    return rs
}


export default calcEstmVerticalStress
