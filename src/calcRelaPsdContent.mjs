import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import dtRelaPsdContent from './dtRelaPsdContent.mjs'


function calcRelaPsdContent(ltdt, opt = {}) {
    let rs = map(ltdt, (dt) => {

        //merge
        dt = {
            ...dt,
            ctGravel: get(dt, 'ctGravel', null),
            ctSand: get(dt, 'ctSand', null),
            ctSilt: get(dt, 'ctSilt', null),
            ctClay: get(dt, 'ctClay', null),
            ctCoarse: get(dt, 'ctCoarse', null),
            ctFine: get(dt, 'ctFine', null),
        }

        try {

            //dtRelaPsdContent
            let r = dtRelaPsdContent(dt, opt)

            //merge
            dt = {
                ...dt,
                ...r,
            }

        }
        catch (err) {}

        return dt
    })
    return rs
}


export default calcRelaPsdContent
