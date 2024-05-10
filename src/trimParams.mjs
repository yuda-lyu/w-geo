import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import trim from 'lodash-es/trim.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isstr from 'wsemi/src/isstr.mjs'


function trimParams(ltdt) {
    let rs = map(ltdt, (v) => {

        //trim
        let vn = cloneDeep(v)
        each(vn, (vv, kk) => {
            if (isstr(vv)) {
                vv = trim(vv)
            }
            vn[kk] = vv
        })

        return vn
    })
    return rs
}


export default trimParams
