import get from 'lodash-es/get.js'
import isestr from 'wsemi/src/isestr.mjs'
import isstr from 'wsemi/src/isstr.mjs'
import cstr from 'wsemi/src/cstr.mjs'


function calcLiquefactionAddErr(dt, err) {

    //to string
    if (!isstr(err)) {
        try {
            err = err.toString()
        }
        catch (e) {}
    }
    if (!isstr(err)) {
        try {
            err = cstr(err)
        }
        catch (e) {}
    }

    //check
    if (!isestr(err)) {
        dt.err = ''
        return dt
    }

    //merge
    let _err = get(dt, 'err', '')
    if (_err === '') {
        _err = err
    }
    else {
        _err += `; ${err}`
    }

    //save
    dt.err = _err

    return dt
}


export default calcLiquefactionAddErr
