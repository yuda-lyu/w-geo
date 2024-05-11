import map from 'lodash-es/map.js'
import dtRelaPsdContent from './dtRelaPsdContent.mjs'


function calcRelaPsdContent(ltdt, opt = {}) {
    let rs = map(ltdt, (dt) => {
        let r = dtRelaPsdContent(dt, opt)
        return r
    })
    return rs
}


export default calcRelaPsdContent
