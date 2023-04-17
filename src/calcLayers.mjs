import get from 'lodash/get'
import each from 'lodash/each'
import map from 'lodash/map'
import size from 'lodash/size'
import isNumber from 'lodash/isNumber'
import filter from 'lodash/filter'
import cloneDeep from 'lodash/cloneDeep'
import dig from 'wsemi/src/dig.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import isarr from 'wsemi/src/isarr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cint from 'wsemi/src/cint.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import judge from './judge.mjs'
import { getIcInfor } from './_cpt.mjs'
import { getSoilGroupByKV, getSoilGroupsIc, getSoilGroupsIcn, getSoilGroupsT4, getSoilGroupsT6, getSoilGroupsT9 } from './_soilGroup.mjs'
import calcDepthStartEndFromCenter from './calcDepthStartEndFromCenter.mjs'
import { simplifyRobertson1986, simplifyRobertson1990, simplifyRobertson2009, simplifyRamsey } from './calcCptClassify.mjs'
import calcLayersByMerge from './calcLayersByMerge.mjs'


//soilGroupsIc, soilGroupsIcn, soilGroupsT4, soilGroupsT6, soilGroupsT9
let soilGroupsIc = getSoilGroupsIc()
let soilGroupsIcn = getSoilGroupsIcn()
let soilGroupsT4 = getSoilGroupsT4()
let soilGroupsT6 = getSoilGroupsT6()
let soilGroupsT9 = getSoilGroupsT9()


function getKpSoilGroupsTn() {
    return { soilGroupsIc, soilGroupsIcn, soilGroupsT4, soilGroupsT6, soilGroupsT9 }
}


function genLayer(ltdt, opt = {}) {

    //check ltdt
    if (size(ltdt) === 0) {
        return []
    }

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

    //depthStartMin
    let depthStartMin = get(opt, 'depthStartMin')
    if (isnum(depthStartMin)) {
        depthStartMin = cdbl(depthStartMin)
    }

    //depthEndMax
    let depthEndMax = get(opt, 'depthEndMax')
    if (isnum(depthEndMax)) {
        depthEndMax = cdbl(depthEndMax)
    }

    //keyType
    let keyType = get(opt, 'keyType')
    if (!isestr(keyType)) {
        keyType = 'type'
    }

    //getType
    let getType = get(opt, 'getType', null)

    //keyInd
    let keyInd = get(opt, 'keyInd')
    if (!isestr(keyInd)) {
        keyInd = 'ind'
    }

    //calcDepthStartEndFromCenter
    ltdt = calcDepthStartEndFromCenter(ltdt, opt)

    //layers
    let layers = []
    each(ltdt, (v, k) => {

        //depthStart
        let depthStart = get(v, keyDepthStart, null)
        if (!isnum(depthStart)) {
            throw new Error(`depthStart[${depthStart}] is not a number`)
        }
        depthStart = cdbl(depthStart)

        //depthEnd
        let depthEnd = get(v, keyDepthEnd, null)
        if (!isnum(depthEnd)) {
            throw new Error(`depthEnd[${depthEnd}] is not a number`)
        }
        depthEnd = cdbl(depthEnd)

        //check depthStartMin
        if (isNumber(depthStartMin)) {
            depthStart = Math.max(depthStart, depthStartMin)
        }

        //check depthEndMax
        if (isNumber(depthEndMax)) {
            depthEnd = Math.min(depthEnd, depthEndMax)
        }

        //depth
        let depth = (depthStart + depthEnd) / 2

        //type
        let type = get(v, keyType, null)
        // console.log(k, v, 'type1', type)

        //getType
        if (isfun(getType)) {
            type = getType(v, k)
        }
        // console.log(k, v, 'type2', type)

        //check
        if (isestr(type)) {

            //push
            layers.push({
                [keyDepth]: depth,
                [keyDepthStart]: depthStart,
                [keyDepthEnd]: depthEnd,
                [keyType]: type,
                [keyInd]: k,
            })

        }
        else {
            // console.log('no-type', k, v)
        }

    })

    return layers
}


function calcLayer(ltdt, method, opt = {}) {

    //gfIc
    let gfIc = (key) => {

        //icis
        let icis = getIcInfor()

        //check
        if (key !== 'Ic' && key !== 'Icn') {
            throw new Error(`key[${key}] must be Ic or Icn`)
        }

        //optGenLayer
        let optGenLayer = {
            ...opt,
            getType: (dt, kdt) => {
                let Ic = get(dt, key, '')
                let type = ''
                each(icis, (ici) => {
                    if (Ic < ici.max) {
                        type = `Ic(${dig(ici.min, 2)}-${dig(ici.max, 2)})`
                        return false //跳出
                    }
                })
                return type
            },
        }

        //rs
        let rs = genLayer(ltdt, optGenLayer)

        return rs
    }

    //gfRobertson1986
    let gfRobertson1986 = (T) => {

        //check
        if (T !== 'T4' && T !== 'T6') {
            throw new Error(`T[${T}] must be T4 or T6`)
        }

        //numOfType
        let n = T.replace('T', '')
        let numOfType = cint(n)

        //keyName
        let keyName = ''
        if (T === 'T4') {
            keyName = 'nameEngineeringEng'
        }
        else {
            keyName = 'nameEng'
        }

        //optGenLayer
        let optGenLayer = {
            ...opt,
            getType: (dt, kdt) => {
                // console.log(dt, kdt)

                //iRobFrQt, iRobBqQt
                let iRobFrQt = get(dt, 'iRobFrQt', '')
                let iRobBqQt = get(dt, 'iRobBqQt', '')

                //type
                let type = ''
                try {

                    //simplifyRobertson1986
                    let engineeringSoilGroupKey = simplifyRobertson1986(iRobFrQt, iRobBqQt, { numOfType })

                    //nameEngineeringEng
                    type = getSoilGroupByKV('key', engineeringSoilGroupKey, keyName)

                }
                catch (err) {
                    console.log(err)
                }

                return type
            },
        }

        //rs
        let rs = genLayer(ltdt, optGenLayer)

        return rs
    }

    //gfRobertson1990
    let gfRobertson1990 = (T) => {

        //check
        if (T !== 'T4' && T !== 'T6') {
            throw new Error(`T[${T}] must be T4 or T6`)
        }

        //numOfType
        let n = T.replace('T', '')
        let numOfType = cint(n)

        //keyName
        let keyName = ''
        if (T === 'T4') {
            keyName = 'nameEngineeringEng'
        }
        else {
            keyName = 'nameEng'
        }

        //optGenLayer
        let optGenLayer = {
            ...opt,
            getType: (dt, kdt) => {
                // console.log(dt, kdt)

                //iRobFrQt, iRobBqQt
                let iRobFrQt = get(dt, 'iRobFrQt', '')
                let iRobBqQt = get(dt, 'iRobBqQt', '')

                //type
                let type = ''
                try {

                    //simplifyRobertson1990
                    let engineeringSoilGroupKey = simplifyRobertson1990(iRobFrQt, iRobBqQt, { numOfType })

                    //nameEngineeringEng
                    type = getSoilGroupByKV('key', engineeringSoilGroupKey, keyName)

                }
                catch (err) {
                    console.log(err)
                }

                return type
            },
        }

        //rs
        let rs = genLayer(ltdt, optGenLayer)

        return rs
    }

    //gfRobertson2009
    let gfRobertson2009 = (T) => {

        //check
        if (T !== 'T4' && T !== 'T6') {
            throw new Error(`T[${T}] must be T4 or T6`)
        }

        //numOfType
        let n = T.replace('T', '')
        let numOfType = cint(n)

        //keyName
        let keyName = ''
        if (T === 'T4') {
            keyName = 'nameEngineeringEng'
        }
        else {
            keyName = 'nameEng'
        }

        //optGenLayer
        let optGenLayer = {
            ...opt,
            getType: (dt, kdt) => {
                // console.log(dt, kdt)

                //iRobFrQtn, iRobBqQtn
                let iRobFrQtn = get(dt, 'iRobFrQtn', '')
                let iRobBqQtn = get(dt, 'iRobBqQtn', '')

                //type
                let type = ''
                try {

                    //simplifyRobertson2009
                    let engineeringSoilGroupKey = simplifyRobertson2009(iRobFrQtn, iRobBqQtn, { numOfType })

                    //nameEngineeringEng
                    type = getSoilGroupByKV('key', engineeringSoilGroupKey, keyName)

                }
                catch (err) {
                    console.log(err)
                }

                return type
            },
        }

        //rs
        let rs = genLayer(ltdt, optGenLayer)

        return rs
    }

    //gfRamsey
    let gfRamsey = (T) => {

        //check
        if (T !== 'T4' && T !== 'T6') {
            throw new Error(`T[${T}] must be T4 or T6`)
        }

        //numOfType
        let n = T.replace('T', '')
        let numOfType = cint(n)

        //keyName
        let keyName = ''
        if (T === 'T4') {
            keyName = 'nameEngineeringEng'
        }
        else {
            keyName = 'nameEng'
        }

        //optGenLayer
        let optGenLayer = {
            ...opt,
            getType: (dt, kdt) => {
                // console.log(dt, kdt)

                //iRamFrQt, iRamBqQt
                let iRamFrQt = get(dt, 'iRamFrQt', '')
                let iRamBqQt = get(dt, 'iRamBqQt', '')

                //type
                let type = ''
                try {

                    //simplifyRamsey
                    let engineeringSoilGroupKey = simplifyRamsey(iRamFrQt, iRamBqQt, { numOfType })

                    //nameEngineeringEng
                    type = getSoilGroupByKV('key', engineeringSoilGroupKey, keyName)

                }
                catch (err) {
                    console.log(err)
                }

                return type
            },
        }

        //rs
        let rs = genLayer(ltdt, optGenLayer)

        return rs
    }

    //kp
    let kp = {
        Ic: () => {
            return gfIc('Ic')
        },
        Icn: () => {
            return gfIc('Icn')
        },
        Robertson1986T6: () => {
            return gfRobertson1986('T6')
        },
        Robertson1986T4: () => {
            return gfRobertson1986('T4')
        },
        Robertson1990T6: () => {
            return gfRobertson1990('T6')
        },
        Robertson1990T4: () => {
            return gfRobertson1990('T4')
        },
        Robertson2009T6: () => {
            return gfRobertson2009('T6')
        },
        Robertson2009T4: () => {
            return gfRobertson2009('T4')
        },
        RamseyT6: () => {
            return gfRamsey('T6')
        },
        RamseyT4: () => {
            return gfRamsey('T4')
        },
    }

    //check
    if (!haskey(kp, method)) {
        console.log(`invalid method[${method}]`, kp)
        throw new Error(`invalid method[${method}]`)
    }

    //rs
    let gf = kp[method]
    let rs = gf()

    //calcLayersByMerge
    rs = calcLayersByMerge(rs, opt)

    return rs
}


function calcLayers(ltdt, methods = [], opt = {}) {

    //check
    if (!isearr(methods)) {
        throw new Error(`methods[${methods}] is not an effective array`)
    }

    //rrs
    let rrs = map(methods, (method) => {
        let rs = calcLayer(ltdt, method, opt)
        return {
            method,
            ltdt: rs,
        }
    })
    // console.log('rrs', rrs)

    return rrs
}


export {
    getKpSoilGroupsTn,
    genLayer,
    calcLayersByMerge,
    calcLayer,
    calcLayers
}
export default { //整合輸出預設得要有default
    getKpSoilGroupsTn,
    genLayer,
    calcLayersByMerge,
    calcLayer,
    calcLayers
}
