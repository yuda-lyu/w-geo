import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import size from 'lodash-es/size.js'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import buildInterpFun from './buildInterpFun.mjs'
import dtEstmRelativeDensity from './dtEstmRelativeDensity.mjs'


function calcEstmRelativeDensity(ltdt, opt = {}) {

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

    // //keyRdMin
    // let keyRdMin = get(opt, 'keyRdMin')
    // if (!isestr(keyRdMin)) {
    //     keyRdMin = 'rdMin'
    // }

    // //keyRdMax
    // let keyRdMax = get(opt, 'keyRdMax')
    // if (!isestr(keyRdMax)) {
    //     keyRdMax = 'rdMax'
    // }

    //interpRd
    let interpRd = null
    if (true) {

        //rds
        let rds = []
        each(ltdt, (dt) => {
            let depth = get(dt, keyDepth)
            let rd = get(dt, keyRd)
            if (isnum(depth) && isnum(rd)) {
                depth = cdbl(depth)
                rd = cdbl(rd)
                rds.push({
                    [keyDepth]: depth,
                    [keyRd]: rd,
                })
            }
        })
        // console.log('rds', rds)

        //若ltdt內有部份提供depth與rd, 則以此內插rd
        if (size(rds) > 0) {

            let n = size(rds)

            //rd0
            let rd0 = get(rds, 0)

            //rdn
            let rdn = get(rds, n - 1)

            //擴充最淺與最深處rd避免外插問題
            rds = [
                {
                    ...rd0,
                    [keyDepth]: rd0[keyDepth] - 1e10,
                },
                ...rds,
                {
                    ...rdn,
                    [keyDepth]: rdn[keyDepth] + 1e10,
                },
            ]

            interpRd = buildInterpFun(rds, keyDepth, keyRd, { mode: 'linear' }) //內插rd使用線性內插
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
                    console.log('rd', rd)
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

        //dtEstmRelativeDensity
        let r = dtEstmRelativeDensity(dt, opt)

        return r
    })

    return rs
}


export default calcEstmRelativeDensity
