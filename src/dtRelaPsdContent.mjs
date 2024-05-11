import get from 'lodash-es/get.js'
import relaPsdContent from './relaPsdContent.mjs'


function dtRelaPsdContent(dt, opt = {}) {

    //ctGravel, ctSand, ctSilt, ctClay
    let ctGravel = get(dt, 'ctGravel', null)
    let ctSand = get(dt, 'ctSand', null)
    let ctSilt = get(dt, 'ctSilt', null)
    let ctClay = get(dt, 'ctClay', null)

    //relaPsdContent
    let r = relaPsdContent(ctGravel, ctSand, ctSilt, ctClay, opt)
    r = {
        ...dt,
        ...r,
    }

    return r
}


export default dtRelaPsdContent
