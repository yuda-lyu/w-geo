import map from 'lodash-es/map.js'
import dtIntrpPsdContentUscs from './dtIntrpPsdContentUscs.mjs'


function calcIntrpPsdContentUscs(ltdt, opt = {}) {

    let rs = map(ltdt, (dt) => {

        try {

            //dtIntrpPsdContentUscs
            let r = dtIntrpPsdContentUscs(dt, opt)

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


export default calcIntrpPsdContentUscs
