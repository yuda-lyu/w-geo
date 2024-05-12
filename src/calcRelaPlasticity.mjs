import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import filter from 'lodash-es/filter.js'
import size from 'lodash-es/size.js'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import buildInterpFun from './buildInterpFun.mjs'
import dtRelaPlasticity from './dtRelaPlasticity.mjs'


function calcRelaPlasticity(ltdt, opt = {}) {

    //keyDepth
    let keyDepth = get(opt, 'keyDepth')
    if (!isestr(keyDepth)) {
        keyDepth = 'depth'
    }

    //keyWc
    let keyWc = get(opt, 'keyWc')
    if (!isestr(keyWc)) {
        keyWc = 'WC'
    }

    //interpWc, 有些阿太堡沒給含水量, 用內插補可再多計算LI,CI
    let interpWc = null
    if (true) {

        //WCs
        let WCs = map(ltdt, keyWc)
        WCs = filter(WCs, isnum)

        //若ltdt內有部份提供WC, 則以此內插LI, CI
        if (size(WCs) > 0) {
            interpWc = buildInterpFun(ltdt, keyDepth, keyWc)
        }

    }

    //bInterpWc
    let bInterpWc = isfun(interpWc)

    //rs
    let rs = map(ltdt, (dt) => {

        //WC, 含水量(%)
        let WC = get(dt, keyWc)
        if (!isnum(WC)) {
            WC = null
        }

        //check
        if (!isnum(WC) && bInterpWc) {

            //depth
            let depth = get(dt, keyDepth)

            //check
            if (isnum(depth)) {

                //cdbl
                depth = cdbl(depth)

                //interpWc
                WC = interpWc(depth)

                //check
                if (!isnum(WC)) {
                    console.log('keyDepth', keyDepth)
                    console.log('keyWc', keyWc)
                    console.log('dt', dt)
                    console.log('計算阿太堡時無法內插含水量')
                }

            }

        }

        //merge WC
        dt = {
            ...dt,
            WC,
        }

        //dtRelaPlasticity
        let r = dtRelaPlasticity(dt, opt)

        return r
    })

    return rs
}


export default calcRelaPlasticity
