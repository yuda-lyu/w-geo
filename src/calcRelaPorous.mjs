import map from 'lodash-es/map.js'
import dtRelaPorous from './dtRelaPorous.mjs'


function calcRelaPorous(ltdt, opt = {}) {
    let rs = map(ltdt, (dt) => {
        let r = dtRelaPorous(dt, opt)
        return r
    })
    return rs
}


export default calcRelaPorous
