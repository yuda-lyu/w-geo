import map from 'lodash-es/map.js'
import dtEstmOcr from './dtEstmOcr.mjs'


function calcEstmOcr(ltdt, opt = {}) {
    let rs = map(ltdt, (dt) => {
        let r = dtEstmOcr(dt, opt)
        return r
    })
    return rs
}


export default calcEstmOcr
