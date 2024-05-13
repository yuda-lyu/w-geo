import map from 'lodash-es/map.js'
import dtIntrpPsdContentIso from './dtIntrpPsdContentIso.mjs'


function calcIntrpPsdContentIso(ltdt, opt = {}) {
    let rs = map(ltdt, (dt) => {
        let r = dtIntrpPsdContentIso(dt, opt)
        return r
    })
    return rs
}


export default calcIntrpPsdContentIso
