import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import filter from 'lodash-es/filter.js'
import size from 'lodash-es/size.js'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import buildInterpFun from './buildInterpFun.mjs'
import dtRelaRelativeDensity from './dtRelaRelativeDensity.mjs'


function calcRelaRelativeDensity(ltdt, opt = {}) {

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

    //interpRd
    let interpRd = null
    if (true) {

        //rds
        let rds = map(ltdt, keyRd)
        rds = filter(rds, isnum)

        //若ltdt內有部份提供WC, 則以此內插LI, CI
        if (size(rds) > 0) {
            interpRd = buildInterpFun(ltdt, keyDepth, keyRd)
        }

    }

    //bInterpRd
    let bInterpRd = isfun(interpRd)

    //rs
    let rs = map(ltdt, (dt) => {

        //rd, 乾單位重(kN/m3)
        let rd = get(dt, keyRd)
        if (!isnum(rd)) {
            rd = null
        }

        //check
        if (!isnum(rd) && bInterpRd) {

            //depth
            let depth = get(dt, keyDepth)

            //check
            if (isnum(depth)) {

                //cdbl
                depth = cdbl(depth)

                //interpRd
                rd = interpRd(depth)

                //check
                if (!isnum(rd)) {
                    console.log('keyDepth', keyDepth)
                    console.log('keyRd', keyRd)
                    console.log('dt', dt)
                    console.log('計算相對密度時無法內插乾單位重')
                }

            }

        }

        //merge rd
        dt = {
            ...dt,
            rd,
        }

        //dtRelaRelativeDensity
        let r = dtRelaRelativeDensity(dt, opt)

        return r
    })

    return rs
}


export default calcRelaRelativeDensity
