import map from 'lodash-es/map.js'
import dtRelaPorous from './dtRelaPorous.mjs'


function calcRelaPorous(ltdt, opt = {}) {
    let rs = map(ltdt, (dt) => {

        try {

            //dtRelaPorous
            let r = dtRelaPorous(dt, opt)

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


export default calcRelaPorous
