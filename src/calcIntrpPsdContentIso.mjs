import map from 'lodash-es/map.js'
import dtIntrpPsdContentIso from './dtIntrpPsdContentIso.mjs'


function calcIntrpPsdContentIso(ltdt, opt = {}) {

    let rs = map(ltdt, (dt) => {

        try {

            //dtIntrpPsdContentIso
            let r = dtIntrpPsdContentIso(dt, opt)

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


export default calcIntrpPsdContentIso
