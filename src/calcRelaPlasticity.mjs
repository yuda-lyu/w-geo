import map from 'lodash-es/map.js'
import dtRelaPlasticity from './dtRelaPlasticity.mjs'


function calcRelaPlasticity(ltdt, opt = {}) {
    let rs = map(ltdt, (dt) => {
        let r = dtRelaPlasticity(dt, opt)
        return r
    })
    return rs
}


export default calcRelaPlasticity
