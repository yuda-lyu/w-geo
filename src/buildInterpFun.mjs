import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import sortBy from 'lodash-es/sortBy.js'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import interp1 from 'wsemi/src/interp1.mjs'
import { calcDepthMax } from './calcDepthMaxMin.mjs'


function buildInterpFun(ltdt, keyDepth, keyTarget, opt = {}) {

    //check keyDepth
    if (!isestr(keyDepth)) {
        throw new Error('invalid keyDepth')
    }

    //check keyTarget
    if (!isestr(keyTarget)) {
        throw new Error('invalid keyTarget')
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

    //mode
    let mode = get(opt, 'mode')
    if (!isestr(mode)) {
        mode = 'stairs' //每點為bar中心點向上下擴散
    }

    //ps, 提取數據
    let ps = []
    each(ltdt, (v) => {

        //depth
        let depth = get(v, keyDepth, null)

        //tar
        let tar = get(v, keyTarget, null)

        //push
        if (isnum(depth) && isnum(tar)) {
            depth = cdbl(depth)
            tar = cdbl(tar)
            ps.push({
                x: depth,
                y: tar,
            })
        }

    })

    //sortBy
    ps = sortBy(ps, 'x') //深度已變更為x
    // console.log('ps', ps)

    //calcDepthMax
    let depthMax = calcDepthMax(ltdt, {
        keyDepth,
        keyDepthStart,
        keyDepthEnd,
        useCeil: true,
    })

    //optInp
    let optInp = {
        mode,
        xMin: 0,
        xMax: depthMax,
    }

    //interpFun
    let interpFun = (x) => {
        let one = false
        if (isnum(x)) {
            one = true
            x = cdbl(x)
            x = [x]
        }
        let r = map(x, (v) => {
            return interp1(ps, v, optInp)
        })
        if (one) {
            r = r[0]
        }
        return r
    }

    return interpFun
}


export default buildInterpFun
