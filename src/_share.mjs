import get from 'lodash/get'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function pickData(d, pickKey) {
    let value = null
    if (isestr(pickKey)) {
        let t = get(d, pickKey)
        if (isnum(t)) {
            value = cdbl(t) //只有數字才回傳, 否則傳null
        }
    }
    else if (isfun(pickKey)) {
        value = pickKey(d)
    }
    return value
}


export {
    pickData
}
export default { //整合輸出預設得要有default
    pickData
}
