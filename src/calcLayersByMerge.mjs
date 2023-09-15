import get from 'lodash/get'
import each from 'lodash/each'
import map from 'lodash/map'
import filter from 'lodash/filter'
import cloneDeep from 'lodash/cloneDeep'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isarr from 'wsemi/src/isarr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import judge from './judge.mjs'


function calcLayersByMerge(ltdt, opt = {}) {

    //keyDepth
    let keyDepth = get(opt, 'keyDepth')
    if (!isestr(keyDepth)) {
        keyDepth = 'depth'
    }

    //keyDepthStart
    let keyDepthStart = get(opt, 'keyDepthStart')
    if (!isestr(keyDepthStart)) {
        keyDepthStart = 'depthStart'
    }

    //keyDepthEnd
    let keyDepthEnd = get(opt, 'keyDepthEnd')
    if (!isestr(keyDepthEnd)) {
        keyDepthEnd = 'depthEnd'
    }

    //keyType
    let keyType = get(opt, 'keyType')
    if (!isestr(keyType)) {
        keyType = 'type'
    }

    //saveFromInds
    let saveFromInds = get(opt, 'saveFromInds')
    if (!isbol(saveFromInds)) {
        saveFromInds = true
    }

    //keyInd
    let keyInd = get(opt, 'keyInd')
    if (!isestr(keyInd)) {
        keyInd = 'ind'
    }

    //keyFromInds
    let keyFromInds = get(opt, 'keyFromInds')
    if (!isestr(keyFromInds)) {
        keyFromInds = 'fromInds'
    }

    //cloneDeep
    let rs = cloneDeep(ltdt)

    //saveFromInds
    if (saveFromInds) {
        rs = map(rs, (v, k) => {
            if (!isnum(v[keyInd])) {
                v[keyInd] = k
            }
            return v
        })
    }

    //偵測各層
    each(rs, (v, k) => {

        //check
        if (k === 0) {
            return true //跳出換下一個
        }

        //check
        if (!iseobj(v)) {
            throw new Error(`ltdt[${k}] is not an object`)
        }

        //params
        let v0 = get(rs, k - 1)
        let v1 = v
        let t0 = get(v0, keyType, '')
        let de0 = get(v0, keyDepthEnd, '')
        let t1 = get(v1, keyType, '')
        let ds1 = get(v1, keyDepthStart, '')

        //check
        if (!isnum(de0) || !isnum(ds1)) {
            return true //跳出換下一個
        }

        //cdbl
        de0 = cdbl(de0)
        ds1 = cdbl(ds1)

        //check
        if (isestr(t0) && t0 === t1 && judge(de0, '===', ds1)) {

            //saveFromInds
            if (saveFromInds) {

                //check
                if (!isarr(rs[k - 1][keyFromInds])) {
                    rs[k - 1][keyFromInds] = [rs[k - 1][keyInd]]
                }

                //check
                if (!isarr(rs[k][keyFromInds])) {
                    rs[k][keyFromInds] = [rs[k][keyInd]]
                }

                //merge
                rs[k][keyFromInds] = [
                    ...rs[k - 1][keyFromInds],
                    ...rs[k][keyFromInds],
                ]

            }

            //合併深度
            rs[k][keyDepthStart] = rs[k - 1][keyDepthStart] //上層起始深度給下層

            //標注上層為null(待刪除)
            rs[k - 1] = null

        }

    })

    //filter
    rs = filter(rs, iseobj)

    return rs
}


export default calcLayersByMerge
