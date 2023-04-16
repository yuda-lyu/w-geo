import get from 'lodash/get'
import keys from 'lodash/keys'
import each from 'lodash/each'
import map from 'lodash/map'
import filter from 'lodash/filter'
import size from 'lodash/size'
import sortBy from 'lodash/sortBy'
import uniqBy from 'lodash/uniqBy'
import join from 'lodash/join'
import groupBy from 'lodash/groupBy'
import maxBy from 'lodash/maxBy'
import range from 'lodash/range'
import isNumber from 'lodash/isNumber'
import cloneDeep from 'lodash/cloneDeep'
import isarr from 'wsemi/src/isarr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isp0int from 'wsemi/src/isp0int.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cint from 'wsemi/src/cint.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import dig from 'wsemi/src/dig.mjs'
import sep from 'wsemi/src/sep.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import arrHas from 'wsemi/src/arrHas.mjs'
import judge from './judge.mjs'
import checkDepthStartEnd from './checkDepthStartEnd.mjs'
import calcDepthStartEndByConnect from './calcDepthStartEndByConnect.mjs'
import smoothDepthByKey from './smoothDepthByKey.mjs'
import { simplifyRobertson1986, simplifyRobertson1990, simplifyRobertson2009, simplifyRamsey } from './calcCptClassify.mjs'
import { getDepthMax } from './getDepthMaxMin.mjs'


function compressLayerByDig(layer, iDig = 1, opt = {}) { //iDig=1: 有效深度取至0.1m

    //check depthStart, depthEnd
    if (!haskey(layer, 'depthStart')) {
        throw new Error('invalid depthStart')
    }
    if (!haskey(layer, 'depthEnd')) {
        throw new Error('invalid depthEnd')
    }

    //chcek iDig
    if (!isp0int(iDig)) {
        iDig = 1
    }
    iDig = cint(iDig)

    //ds
    let ds = null
    if (isnum(layer.depthStart)) {
        ds = dig(layer.depthStart, iDig)
    }

    //de
    let de = null
    if (isnum(layer.depthEnd)) {
        de = dig(layer.depthEnd, iDig)
    }

    //若ds, de都為數字, 取dig就會為字串
    if (isestr(ds) && isestr(de) && ds === de) {
        //若起訖深度差距過小, 取指定小數位會造成深度相等代表無厚度, 進而導致與其他層重疊, 故需偵測是否相等
        //此外, 薄層之起訖深度在上下層還是會被取指定小數位, 故需直接刪除薄層
        ds = null
        de = null
    }

    //update
    layer.depthStart = ds
    layer.depthEnd = de

    //dc, 有depth才處理
    if (haskey(layer, 'depth')) {

        //dc
        let dc = null
        if (isnum(layer.depth)) {
            dc = dig(layer.depth, iDig + 1) //起訖深度之中點深度需要再多1位
        }

        //update
        layer.depth = dc

    }

    return layer
}


function compressLayersByDig(layers, iDig = 1, opt = {}) { //iDig=1: 有效深度取至0.1m

    //dig
    layers = map(layers, (v) => {
        return compressLayerByDig(v, iDig, opt)
    })
    // console.log('compressLayersByDig1', cloneDeep(layers))

    //filter
    layers = filter(layers, (v) => {
        return v.depthStart !== null && v.depthEnd !== null //刪除薄層
    })
    // console.log('compressLayersByDi2', cloneDeep(layers))

    return layers
}


function ckMixType(type) {
    let r = false
    if (isestr(type)) {
        r = type.indexOf('/') >= 0 //為混合層
    }
    else {
        console.log('invalid type', type)
        throw new Error('invalid type')
    }
    return r
}


function ckSandType(type) {
    return type === 'sand' || type === 'silty-sand' || type === 'clayey-sand'
}


function ckSiltType(type) {
    return type === 'silt' || type === 'sandy-silt' || type === 'clayey-silt'
}


function ckClayType(type) {
    return type === 'clay' || type === 'sandy-clay' || type === 'silty-clay'
}


function ckMixTypeAndSand(type) {
    let r = false
    if (ckMixType(type)) {
        return true //混合層
    }
    if (ckSandType(type)) {
        return true //砂層
    }
    return r
}


function getGeneralType(type) {
    if (ckSandType(type)) {
        return 'sand'
    }
    else if (ckSiltType(type)) {
        return 'silt'
    }
    else if (ckClayType(type)) {
        return 'clay'
    }
    return type //回傳混合層
}


function mergeAttrStr(tr1, tr2) {
    let t = `${cstr(tr1)},${cstr(tr2)}`
    t = sep(t, ',')
    t = join(t, ',')
    return t
}


function removeByThickness(layers, opt = {}) {
    let bLog = false

    //removeMethod
    let removeMethod = get(opt, 'removeMethod')
    if (removeMethod !== 'none' && removeMethod !== 'general' && removeMethod !== 'type' && removeMethod !== 'gtype') {
        removeMethod = 'general'
    }
    // console.log('removeMethod', removeMethod)

    //check
    if (removeMethod === 'none') {
        return layers
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

    //keyTestRela
    let keyTestRela = get(opt, 'keyTestRela')
    if (!isestr(keyTestRela)) {
        keyTestRela = 'testRela'
    }

    //keySampleGroupId
    let keySampleGroupId = get(opt, 'keySampleGroupId')
    if (!isestr(keySampleGroupId)) {
        keySampleGroupId = 'sampleGroupId'
    }

    //removeDisableGeneralType
    let removeDisableGeneralType = get(opt, 'removeDisableGeneralType')
    // console.log('removeDisableGeneralType', removeDisableGeneralType)

    //removeDepthMin
    let removeDepthMin = get(opt, 'removeDepthMin')
    if (!isnum(removeDepthMin)) {
        removeDepthMin = null
    }
    else {
        removeDepthMin = cdbl(removeDepthMin)
    }
    // console.log('removeDepthMin', removeDepthMin)

    //removeThicknessMax
    let removeThicknessMax = get(opt, 'removeThicknessMax')
    if (!isnum(removeThicknessMax)) {
        return layers //若非數字則直接回傳, 使能支援設定不進行刪除薄層
    }
    removeThicknessMax = cdbl(removeThicknessMax)
    if (removeThicknessMax <= 0) {
        return layers //若<=0則直接回傳, 使能支援設定不進行刪除薄層
    }
    // console.log('removeThicknessMax', removeThicknessMax)

    //removeDisableType
    let removeDisableType = get(opt, 'removeDisableType')
    // console.log('removeDisableType', removeDisableType)

    //removeDisableTestRela
    let removeDisableTestRela = get(opt, 'removeDisableTestRela')
    // console.log('removeDisableTestRela', removeDisableTestRela)

    //checkDepthStartEnd
    let ckds = checkDepthStartEnd(layers, { keyDepthStart, keyDepthEnd })
    if (size(ckds) > 0) {
        throw new Error(join(ckds, ', '))
    }

    //getSoilSection
    let getSoilSection = (v) => {

        //ds
        let ds = get(v, keyDepthStart, null)
        if (isnum(ds)) {
            ds = cdbl(ds)
        }

        //de
        let de = get(v, keyDepthEnd, null)
        if (isnum(de)) {
            de = cdbl(de)
        }

        //thickness
        let tk = null
        if (ds !== null && de !== null) {
            tk = de - ds
        }

        //type
        let type = get(v, keyType, null)

        //gtype
        let gtype = null
        if (isestr(type)) {
            gtype = getGeneralType(type)
        }

        //testRela
        let testRela = get(v, keyTestRela, null)

        return {
            // ds,
            // de,
            tk,
            type,
            gtype,
            testRela,
        }
    }

    //markDelLayer
    let markDelLayer = (mode, k, useTarType = false) => {
        if (bLog) console.log('刪除', mode, k, 'useTarType', useTarType)

        if (mode === 'up') { //標注要刪除下層

            //上層起始深度給予本層起始深度
            layers[k][keyDepthStart] = layers[k - 1][keyDepthStart]

            //mergeAttrStr
            layers[k][keyTestRela] = mergeAttrStr(layers[k][keyTestRela], layers[k - 1][keyTestRela])
            layers[k][keySampleGroupId] = mergeAttrStr(layers[k][keySampleGroupId], layers[k - 1][keySampleGroupId])

            //useTarType
            if (useTarType) {
                layers[k][keyType] = layers[k - 1][keyType]
            }

            //標注上層需刪除
            layers[k - 1] = {
                needDelete: true
            }

        }
        else if (mode === 'down') { //標注要刪除上層

            //下層結束深度給予本層結束深度
            layers[k][keyDepthEnd] = layers[k + 1][keyDepthEnd]

            //mergeAttrStr
            layers[k][keyTestRela] = mergeAttrStr(layers[k][keyTestRela], layers[k + 1][keyTestRela])
            layers[k][keySampleGroupId] = mergeAttrStr(layers[k][keySampleGroupId], layers[k + 1][keySampleGroupId])

            //useTarType
            if (useTarType) {
                layers[k][keyType] = layers[k + 1][keyType]
            }

            //標注下層需刪除
            layers[k + 1] = {
                needDelete: true
            }

        }
        else {
            throw new Error(`invalid mode(${mode})`)
        }

    }

    function core() {

        //cloneDeep
        layers = cloneDeep(layers)
        // console.log('core layers', cloneDeep(layers))

        //detect
        each(layers, (v, k) => {

            //check, 小於最小指定深度不進行刪除薄層
            if (removeDepthMin !== null && cdbl(v.depthStart) <= removeDepthMin) {
                return true //跳出換下一個
            }

            //v0
            let v0 = get(layers, k - 1, null)
            let v1 = get(layers, k + 0, null)
            let v2 = get(layers, k + 1, null)

            let d0 = getSoilSection(v0)
            // let ds0 = get(d0, 'ds')
            // let de0 = get(d0, 'de')
            let tk0 = get(d0, 'tk')
            let tp0 = get(d0, 'type')
            let tgp0 = get(d0, 'gtype')
            let tr0 = get(d0, 'testRela')

            //check removeDisableType
            let bd0 = false
            if (isearr(removeDisableType)) {
                if (arrHas(removeDisableType, tp0)) { //禁止移除type
                    bd0 = true
                }
            }

            //check removeDisableGeneralType
            let bdg0 = false
            if (isearr(removeDisableGeneralType)) {
                if (arrHas(removeDisableGeneralType, tgp0)) { //禁止移除gtype
                    bdg0 = true
                }
            }

            //check removeDisableTestRela
            let bdtr0 = false
            if (isearr(removeDisableTestRela)) {
                if (arrHas(removeDisableTestRela, sep(tr0, ','))) { //禁止移除testRela
                    bdtr0 = true
                }
            }
            else if (removeDisableTestRela === 'all') {
                if (isestr(tr0)) { //禁止移除testRela
                    bdtr0 = true
                }
            }

            //b0
            let b0 = !bd0 && !bdg0 && !bdtr0

            let d1 = getSoilSection(v1)
            // let ds1 = get(d1, 'ds')
            // let de1 = get(d1, 'de')
            let tk1 = get(d1, 'tk')
            let tp1 = get(d1, 'type')
            let tgp1 = get(d1, 'gtype')
            let tr1 = get(d1, 'testRela')

            //check removeDisableType
            if (isearr(removeDisableType)) {
                if (arrHas(removeDisableType, tp1)) { //禁止移除type
                    return true //跳出換下一個
                }
            }

            //check removeDisableGeneralType
            if (isearr(removeDisableGeneralType)) {
                if (arrHas(removeDisableGeneralType, tgp1)) { //禁止移除gtype
                    return true //跳出換下一個
                }
            }

            //check removeDisableTestRela
            if (isearr(removeDisableTestRela)) {
                if (arrHas(removeDisableTestRela, sep(tr1, ','))) { //禁止移除testRela
                    // console.log('禁止移除testRela', v1, tr1, removeDisableTestRela)
                    return true //跳出換下一個
                }
            }
            else if (removeDisableTestRela === 'all') {
                if (isestr(tr1)) { //禁止移除testRela
                    // console.log('禁止移除testRela', v1, tr1, removeDisableTestRela)
                    return true //跳出換下一個
                }
            }

            let d2 = getSoilSection(v2)
            // let ds2 = get(d2, 'ds')
            // let de2 = get(d2, 'de')
            let tk2 = get(d2, 'tk')
            let tp2 = get(d2, 'type')
            let tgp2 = get(d2, 'gtype')
            let tr2 = get(d2, 'testRela')

            //check removeDisableType
            let bd2 = false
            if (isearr(removeDisableType)) {
                if (arrHas(removeDisableType, tp2)) { //禁止移除type
                    bd2 = true
                }
            }

            //check removeDisableGeneralType
            let bdg2 = false
            if (isearr(removeDisableGeneralType)) {
                if (arrHas(removeDisableGeneralType, tgp2)) { //禁止移除gtype
                    bdg2 = true
                }
            }

            //check removeDisableTestRela
            let bdtr2 = false
            if (isearr(removeDisableTestRela)) {
                if (arrHas(removeDisableTestRela, sep(tr2, ','))) { //禁止移除testRela
                    bdtr2 = true
                }
            }
            else if (removeDisableTestRela === 'all') {
                if (isestr(tr2)) { //禁止移除testRela
                    bdtr2 = true
                }
            }

            //b2
            let b2 = !bd2 && !bdg2 && !bdtr2

            //check
            if (tk1 <= removeThicknessMax) {
                if (bLog) console.log(k, v1, 'tk1 <= removeThicknessMax', tk1 <= removeThicknessMax)

                //偵測type
                let bCanRemoveType = removeMethod === 'general' || removeMethod === 'type'
                if (bCanRemoveType) {

                    //偵測type
                    if (tp0 !== null && tp1 === tp0) { //本層與上層同type
                        if (bLog) console.log('A 偵測type, 本層與上層同type')
                        if (b0) {
                            markDelLayer('up', k) //刪除上層
                            return false //跳出
                        }
                        else {
                            if (bLog) console.log('A 上層禁止被刪除')
                        }
                    }
                    if (tp2 !== null && tp1 === tp2) { //本層與下層同type
                        if (bLog) console.log('B 偵測type, 本層與下層同type')
                        if (b2) {
                            markDelLayer('down', k) //刪除下層
                            return false //跳出
                        }
                        else {
                            if (bLog) console.log('B 下層禁止被刪除')
                        }
                    }

                }

                //偵測gtype
                let bCanRemoveGtype = removeMethod === 'general' || removeMethod === 'gtype'
                if (bCanRemoveGtype) {

                    //偵測gtype
                    if (tgp0 !== null && tgp1 === tgp0) { //本層與上層同gtype
                        if (bLog) console.log('C 偵測gtype, 本層與上層同gtype')
                        if (b0) {
                            markDelLayer('up', k) //刪除上層
                            return false //跳出
                        }
                        else {
                            if (bLog) console.log('C 上層禁止被刪除')
                        }
                    }
                    if (tgp2 !== null && tgp1 === tgp2) { //本層與下層同gtype
                        if (bLog) console.log('D 偵測gtype, 本層與下層同gtype')
                        if (b2) {
                            markDelLayer('down', k) //刪除下層
                            return false //跳出
                        }
                        else {
                            if (bLog) console.log('D 下層禁止被刪除')
                        }
                    }

                }

                //偵測thickness
                if (tk0 !== null && tk2 !== null) {
                    if (tk0 >= tk2) { //有上下層, 上層比下層厚
                        if (bLog) console.log('E 偵測thickness, 有上下層, 上層比下層厚')
                        if (b0) {
                            markDelLayer('up', k, true) //刪除上層, 並且使用上層type
                            return false //跳出
                        }
                        else {
                            if (bLog) console.log('E 上層禁止被刪除')
                        }
                    }
                    else { //有上下層, 下層比上層厚
                        if (bLog) console.log('F 偵測thickness, 有上下層, 下層比上層厚')
                        if (b2) {
                            markDelLayer('down', k, true) //刪除下層, 並且使用下層type
                            return false //跳出
                        }
                        else {
                            if (bLog) console.log('F 下層禁止被刪除')
                        }
                    }
                }
                if (tk0 === null && tk2 !== null) { //無上層只有下層
                    if (tk1 >= tk2) { //本層比下層厚
                        if (bLog) console.log('G 偵測thickness, 無上層只有下層, 本層比下層厚')
                        if (b2) {
                            markDelLayer('down', k) //刪除下層
                            return false //跳出
                        }
                        else {
                            if (bLog) console.log('G 下層禁止被刪除')
                        }
                    }
                    else { //下層比本層厚
                        if (bLog) console.log('H 偵測thickness, 無上層只有下層, 下層比本層厚')
                        if (b2) {
                            markDelLayer('down', k, true) //刪除下層, 並且使用下層type
                            return false //跳出
                        }
                        else {
                            if (bLog) console.log('H 下層禁止被刪除')
                        }
                    }
                }
                if (tk0 !== null && tk2 === null) { //無下層只有上層
                    if (tk1 >= tk0) { //本層比上層厚
                        if (bLog) console.log('I 偵測thickness, 無下層只有上層, 本層比上層厚')
                        if (b0) {
                            markDelLayer('up', k) //刪除上層
                            return false //跳出
                        }
                        else {
                            if (bLog) console.log('I 上層禁止被刪除')
                        }
                    }
                    else { //上層比本層厚
                        if (bLog) console.log('J 偵測thickness, 無下層只有上層, 上層比本層厚')
                        if (b0) {
                            markDelLayer('up', k, true) //刪除上層, 並且使用上層type
                            return false //跳出
                        }
                        else {
                            if (bLog) console.log('J 上層禁止被刪除')
                        }
                    }
                }
                if (tk1 !== null) { //無法刪除上下層, 只能刪除本層
                    if (k === 0) {
                        if (bLog) console.log('K 無法刪除上下層, 只能刪除本層, 刪除本層併入下層')
                        markDelLayer('up', k + 1) //刪除k+1的上層也就是本層, 因此會併入下層
                        return false //跳出
                    }
                    else {
                        if (bLog) console.log('K 無法刪除上下層, 只能刪除本層, 刪除本層併入上層')
                        markDelLayer('down', k - 1) //刪除k-1的下層也就是本層, 因此會併入上層
                        return false //跳出
                    }
                }

            }

        })

        // each(layers, (v) => {
        //     if (v.sampleGroupId === 'P079') {
        //         console.log('1 找到P079', v)
        //         return false //跳出
        //     }
        // })

        //刪除被合併層
        layers = filter(layers, (v) => {
            return !haskey(v, 'needDelete')
        })

        // each(layers, (v) => {
        //     if (v.sampleGroupId === 'P079') {
        //         console.log('2 找到P079', v)
        //         return false //跳出
        //     }
        // })

        return layers
    }

    //n0
    let n0 = size(layers)

    //first
    layers = core(layers)

    //n1
    let n1 = size(layers)

    //detect
    while (n0 !== n1) {
        n0 = n1
        layers = core(layers)
        n1 = size(layers)
    }

    return layers
}


function mergeBySameGeneralType(layers, opt = {}) {
    let bLog = false

    //mergeMethod
    let mergeMethod = get(opt, 'mergeMethod')
    if (mergeMethod !== 'none' && mergeMethod !== 'general' && mergeMethod !== 'type' && mergeMethod !== 'gtype') {
        mergeMethod = 'general'
    }
    // console.log('mergeMethod', mergeMethod)

    //check
    if (mergeMethod === 'none') {
        return layers
    }

    //keyTestRela
    let keyTestRela = get(opt, 'keyTestRela')
    if (!isestr(keyTestRela)) {
        keyTestRela = 'testRela'
    }

    //keySampleGroupId
    let keySampleGroupId = get(opt, 'keySampleGroupId')
    if (!isestr(keySampleGroupId)) {
        keySampleGroupId = 'sampleGroupId'
    }

    //mergeDisableType
    let mergeDisableType = get(opt, 'mergeDisableType')
    // console.log('mergeDisableType', mergeDisableType)

    //mergeDisableTestRela
    let mergeDisableTestRela = get(opt, 'mergeDisableTestRela')
    // console.log('mergeDisableTestRela', mergeDisableTestRela)

    function core() {

        //cloneDeep
        layers = cloneDeep(layers)

        //ubgs
        let ubgs = size(layers) - 1

        //merge
        each(layers, (v, k) => {

            //check
            if (k >= ubgs) {
                return false //跳出
            }

            //bMerge
            let bMerge = false

            //k0, v0, t0
            let k0 = k
            let v0 = v
            let tp0 = v0.type
            let testRela0 = v0.testRela
            let tk0 = cdbl(v0.depthEnd) - cdbl(v0.depthStart)

            //k1, v1, t1
            let k1 = k0 + 1
            let v1 = layers[k1]
            let tp1 = v1.type
            let testRela1 = v1.testRela
            let tk1 = cdbl(v1.depthEnd) - cdbl(v1.depthStart)

            //getGeneralType, 取得泛用土壤單元
            let tgp0 = getGeneralType(tp0)
            let tgp1 = getGeneralType(tp1)
            // console.log(v0.depthStart, v0.depthEnd, v1.depthEnd, 'tp0', tp0, 'tp1', tp1, 'tgp0', tgp0, 'tgp1', tgp1, `tgp0 === tgp1`, tgp0 === tgp1)

            //不能用ckEffType跳出, 因若是為混合層也需可以自動合併

            //偵測土壤單元一致進行合併
            let bCanMergeType = mergeMethod === 'general' || mergeMethod === 'type'
            if (!bMerge && bCanMergeType && tp0 === tp1) {
                if (bLog) console.log('偵測土壤單元一致進行合併', k, 'v0', `'${cstr(v0.sampleGroupId)}'`, 'v1', `'${cstr(v1.sampleGroupId)}'`, tp1)

                //update
                bMerge = true

            }

            //偵測泛用土壤單元一致進行合併
            let bCanMergeGtype = mergeMethod === 'general' || mergeMethod === 'gtype'
            if (!bMerge && bCanMergeGtype && tgp0 === tgp1) {
                if (bLog) console.log('泛用土壤單元一致', k, 'v0', `'${cstr(v0.sampleGroupId)}'`, tp0, 'v1', `'${cstr(v1.sampleGroupId)}'`, tp1, '泛用土壤單元', tgp1)

                //check mergeDisableType
                if (isearr(mergeDisableType)) {
                    if (tp0 !== tp1) { //若上下兩層是不同type
                        if (arrHas(mergeDisableType, tp0) || arrHas(mergeDisableType, tp1)) { //禁止合併type
                            return true //跳出換下一個
                        }
                        if (bLog) console.log('A 泛用土壤單元一致, 上下層不同type, 有給禁止合併type清單, 位於清單中禁止合併type')
                    }
                    else {
                        //若同type則可自動合併, 即便是為指定mergeDisableType中的type也不會有影響, 後續檢查有可能不過得繼續
                        if (bLog) console.log('B 泛用土壤單元一致, 上下層同type, 有給禁止合併type清單, 上下層同type可自動合併')
                    }
                }

                //check mergeDisableTestRela
                if (tp0 !== tp1) { //若上下兩層是不同type
                    if (isearr(mergeDisableTestRela)) {
                        if (arrHas(mergeDisableTestRela, sep(testRela0, ',')) || arrHas(mergeDisableTestRela, sep(testRela1, ','))) { //禁止合併testRela
                            if (bLog) console.log('C 禁止合併testRela', v0, testRela0, v1, testRela1, mergeDisableTestRela)
                            return true //跳出換下一個
                        }
                        if (bLog) console.log('D 上下層不同type, 有給禁止合併type清單, 可允許合併')
                    }
                    else if (mergeDisableTestRela === 'all') {
                        if (isestr(testRela0) || isestr(testRela1)) { //禁止合併testRela
                            if (bLog) console.log('E 禁止合併testRela', v0, testRela0, v1, testRela1, mergeDisableTestRela)
                            return true //跳出換下一個
                        }
                        if (bLog) console.log('F 上下層不同type, 全部禁止合併type, 可允許合併')
                    }
                }
                else {
                    //若同type則可自動合併
                    if (bLog) console.log('G 同type則可自動合併')
                }

                //update
                bMerge = true

            }

            //check
            if (!bMerge) {
                return true //跳出換下一個
            }

            if (tk0 >= tk1) { //上層比較厚
                if (bLog) console.log('H 可合併, 上層比較厚')

                //下層結束深度給予上層結束深度
                layers[k0].depthEnd = layers[k1].depthEnd

                //mergeAttrStr
                layers[k0][keyTestRela] = mergeAttrStr(layers[k0][keyTestRela], layers[k1][keyTestRela])
                layers[k0][keySampleGroupId] = mergeAttrStr(layers[k0][keySampleGroupId], layers[k1][keySampleGroupId])

                //標注下層需刪除
                layers[k1] = {
                    needDelete: true
                }

            }
            else { //下層比較厚
                if (bLog) console.log('I 可合併, 下層比較厚')

                //上層起始深度給予下層起始深度
                layers[k1].depthStart = layers[k0].depthStart

                //mergeAttrStr
                layers[k1][keyTestRela] = mergeAttrStr(layers[k1][keyTestRela], layers[k0][keyTestRela])
                layers[k1][keySampleGroupId] = mergeAttrStr(layers[k1][keySampleGroupId], layers[k0][keySampleGroupId])

                //標注上層需刪除
                layers[k0] = {
                    needDelete: true
                }

            }

            return false //已出現並需回傳合併土層, 中斷跳出
        })

        //刪除被合併層
        layers = filter(layers, (v) => {
            return !haskey(v, 'needDelete')
        })
        // console.log('合併後層數', size(layers))

        return layers
    }

    //n0
    let n0 = size(layers)

    //first
    layers = core(layers)

    //n1
    let n1 = size(layers)

    //detect
    while (n0 !== n1) {
        n0 = n1
        layers = core(layers)
        n1 = size(layers)
    }

    return layers
}


function combineMixByBasicTypeRatio($an, layers, opt = {}) {

    //combineMethod
    let combineMethod = get(opt, 'combineMethod')
    if (combineMethod !== 'none' && combineMethod !== 'general' && combineMethod !== 'generalAndNoSand') {
        combineMethod = 'general'
    }
    // console.log('combineMethod', combineMethod)

    //check
    if (combineMethod === 'none') {
        return layers
    }

    //keyTestRela
    let keyTestRela = get(opt, 'keyTestRela')
    if (!isestr(keyTestRela)) {
        keyTestRela = 'testRela'
    }

    //keySampleGroupId
    let keySampleGroupId = get(opt, 'keySampleGroupId')
    if (!isestr(keySampleGroupId)) {
        keySampleGroupId = 'sampleGroupId'
    }

    //combineDepthMin
    let combineDepthMin = get(opt, 'combineDepthMin')
    if (!isnum(combineDepthMin)) {
        combineDepthMin = null
    }
    else {
        combineDepthMin = cdbl(combineDepthMin)
    }
    // console.log('combineDepthMin', combineDepthMin)

    //combineRatioLim, 厚度比例
    let combineRatioLim = get(opt, 'combineRatioLim')
    if (!isnum(combineRatioLim)) {
        combineRatioLim = 0.11
    }
    combineRatioLim = cdbl(combineRatioLim)
    // console.log('combineRatioLim', combineRatioLim)

    //combineDisableType
    let combineDisableType = get(opt, 'combineDisableType')
    // console.log('combineDisableType', combineDisableType)

    //combineDisableTestRela
    let combineDisableTestRela = get(opt, 'combineDisableTestRela')
    // console.log('combineDisableTestRela', combineDisableTestRela)

    //combineThicknessMax
    let combineThicknessMax = get(opt, 'combineThicknessMax')
    if (!isnum(combineThicknessMax)) {
        combineThicknessMax = null
    }
    else {
        combineThicknessMax = cdbl(combineThicknessMax)
    }
    // console.log('combineThicknessMax', combineThicknessMax)

    function core() {

        //cloneDeep
        layers = cloneDeep(layers)

        //ubgs
        let ubgs = size(layers) - 1

        //getRatio
        let getRatio = (kgs) => {

            //kskgs
            let kskgs = keys(kgs)

            //check
            if (size(kskgs) <= 1) {
                return 0 //0代表1:1, 含量平均分佈, 可合併
            }
            if (size(kskgs) >= 3) {
                return 1 //1代表1:0, 無法合併
            }

            //計算2種種類厚度比例
            let kg0 = kskgs[0]
            let tk0 = kgs[kg0]
            let kg1 = kskgs[1]
            let tk1 = kgs[kg1]

            //計算2種種類含量比例
            let tall = tk0 + tk1
            let tdiff = Math.abs(tk0 - tk1)
            // console.log('tall', tall, 'tdiff', tdiff)

            //check
            if (tall <= 0) {
                return 1 //1代表1:0, 無法合併
            }

            return tdiff / tall
        }

        //getMixKey
        let getMixKey = ($an, kgs) => {

            //kskgs
            let kskgs = keys(kgs)

            //check
            if (size(kskgs) !== 2) {
                return ''
            }

            //kg1, kg2
            let kg1 = kskgs[0]
            let kg2 = kskgs[1]

            //產生混合層中文名稱, 比較不會受key或英文名稱可能有順序問題
            let soilGroupNameCht = ''
            if (kg1 === 'sand' || kg2 === 'sand') {
                soilGroupNameCht += '砂'
            }
            if (kg1 === 'silt' || kg2 === 'silt') {
                soilGroupNameCht += '粉'
            }
            if (kg1 === 'clay' || kg2 === 'clay') {
                soilGroupNameCht += '黏'
            }
            soilGroupNameCht += '混合土' //統一混合土名稱為OX混合土, 故得要同步修改 (2022/01/20)

            //getSoilGroupByKV
            let soilGroupKey = $an.getSoilGroupByKV('nameCht', soilGroupNameCht, 'key')
            // console.log('$an.getSoilGroupByKV', kg1, kg2, soilGroupNameCht, soilGroupKey)

            return soilGroupKey
        }

        //merge
        let vds = []
        each(layers, (v, k) => {
            // console.log('偵測混合', k, v[keySampleGroupId], v[keyTestRela])

            //check, 小於最小指定深度不進行合併出混合土
            if (combineDepthMin !== null && cdbl(v.depthStart) <= combineDepthMin) {
                return true //跳出換下一個
            }

            //kgs
            let kgs = {}

            //k0, v0, t0
            let k0 = k
            let v0 = v
            let tp0 = v0.type
            let testRela0 = v0.testRela
            let tk0 = cdbl(v0.depthEnd) - cdbl(v0.depthStart)

            //check combineMethod
            if (combineMethod === 'general' && ckMixType(v0.type)) { //混合土壤單元不合併
                return true //跳出換下一個
            }
            else if (combineMethod === 'generalAndNoSand' && ckMixTypeAndSand(v0.type)) { //混合與砂之土壤單元不合併
                return true //跳出換下一個
            }

            //check combineDisableType
            if (isearr(combineDisableType)) {
                if (arrHas(combineDisableType, tp0)) { //禁止合併混合type
                    return true //跳出換下一個
                }
            }

            //check combineDisableTestRela
            if (isearr(combineDisableTestRela)) {
                if (arrHas(combineDisableTestRela, sep(testRela0, ','))) { //禁止合併混合testRela
                    // console.log('禁止合併混合testRela0', v0, testRela0, combineDisableTestRela)
                    return true //跳出換下一個
                }
            }
            else if (combineDisableTestRela === 'all') {
                if (isestr(testRela0)) { //禁止合併混合testRela
                    // console.log('禁止合併混合testRela0', v0, testRela0, combineDisableTestRela)
                    return true //跳出換下一個
                }
            }

            //getGeneralType, 取得泛用土壤單元, 因有ckEffTypeAndNoSand故此處只有基本土壤單元
            let tgp0 = getGeneralType(tp0)

            //add tk
            if (!haskey(kgs, tgp0)) {
                kgs[tgp0] = 0
            }
            kgs[tgp0] += tk0

            //vd
            let vd = null
            each(range(1, ubgs + 1), (i) => {

                //k1, v1, t1
                let k1 = k0 + i
                if (k1 > ubgs) {
                    return false //跳出
                }
                let v1 = layers[k1]
                let tp1 = v1.type
                let testRela1 = v1.testRela
                let tk1 = cdbl(v1.depthEnd) - cdbl(v1.depthStart)
                // console.log('偵測後方混合', i, v1.sampleGroupId, v1.testRela)

                //check
                if (combineMethod === 'general' && ckMixType(v1.type)) { //混合土壤單元不合併
                    return false //跳出
                }
                else if (combineMethod === 'generalAndNoSand' && ckMixTypeAndSand(v1.type)) { //混合與砂之土壤單元不合併
                    return false //跳出
                }

                //check combineDisableType
                if (isearr(combineDisableType)) {
                    if (arrHas(combineDisableType, tp1)) { //禁止合併混合type
                        return false //跳出
                    }
                }

                //check combineDisableTestRela
                if (isearr(combineDisableTestRela)) {
                    if (arrHas(combineDisableTestRela, sep(testRela1, ','))) { //禁止合併混合testRela
                        // console.log('禁止合併混合testRela1', v1, testRela1, combineDisableTestRela)
                        return false //跳出
                    }
                }
                else if (combineDisableTestRela === 'all') {
                    if (isestr(testRela1)) { //禁止合併混合testRela
                        // console.log('禁止合併混合testRela1', v1, testRela1, combineDisableTestRela)
                        return false //跳出
                    }
                }

                //getGeneralType, 取得泛用土壤單元, 因有ckEffTypeAndNoSand故此處只有基本土壤單元
                let tpg1 = getGeneralType(tp1)

                //add tk
                if (!haskey(kgs, tpg1)) {
                    kgs[tpg1] = 0
                }
                kgs[tpg1] += tk1

                //nkgs
                let nkgs = size(keys(kgs))

                //check, 非2層(為1層或3層以上)基本土壤單元就跳出
                if (nkgs !== 2) {
                    return false //跳出
                }

                //getRatio, 有2層時計算並儲存有效比例
                let kgsRatio = getRatio(kgs)
                // console.log('kgsRatio', kgsRatio)

                //check
                if (kgsRatio <= combineRatioLim) {
                    // console.log('視為可合併', kgsRatio, combineRatioLim)

                    //儲存有效比例
                    vd = {
                        kgs: cloneDeep(kgs),
                        kgsRatio,
                        k0,
                        kn: k1,
                        // ns: k1 - k0 + 1,
                        tks: cdbl(v1.depthEnd) - cdbl(v0.depthStart)
                    }
                    // console.log('save vd', vd)

                }

            })

            //check
            if (vd !== null) {
                // console.log('偵測到有效vd', vd)

                //push
                vds.push(vd)

            }

        })

        //combineThicknessMax
        if (size(vds) > 0 && isnum(combineThicknessMax)) {
            vds = filter(vds, (vv) => {
                return vv.tks <= combineThicknessMax
            })
        }

        //check
        if (size(vds) > 0) {
            // console.log('vds', cloneDeep(vds))

            //vdMax
            let vdMax = maxBy(vds, 'tks')
            // console.log('vdMax', vdMax)

            //getMixKey
            let soilGroupKey = getMixKey($an, vdMax.kgs)
            // console.log('soilGroupKey', soilGroupKey)

            //check
            if (!isestr(soilGroupKey)) {
                console.log('vdMax.kgs', vdMax.kgs)
                throw new Error('invalid soilGroupKey')
            }

            //儲存type
            layers[vdMax.k0].type = soilGroupKey

            //最下層結束深度給予最上層結束深度
            layers[vdMax.k0].depthEnd = layers[vdMax.kn].depthEnd

            //標注非最上層皆需刪除
            let testRelas = layers[vdMax.k0][keyTestRela] //連同本層(不刪除)都一起儲存
            let sampleGroupId = layers[vdMax.k0][keySampleGroupId] //連同本層(不刪除)都一起儲存
            for (let k = (vdMax.k0 + 1); k <= vdMax.kn; k++) {
                testRelas += `,${cstr(layers[k][keyTestRela])}`
                sampleGroupId += `,${cstr(layers[k][keySampleGroupId])}`
                layers[k] = {
                    needDelete: true
                }
            }
            // console.log('標注待刪除的layers', cloneDeep(layers))

            //合併keyTestRela
            layers[vdMax.k0][keyTestRela] = join(sep(testRelas, ','), ',')
            layers[vdMax.k0][keySampleGroupId] = join(sep(sampleGroupId, ','), ',')
            // console.log('合併前', size(layers), cloneDeep(layers))

            //刪除被合併層
            layers = filter(layers, (v) => {
                return !haskey(v, 'needDelete')
            })
            // console.log('合併後', size(layers), cloneDeep(layers))

        }

        return layers
    }

    //n0
    let n0 = size(layers)

    //first
    layers = core(layers)

    //n1
    let n1 = size(layers)

    //detect
    while (n0 !== n1) {
        n0 = n1
        layers = core(layers)
        n1 = size(layers)
    }

    return layers
}


function compressLayersByIntegrateCore($an, layers, opt = {}) {

    //combineMethod
    let combineMethod = get(opt, 'combineMethod')
    if (combineMethod !== 'none' && combineMethod !== 'general' && combineMethod !== 'generalAndNoSand') {
        combineMethod = 'general'
    }

    //mergeBySameGeneralType, 合併相同之基礎(砂,粉,黏)土壤單元
    try {
        layers = mergeBySameGeneralType(layers, opt)
    }
    catch (err) {
        console.log(err, 'layers', layers, 'opt', opt)
        throw new Error(err)
    }
    // console.log('mergeBySameGeneralType', cloneDeep(layers))

    //combineMixByBasicTypeRatio, 合併比例接近之2層基礎(砂,粉,黏)土壤單元, 已使用ISO分類可直接得混合土故不提供混合機制
    try {
        layers = combineMixByBasicTypeRatio($an, layers, opt)
    }
    catch (err) {
        console.log(err, 'layers', layers, 'opt', opt)
        throw new Error(err)
    }
    // console.log('combineMixByBasicTypeRatio', cloneDeep(layers))

    //removeByThickness, 刪除薄層, 需放最後避免影響合併, 刪除完也需要重新判識是否有相同或類似層能合併
    try {
        layers = removeByThickness(layers, opt)
    }
    catch (err) {
        console.log(err, 'layers', layers, 'opt', opt)
        throw new Error(err)
    }
    // console.log('removeByThickness', cloneDeep(layers))

    return layers
}


function getSlIntegrateStagesForTest() {
    let stages = [
        {
            mergeMethod: 'type', //只針對同type合併
            mergeDisableTestRela: 'all',
            combineMethod: 'none', //禁止合併出混合層
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '',
            combineRatioLimForSimple: '',
            combineDisableTestRela: [],
            combineThicknessMax: 2,
            removeMethod: 'type',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: 'all',
            removeThicknessMaxForAll: '0.49', //僅刪除薄層
            removeThicknessMaxForMix: '',
            removeThicknessMaxForSimple: '',
        },
        // {
        //     mergeMethod: 'type', //只針對同type合併
        //     mergeDisableTestRela: 'all',
        //     combineMethod: 'general', //試驗分析階段需給予至少一輪合併出混合層設定, 因僅通過ISO無法分出足夠的混合層
        //     // combineMethod: 'none', //測試修改GIR一期三混合土門檻, 會有天然的混合土出來, 故先禁止合併出混合層, 仍無有效合理門檻
        //     combineDepthMin: '',
        //     combineRatioLimForAll: '',
        //     combineRatioLimForMix: '0.21',
        //     combineRatioLimForSimple: '0',
        //     combineDisableTestRela: 'all',
        //     combineThicknessMax: 2,
        //     removeMethod: 'type',
        //     removeDepthMin: '',
        //     removeDisableGeneralType: [],
        //     removeDisableTestRela: 'all',
        //     removeThicknessMaxForAll: '0.49',
        //     removeThicknessMaxForMix: '',
        //     removeThicknessMaxForSimple: '',
        // },
    ]
    return stages
}


function getSlIntegrateStagesForDesign() {
    let stages = [
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            combineMethod: 'none',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '',
            combineRatioLimForSimple: '',
            combineDisableTestRela: [],
            combineThicknessMax: 2,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '0.49',
            removeThicknessMaxForMix: '',
            removeThicknessMaxForSimple: '',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            // combineMethod: 'generalAndNoSand',
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.11',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 2,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '0.51', //超過影響厚度故會刪除試驗樣本
            removeThicknessMaxForMix: '',
            removeThicknessMaxForSimple: '',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            // combineMethod: 'generalAndNoSand',
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.11',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 2,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '0.76', //超過影響厚度故會刪除試驗樣本
            removeThicknessMaxForMix: '',
            removeThicknessMaxForSimple: '',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            // combineMethod: 'generalAndNoSand',
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.11',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 2,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '1.01', //暴力刪除較厚薄層
            removeThicknessMaxForMix: '',
            removeThicknessMaxForSimple: '',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.21',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 2,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '1.01', //暴力刪除較厚薄層
            removeThicknessMaxForMix: '0',
            removeThicknessMaxForSimple: '0',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.21',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 2,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '1.26', //暴力刪除較厚薄層
            removeThicknessMaxForMix: '0',
            removeThicknessMaxForSimple: '0',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.41',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 2,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '1.26', //暴力刪除較厚薄層
            removeThicknessMaxForMix: '0',
            removeThicknessMaxForSimple: '0',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.41',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 2,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '1.51', //暴力刪除較厚薄層
            removeThicknessMaxForMix: '0',
            removeThicknessMaxForSimple: '0',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.41',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 3,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '1.76', //暴力刪除較厚薄層
            removeThicknessMaxForMix: '0',
            removeThicknessMaxForSimple: '0',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.41',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 4,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '2.01', //暴力刪除較厚薄層
            removeThicknessMaxForMix: '0',
            removeThicknessMaxForSimple: '0',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.41',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 5,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '2.26', //暴力刪除較厚薄層
            removeThicknessMaxForMix: '0',
            removeThicknessMaxForSimple: '0',
        },
        {
            numLayersLessThen: 35,
        },
        {
            mergeMethod: 'general',
            mergeDisableTestRela: [],
            combineMethod: 'general',
            combineDepthMin: '',
            combineRatioLimForAll: '',
            combineRatioLimForMix: '0.41',
            combineRatioLimForSimple: '0',
            combineDisableTestRela: [],
            combineThicknessMax: 6,
            removeMethod: 'general',
            removeDepthMin: '',
            removeDisableGeneralType: [],
            removeDisableTestRela: [],
            removeThicknessMaxForAll: '2.51', //暴力刪除較厚薄層
            removeThicknessMaxForMix: '0',
            removeThicknessMaxForSimple: '0',
        },
    ]
    return stages
}


function slIntegrate($an, layers, opt = {}) {

    //useMix
    let useMix = get(opt, 'useMix')
    if (!isbol(useMix)) {
        useMix = true
    }

    //stages
    let stages = get(opt, 'stages')
    if (!isarr(stages)) {
        stages = getSlIntegrateStagesForTest()
    }
    // console.log('stages', stages)

    function core(layers, optExt = {}) {

        let optUse = {
            ...opt,
            ...optExt,
        }

        let n0 = size(layers)

        layers = compressLayersByIntegrateCore($an, layers, optUse)
        let n1 = size(layers)

        while (n0 !== n1) {
            n0 = n1
            layers = compressLayersByIntegrateCore($an, layers, optUse)
            n1 = size(layers)
        }

        return layers
    }

    //stages
    each(stages, (stage) => {

        //numLayersLessThen
        let numLayersLessThen = get(stage, 'numLayersLessThen', null)

        //check
        if (isNumber(numLayersLessThen)) {
            if (size(layers) <= numLayersLessThen) { //若層數已滿足則跳出
                return false //跳出
            }
            else {
                return true //跳出換下一個
            }
        }
        // console.log('stage', cloneDeep(stage))

        //merge
        let mergeMethod = get(stage, 'mergeMethod', '')
        let mergeDisableTestRela = get(stage, 'mergeDisableTestRela', [])

        //combine
        //combineRatioLim = 0.11 //0.11代表介於5.5:4.5至4.5:5.5之間
        //combineRatioLim = 0.21 //0.21代表介於6:4至4:6之間
        //combineRatioLim = 0.41 //0.41代表介於7:3至3:7之間
        //combineRatioLim = 0.61 //0.61代表介於8:3至2:8之間
        //combineRatioLim = 0.81 //0.81代表介於9:1至1:9之間
        let combineMethod = get(stage, 'combineMethod', '')
        let combineDepthMin = get(stage, 'combineDepthMin', '')
        let combineRatioLim = ''
        let combineRatioLimForAll = get(stage, 'combineRatioLimForAll', '')
        let combineRatioLimForMix = get(stage, 'combineRatioLimForMix', '')
        let combineRatioLimForSimple = get(stage, 'combineRatioLimForSimple', '')
        if (combineMethod !== 'none') {
            if (isnum(combineRatioLimForAll)) {
                combineRatioLim = combineRatioLimForAll
            }
            else if (isnum(combineRatioLimForMix) && isnum(combineRatioLimForSimple)) {
                combineRatioLim = useMix ? combineRatioLimForMix : combineRatioLimForSimple
            }
            else {
                let msg = `stage.combineRatioLim設定錯誤，至少要提供ForAll或(ForMix與ForSimple)二擇一`
                console.log(msg)
                throw new Error(msg)
            }
        }
        let combineDisableTestRela = get(stage, 'combineDisableTestRela', [])
        let combineThicknessMax = get(stage, 'combineThicknessMax', '')

        //remove
        let removeMethod = get(stage, 'removeMethod', '')
        let removeDepthMin = get(stage, 'removeDepthMin', '')
        let removeDisableGeneralType = get(stage, 'removeDisableGeneralType', [])
        let removeThicknessMax = ''
        let removeThicknessMaxForAll = get(stage, 'removeThicknessMaxForAll', '')
        let removeThicknessMaxForMix = get(stage, 'removeThicknessMaxForMix', '')
        let removeThicknessMaxForSimple = get(stage, 'removeThicknessMaxForSimple', '')
        if (isnum(removeThicknessMaxForAll)) {
            removeThicknessMax = removeThicknessMaxForAll
        }
        else if (isnum(removeThicknessMaxForMix) && isnum(removeThicknessMaxForSimple)) {
            removeThicknessMax = useMix ? removeThicknessMaxForMix : removeThicknessMaxForSimple
        }
        else {
            let msg = `stage.removeThicknessMax設定錯誤，至少要提供ForAll或(ForMix與ForSimple)二擇一`
            console.log(msg)
            throw new Error(msg)
        }
        let removeDisableTestRela = get(stage, 'removeDisableTestRela', [])

        //core
        layers = core(layers, {

            mergeMethod,
            mergeDisableTestRela,

            combineMethod,
            combineDepthMin,
            combineRatioLim,
            combineDisableTestRela,
            combineThicknessMax,

            removeMethod,
            removeDepthMin,
            removeDisableGeneralType,
            removeThicknessMax,
            removeDisableTestRela

        })

    })

    return layers
}


function slCut(layers, opt = {}) {

    //depthMax
    let depthMax = get(opt, 'depthMax')
    if (isnum(depthMax)) {
        depthMax = cdbl(depthMax)
    }

    //layers
    let rs = []
    each(layers, (v) => {

        //depthStart
        let ds = null
        if (isnum(v.depthStart)) {
            ds = cdbl(v.depthStart)
        }

        //depthEnd, 為數字
        let de = null
        if (isnum(v.depthEnd)) {
            de = cdbl(v.depthEnd)
        }

        //depthMax
        if (isNumber(depthMax)) {

            //min
            ds = Math.min(ds, depthMax)
            de = Math.min(de, depthMax)
            // console.log('depthStart', ds, 'depthEnd', de)

            //check
            if (ds >= de) {
                console.log('depthStart >= depthEnd', ds, de)
                return true //跳出換下一個
            }

            //update
            v.depthStart = ds
            v.depthEnd = de

        }

        //push
        rs.push(v)

    })
    layers = rs
    // console.log('cut layers', layers)

    //compressLayersByDig
    layers = compressLayersByDig(layers, opt)
    // console.log('dig layers', layers)

    return layers
}


function slExtract(layers, opt = {}) {

    //layers
    let rs = []
    each(layers, (v) => {

        //push
        rs.push({
            type: v.type,
            depthStart: v.depthStart,
            depthEnd: v.depthEnd,
        })

    })
    // console.log('rs', rs)

    return rs
}


function compressLayersByLabAndCpt($an, ltdtLab, ltdtCpt, opt = {}) {

    //cutCptLen, 刮取cpt厚度
    let cutCptLen = get(opt, 'cutCptLen')
    if (!isnum(cutCptLen)) {
        throw new Error(`cutCptLen[${cutCptLen}] is not a number`)
    }
    cutCptLen = cdbl(cutCptLen)
    let cutCptLenHalf = cutCptLen / 2

    //useSoilTypeSpec
    let useSoilTypeSpec = get(opt, 'useSoilTypeSpec')
    if (useSoilTypeSpec !== 'USCS' && useSoilTypeSpec !== 'ISO') {
        // console.log(`invalid useSoilTypeSpec[${useSoilTypeSpec}], auto change to ISO`)
        useSoilTypeSpec = 'ISO'
    }
    // console.log('useSoilTypeSpec', useSoilTypeSpec)

    //useSimplify
    let useSimplify = get(opt, 'useSimplify')
    if (useSimplify !== 'simplifyRobertson1986' && useSimplify !== 'simplifyRobertson1990' && useSimplify !== 'simplifyRobertson2009' && useSimplify !== 'simplifyRamsey') {
        // console.log(`invalid useSimplify[${useSimplify}], auto change to simplifyRobertson1990`)
        useSimplify = 'simplifyRobertson1990'
    }
    // console.log('useSimplify', useSimplify)

    //thicknessMaxForInfluence
    let thicknessMaxForInfluence = get(opt, 'thicknessMaxForInfluence')
    if (!isnum(thicknessMaxForInfluence)) {
        thicknessMaxForInfluence = 1.5 //最大影響厚度0.5m, 需比刪除薄層門檻還大, 否則室內試驗數據都會被刪光, 改為1.5m減少cpt影響 (2021/12/06)
    }
    thicknessMaxForInfluence = cdbl(thicknessMaxForInfluence)
    // console.log('thicknessMaxForInfluence', thicknessMaxForInfluence)

    //depthMax
    let depthMax = get(opt, 'depthMax')
    if (isnum(depthMax)) {
        depthMax = cdbl(depthMax)
    }

    //check
    if (!isearr(ltdtLab)) {
        ltdtLab = []
    }
    if (!isearr(ltdtCpt)) {
        ltdtCpt = []
    }

    //check
    if (size(ltdtLab) === 0 && size(ltdtCpt) === 0) {
        throw new Error('無有效試驗與CPT數據可進行自動分層')
    }
    // console.log('ltdtLab', cloneDeep(ltdtLab))

    //useMix
    let useMix = !(size(ltdtLab) === 0 || size(ltdtCpt) === 0)

    //getDepthMax
    let _depthEndMax = getDepthMax([...ltdtCpt, ...ltdtLab], { useCeil: true })
    // console.log('depthEndMax', depthEndMax)

    //depthMax
    if (!isNumber(depthMax)) {
        depthMax = _depthEndMax
    }

    //optMethod
    let optMethod = {}
    if (useSoilTypeSpec === 'USCS') {
        optMethod.numOfType = 3 //USCS用簡化成3種土壤單元
    }
    else if (useSoilTypeSpec === 'ISO') {
        optMethod.numOfType = 5 //ISO用簡化成5種土壤單元
    }
    // console.log('optMethod.numOfType', optMethod.numOfType)

    //psCpt, cpt分類得自動合併FrQt與BqQt數據
    let psCpt = []
    each(ltdtCpt, (v) => {

        //opt
        let optSimplify = {
            ...opt,
            ...optMethod,
            data: v,
        }

        //type
        let type = ''
        if (useSimplify === 'simplifyRobertson1986') {
            type = simplifyRobertson1986(v.iRobRfqt, v.iRobBqqt, optSimplify)
        }
        else if (useSimplify === 'simplifyRobertson1990') {
            type = simplifyRobertson1990(v.iRobFrQt, v.iRobBqQt, optSimplify)
        }
        else if (useSimplify === 'simplifyRobertson2009') {
            type = simplifyRobertson2009(v.iRobFrQtn, v.iRobBqQtn, optSimplify)
        }
        else if (useSimplify === 'simplifyRamsey') {
            type = simplifyRamsey(v.iRamFrQt, v.iRamBqQt, optSimplify)
        }
        // else if (useSimplify === 'simplifyIc') {
        //     type = simplifyIc(v.iIc, optSimplify)
        // }

        //check
        if (isestr(type)) {
            psCpt.push({
                type,
                depth: cdbl(v.depth), //cpt本來就有depth
            })
        }

    })
    // console.log('psCpt', cloneDeep(psCpt))

    //optSmoothDepthByKey
    let optSmoothDepthByKey = {
        ranger: {
            depthHalf: cutCptLenHalf
        },
        methodSmooth: 'maxCount',
    }

    //smoothDepthByKey
    let psCptsm = []
    try {
        psCptsm = smoothDepthByKey(psCpt, 'type', optSmoothDepthByKey)
    }
    catch (err) {
        console.log(err)
    }
    // console.log('psCptsm', cloneDeep(psCptsm))

    //psLab
    let psLab = []
    each(ltdtLab, (v) => {

        //check, 只有GPP才有辦法由USCS與相關數據重出ISO分類, 故其他非GPP一律不處理
        if (v.test !== 'GPP') {
            return true //跳出換下一個
        }

        // //simSoilTypeUSCS, 現在只能使用ISO分類, 故不能使用USCS
        // let simSoilTypeUSCS = get(v, `simSoilTypeUSCS`, '')

        // //simSoilTypeISO, 簡化ISO會沒有混合層, 且分層需支援樣本為混合層, 故不能使用simSoilTypeISO
        // let simSoilTypeISO = get(v, `simSoilTypeISO`, '')

        //layerSoilTypeISO, GIR一期的8土壤單元, 需含有混合層
        let layerSoilTypeISO = get(v, `layerSoilTypeISO`, '')

        //type
        let type = null
        if (isestr(layerSoilTypeISO)) {
            type = layerSoilTypeISO
        }

        //check
        if (type === null) {
            return true //跳出換下一個
        }

        //check
        if (!isnum(v.depth) || !isnum(v.depthStart) || !isnum(v.depthEnd)) {
            return true //跳出換下一個
        }

        //push
        psLab.push({
            type,
            test: v.test,
            testRela: v.testRela,
            sampleGroupId: v.sampleGroupId,
            depth: cdbl(v.depth),
            // cdepth: dig(cdbl(v.depth), 3),
            depthStart: cdbl(v.depthStart),
            depthEnd: cdbl(v.depthEnd),
        })

    })
    // console.log('psLab', cloneDeep(psLab))

    //偵測樣本深度重複
    let gPsLab = groupBy(psLab, 'depth')
    each(gPsLab, (v, k) => {
        if (size(v) > 1) { //例如DH-03的P05是有多做GPP故會有重複深度問題
            console.log(`發現樣本深度重複`, k, cloneDeep(map(v, (vv) => {
                return {
                    test: vv.test,
                    testRela: vv.testRela,
                    sampleGroupId: vv.sampleGroupId,
                    depth: vv.depth,
                }
            })))
        }
    })

    //uniqBy, 若有重複則強制取第1個樣本
    psLab = uniqBy(psLab, 'depth') //意含各試驗有重複關聯者, 都得要同樣分類, 否則就代表同深度有不同分類的衝突問題

    //sortBy
    psLab = sortBy(psLab, 'depth')
    // console.log('psLab(sortBy)', cloneDeep(psLab))

    //check
    each(psLab, (v, k) => {
        if (k === 0) {
            return true
        }
        let v0 = get(psLab, k - 1)
        let v1 = v
        if (judge(v0.depthEnd, '>', v1.depthStart)) {
            console.log('試驗數據起訖深度有重疊', v0, v1)
        }
    })

    //偵測樣本起訖深度超過
    let ckds1 = checkDepthStartEnd(psLab, { stateConn: 'overlap' })
    if (size(ckds1) > 0) {
        console.log('試驗數據起訖深度有重疊', join(ckds1, ', '))
        throw new Error('試驗數據起訖深度有重疊')
    }

    //偵測並調整各樣本最小深度thicknessMaxForInfluence
    let upPsLab = size(psLab) - 1
    psLab = map(psLab, (v, k) => {
        let ds = get(v, 'depthStart')
        if (isnum(ds)) {
            ds = cdbl(ds)
        }
        let de = get(v, 'depthEnd')
        if (isnum(de)) {
            de = cdbl(de)
        }
        let dc = get(v, 'depth')
        if (isnum(dc)) {
            dc = cdbl(dc)
        }
        if (ds !== null && de !== null && dc !== null) {

            //df
            let df = de - ds

            //check
            if (df <= 0) {
                console.log(`樣本厚度[${df}]<=0`, v)
            }

            if (df > 0 && df < thicknessMaxForInfluence) {

                //check, ds可能低於上1層de
                if (k > 0) {
                    let v0 = get(psLab, k - 1)
                    // let ds0 = get(v0, 'depthStart')
                    let de0 = get(v0, 'depthEnd')
                    let dc0 = get(v0, 'depth')

                    //check, 與上層中點深度距離
                    if (isnum(dc0)) {
                        dc0 = cdbl(dc0)
                        if (dc - dc0 > thicknessMaxForInfluence) { //兩層中點距離超過thicknessMaxForInfluence
                            ds = dc - thicknessMaxForInfluence / 2
                        }
                        else { //距離不夠則ds改為兩層最近深度之中點
                            if (isnum(de0)) {
                                ds = (ds + de0) / 2
                            }
                        }
                    }

                }
                else {
                    ds = dc - thicknessMaxForInfluence / 2 //無上層故直接計算, 若<0則由後方修復
                }

                //check, de可能超過下1層ds
                if (k < upPsLab) {
                    let v2 = get(psLab, k + 1)
                    let ds2 = get(v2, 'depthStart')
                    // let de2 = get(v2, 'depthEnd')
                    let dc2 = get(v2, 'depth')

                    //check, 與下層中點深度距離
                    if (isnum(dc2)) {
                        dc2 = cdbl(dc2)
                        if (dc2 - dc > thicknessMaxForInfluence) { //兩層中點距離超過thicknessMaxForInfluence
                            de = dc + thicknessMaxForInfluence / 2
                        }
                        else { //距離不夠則de改為兩層最近深度之中點
                            if (isnum(ds2)) {
                                de = (de + ds2) / 2
                            }
                        }
                    }

                }
                else {
                    de = dc + thicknessMaxForInfluence / 2 //無下層故直接計算, 若>depthEndMax則由後方修復
                }

                //可能前幾層都<0, 或後幾層都>depthMax
                ds = Math.max(ds, 0)
                de = Math.min(de, depthMax)

                //save, 不能先更新至depthStart與depthEnd, 因下一層會使用上層樣本深度資訊, 故先更新會導致樣本深度平移
                v.depthStartNew = ds
                v.depthEndNew = de
                // v.depth = (ds + de) / 2

            }
        }
        return v
    })
    psLab = map(psLab, (v, k) => {
        if (isNumber(v.depthStartNew)) {
            v.depthStart = v.depthStartNew
            delete v.depthStartNew
        }
        if (isNumber(v.depthEndNew)) {
            v.depthEnd = v.depthEndNew
            delete v.depthEndNew
        }
        v.depth = (v.depthStart + v.depthEnd) / 2
        return v
    })
    // console.log('psLab(偵測並調整各樣本最小深度thicknessMaxForInfluence)', cloneDeep(psLab))

    //merge
    let psMerge = cloneDeep(psCptsm)
    each(psLab, (v) => {
        //psMerge剔除指定室內樣本
        psMerge = filter(psMerge, (vv) => {
            return vv.depth < v.depthStart || vv.depth > v.depthEnd
        })
    })
    each(psLab, (v) => {
        //psMerge添加室內樣本至最後
        psMerge.push(v)
    })
    psMerge = sortBy(psMerge, 'depth') //基於depth重新排序
    // console.log('psMerge(添加cpt分層)', cloneDeep(psMerge))

    //lab與cpt各層資訊補算起訖深度
    let ubPsMerge = size(psMerge) - 1
    psMerge = map(psMerge, (v, k) => {
        let k0 = k - 1
        let k1 = k
        let k2 = k + 1
        let v0 = get(psMerge, k0)
        // let ds0 = get(v0, 'depthStart')
        let de0 = get(v0, 'depthEnd')
        let dc0 = get(v0, 'depth')
        let v1 = get(psMerge, k1)
        let ds1 = get(v1, 'depthStart')
        let de1 = get(v1, 'depthEnd')
        let dc1 = get(v1, 'depth')
        let v2 = get(psMerge, k2)
        let ds2 = get(v2, 'depthStart')
        // let de2 = get(v2, 'depthEnd')
        let dc2 = get(v2, 'depth')

        //update depthStart
        if (k === 0) {
            v.depthStart = 0
        }
        else {
            if (!isnum(ds1)) { //若自己無depthStart
                if (isnum(de0)) { //若上1層有depthEnd
                    v.depthStart = de0
                }
                else if (isnum(dc1) && isnum(dc0)) { //若自己與上1層有depth
                    v.depthStart = (dc1 + dc0) / 2
                }
                else {
                    console.log('無depthStart時但無足夠資料補算', de0, dc1, dc0)
                }
            }
            else { //若自己有depthStart
                v.depthStart = ds1
            }
        }
        // console.log('v.depthStart', k, v.depthStart, v)

        //update depthEnd
        if (k === ubPsMerge) {
            v.depthEnd = depthMax
        }
        else {
            if (!isnum(de1)) { //若自己無depthEnd
                if (isnum(ds2)) { //若下1層有depthEnd
                    v.depthEnd = ds2
                }
                else if (isnum(dc1) && isnum(dc2)) { //若自己與下1層有depth
                    v.depthEnd = (dc1 + dc2) / 2
                }
                else {
                    console.log('無depthEnd時但無足夠資料補算', ds2, dc1, dc2)
                }
            }
            else { //若自己有depthEnd
                v.depthEnd = de1
            }
        }
        // console.log('v.depthEnd', k, v.depthEnd, v)

        //update depth
        v.depth = (v.depthStart + v.depthEnd) / 2
        // console.log('v.depth', k, v.depth, v)

        return v
    })
    // console.log('psMerge(起訖深度補算)', cloneDeep(psMerge))

    //calcDepthStartEndByConnect
    let layers = []
    try {
        layers = calcDepthStartEndByConnect(psMerge, { depthEndMax: depthMax })
    }
    catch (err) {
        console.log('psMerge', psMerge)
        console.log(err)
    }
    // console.log('psMerge(起訖深度自動連接)', 'calcDepthStartEndByConnect', cloneDeep(layers))

    //checkDepthStartEnd
    let ckds2 = checkDepthStartEnd(layers)
    if (size(ckds2) > 0) {
        console.log('分層起訖深度無連接', join(ckds2, ', '))
        throw new Error('分層起訖深度無連接')
    }

    //checkType
    let haveErrType = false
    each(layers, (v) => {
        if (!isestr(v.type)) {
            console.log('發現無type分層', v)
            haveErrType = true
        }
    })
    if (haveErrType) {
        throw new Error('發現無type分層')
    }

    //compressLayersByDig, 取有效深度並可能因太薄自動刪除薄層
    try {
        layers = compressLayersByDig(layers, opt)
    }
    catch (err) {
        console.log(err)
    }
    // console.log('compressLayersByDig', cloneDeep(layers))

    //slIntegrate, 層合併與合併出混合層
    try {
        layers = slIntegrate($an, layers, { ...opt, useMix })
    }
    catch (err) {
        console.log(err)
    }
    // console.log('slIntegrate', cloneDeep(layers))

    //slCut, 裁切分層
    try {
        layers = slCut(layers, opt)
    }
    catch (err) {
        console.log(err)
    }
    // console.log('slCut', cloneDeep(layers))

    //slExtract, 提取分層主要數據
    try {
        layers = slExtract(layers, opt)
    }
    catch (err) {
        console.log(err)
    }
    // console.log('slExtract', cloneDeep(layers))

    //check num
    let iNumLayers = size(layers)
    console.log(`${cstr(opt.modeName)}分層數:`, iNumLayers)
    if (opt.modeName === '設計' && (iNumLayers <= 19 || iNumLayers >= 40)) {
        console.log(`${opt.modeName}分層數[${iNumLayers}]<=19或>=40`)
    }

    return layers
}


export {
    getSlIntegrateStagesForTest,
    getSlIntegrateStagesForDesign,
    compressLayerByDig,
    compressLayersByDig,
    compressLayersByLabAndCpt
}
export default { //整合輸出預設得要有default
    getSlIntegrateStagesForTest,
    getSlIntegrateStagesForDesign,
    compressLayerByDig,
    compressLayersByDig,
    compressLayersByLabAndCpt
}

移植壓縮土層
