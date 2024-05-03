import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import filter from 'lodash-es/filter.js'
import size from 'lodash-es/size.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isarr from 'wsemi/src/isarr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import ispint from 'wsemi/src/ispint.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import arrSort from 'wsemi/src/arrSort.mjs'
import calcLayersByMerge from './calcLayersByMerge.mjs'


function calcLayersByCompress(ltdt, opt = {}) {

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

    //keyThickness
    let keyThickness = get(opt, 'keyThickness')
    if (!isestr(keyThickness)) {
        keyThickness = 'thickness'
    }

    //keyType
    let keyType = get(opt, 'keyType')
    if (!isestr(keyType)) {
        keyType = 'type'
    }

    //keyMgType
    let keyMgType = get(opt, 'keyMgType', 'type')

    //keyMgType2
    let keyMgType2 = get(opt, 'keyMgType2', 'type2')

    //keyMgType3
    let keyMgType3 = get(opt, 'keyMgType3', 'type3')

    //keyMgType4
    let keyMgType4 = get(opt, 'keyMgType4', 'type4')

    //keyMgTypeIcn
    let keyMgTypeIcn = get(opt, 'keyMgTypeIcn', 'typeIcn')

    //keyMgValueIcn
    let keyMgValueIcn = get(opt, 'keyMgValueIcn', 'Icn')

    //levelsForThicknessMax
    let levelsForThicknessMax = get(opt, 'levelsForThicknessMax', [])
    if (!isearr(levelsForThicknessMax)) {
        levelsForThicknessMax = [
            0.0201,
            0.0401,
            0.0601,
            0.0801,
            0.1001,
            0.1251,
            0.1501,
            0.1751,
            0.2001,
            0.2501,
            0.3001,
            0.3501,
            0.4001,
            0.4501,
            0.5001,
            0.7501,
            1.0001,
            1.5001,
            2.0001,
            3.0001,
            4.0001,
            5.0001,
            // 6.0001,
            // 7.0001,
            // 8.0001,
            // 9.0001,
            // 10.0001,
        ]
    }

    //levelsForMgValueIcnDiffMax
    let levelsForMgValueIcnDiffMax = get(opt, 'levelsForMgValueIcnDiffMax', [])
    if (!isearr(levelsForMgValueIcnDiffMax)) {
        levelsForMgValueIcnDiffMax = [
            0.20,
            0.25,
            0.30,
            // 0.35,
            // 0.40,
            // 0.50,
        ]
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

    //numMaxLayers
    let numMaxLayers = get(opt, 'numMaxLayers')
    if (!ispint(numMaxLayers)) {
        numMaxLayers = 40
    }

    //baseOnOriginalLayers
    let baseOnOriginalLayers = get(opt, 'baseOnOriginalLayers')
    if (!isbol(baseOnOriginalLayers)) {
        baseOnOriginalLayers = false
    }

    //rowsIn
    let rowsIn = cloneDeep(ltdt)

    //saveFromInds, 儲存keyInd得要是未合併之前
    if (saveFromInds) {
        rowsIn = map(rowsIn, (v, k) => {
            if (!isnum(v[keyInd])) {
                v[keyInd] = k
            }
            return v
        })
        // console.log('rowsIn[0](saveFromInds)', rowsIn[0])
    }

    //rowsInTemp
    let rowsInTemp = cloneDeep(rowsIn)

    //calcLayersByMerge
    if (true) {
        let optMerge = {
            keyType,
        }
        rowsIn = calcLayersByMerge(rowsIn, optMerge)
        // console.log('rowsIn[0](calcLayersByMerge)', rowsIn[0], size(rowsIn))
    }

    //getLayerThickness
    let getLayerThickness = (v) => {
        let ds = cdbl(v[keyDepthStart])
        let de = cdbl(v[keyDepthEnd])
        let tk = Math.max(de - ds, 0)
        return tk
    }

    //getDirByKeyStr
    let getDirByKeyStr = (v1, v2, key) => {
        let v1Value = get(v1, key, '')
        let v2Value = get(v2, key, '')
        let b1 = isestr(v1Value) || isnum(v1Value)
        let b2 = isestr(v2Value) || isnum(v2Value)
        if (!b1) {
            console.log('v1', v1)
            throw new Error(`invalid key[${key}] in the this layer`)
        }
        if (!b2) {
            console.log('v2', v2)
            throw new Error(`invalid key[${key}] in the lower layer`)
        }
        v1Value = cstr(v1Value)
        v2Value = cstr(v2Value)
        if (v1Value !== v2Value) {
            return '' //交給後續決定
        }
        let tk1 = getLayerThickness(v1)
        let tk2 = getLayerThickness(v2)
        if (tk1 >= tk2) {
            return 'up'
        }
        else {
            return 'down'
        }
    }

    //getDirByKeyNum
    let getDirByKeyNum = (v1, v2, dv, key) => {
        let v1Value = get(v1, key, '')
        let v2Value = get(v2, key, '')
        let b1 = isnum(v1Value)
        let b2 = isnum(v2Value)
        if (!b1) {
            console.log('v1', v1)
            throw new Error(`invalid key[${key}] in the this layer`)
        }
        if (!b2) {
            console.log('v2', v2)
            throw new Error(`invalid key[${key}] in the lower layer`)
        }
        v1Value = cdbl(v1Value)
        v2Value = cdbl(v2Value)
        let dv12 = Math.abs(v1Value - v2Value)
        if (dv12 > dv) {
            return '' //交給後續決定
        }
        let tk1 = getLayerThickness(v1)
        let tk2 = getLayerThickness(v2)
        if (tk1 >= tk2) {
            return 'up'
        }
        else {
            return 'down'
        }
    }

    //updateLayerDepthAndThickness
    let updateLayerDepthAndThickness = (r) => {
        let ds = cdbl(r[keyDepthStart])
        let de = cdbl(r[keyDepthEnd])
        let dc = (ds + de) / 2
        r[keyDepth] = dc
        r[keyThickness] = Math.max(de - ds, 0)
        return r
    }

    //updateLayersDepthAndThickness
    let updateLayersDepthAndThickness = (rs) => {
        rs = map(rs, (r) => {
            return updateLayerDepthAndThickness(r)
        })
        return rs
    }

    //updateLayerValueAndList
    let updateLayerValueAndList = (rSrc, rTar, keyValue, keyValueList) => {

        //check
        if (!isarr(rSrc[keyValueList])) {
            rSrc[keyValueList] = [rSrc[keyValue]]
        }

        //check
        if (!isarr(rTar[keyValueList])) {
            rTar[keyValueList] = [rTar[keyValue]]
        }

        //merge
        rTar[keyValueList] = [
            ...rSrc[keyValueList],
            ...rTar[keyValueList],
        ]

        return rTar
    }

    //updateLayerFromInds
    let updateLayerFromInds = (rSrc, rTar) => {
        return updateLayerValueAndList(rSrc, rTar, keyInd, keyFromInds)
    }

    //findThinLayers
    let findThinLayers = (rs, thicknessMax) => {
        //不能由小至大排序, 否則無法由上往下處理
        let tls = []
        each(rs, (v, k) => {
            // console.log(k, 'r', v)
            let tk = v[keyThickness]
            if (tk <= thicknessMax) {
                tls.push({
                    thickness: tk,
                    ind: k,
                })
            }
        })
        return tls
    }

    //mergeLayerParams
    let mergeLayerParams = (dir, k, rs) => {

        //nrs
        let nrs = size(rs)

        //check
        if (k + 1 > nrs - 1) { //最底層
            console.log('k', k)
            console.log('nrs', nrs)
            throw new Error(`k+1(${k + 1}) > nrs-1(${nrs - 1})`)
        }

        //update
        if (dir === 'up') {
            //合併至上層(本層), 合併層儲存至下層
            rs[k][keyDepthEnd] = rs[k + 1][keyDepthEnd] //下層結束深度給上層
            rs[k] = updateLayerDepthAndThickness(rs[k])
            if (saveFromInds) {
                rs[k] = updateLayerFromInds(rs[k + 1], rs[k]) //下層已合併指標儲存至上層
            }
            let r = rs[k] //儲存上層
            rs[k + 1] = r //上層儲存至下層
            rs[k] = null //標注須刪除上層
        }
        else { //dir==='down'
            //合併至下層, 合併層為下層故不用再轉存
            rs[k + 1][keyDepthStart] = rs[k][keyDepthStart] //上層起始深度給下層
            rs[k + 1] = updateLayerDepthAndThickness(rs[k + 1])
            if (saveFromInds) {
                rs[k + 1] = updateLayerFromInds(rs[k], rs[k + 1]) //上層已合併指標儲存至下層
            }
            rs[k] = null //標注須刪除上層
        }

        return rs
    }

    //mergeLayerOper
    let mergeLayerOper = (rs) => {

        //刪除本層
        rs = filter(rs, iseobj)

        //calcLayersByMerge
        let optMerge = {
            keyType,
        }
        rs = calcLayersByMerge(rs, optMerge)
        // console.log('rs[0](calcLayersByMerge)', rs[0], size(rs))

        //updateLayersDepthAndThickness
        rs = updateLayersDepthAndThickness(rs)

        return rs
    }

    //mergeThinLayers
    let mergeThinLayers = (rs, opt = {}) => {

        //thicknessMax
        let thicknessMax = get(opt, 'thicknessMax', 0.02)

        //useMgType
        let useMgType = get(opt, 'useMgType', false)

        //useMgType2
        let useMgType2 = get(opt, 'useMgType2', false)

        //useMgType3
        let useMgType3 = get(opt, 'useMgType3', false)

        //useMgType4
        let useMgType4 = get(opt, 'useMgType4', false)

        //useMgTypeIcn
        let useMgTypeIcn = get(opt, 'useMgTypeIcn', false)

        //useMgValueIcn
        let useMgValueIcn = get(opt, 'useMgValueIcn', false)

        //mgValueIcnDiffMax
        let mgValueIcnDiffMax = get(opt, 'mgValueIcnDiffMax', 0.2)

        //useDelThickness
        let useDelThickness = get(opt, 'useDelThickness', false)

        //nrs
        let nrs = size(rs)
        // console.log('nrs', nrs)

        //updateLayersDepthAndThickness
        rs = updateLayersDepthAndThickness(rs)

        //findThinLayers
        let tls = findThinLayers(rs, thicknessMax)
        // console.log('findThinLayers', thicknessMax, tls, size(tls))

        //check
        if (size(tls) === 0) {
            return {
                merged: false,
                rs,
            }
        }

        //revDir
        let revDir = (dir) => {
            if (dir === 'up') {
                dir = 'down'
            }
            else {
                dir = 'up'
            }
            return dir
        }

        let merged = false
        each(tls, (tl, ktl) => {
            // console.log(ktl, 'tl', tl, size(tls) - 1)

            let k1 = get(tl, 'ind')
            let k2 = k1 + 1

            let v1 = get(rs, k1, null)
            let v2 = get(rs, k2, null)

            //rev, 當薄層為最底層時須反向合併
            let rev = false
            if (k1 === nrs - 1) {
                rev = true
                let k = k1
                k1 = k - 1 //k1為上層
                k2 = k //k2為本層
                v1 = get(rs, k1, null) //v1為上層
                v2 = get(rs, k2, null) //v2為本層
            }
            // console.log('rev', rev)

            //check
            if (v1 === null) {
                if (!rev) {
                    console.log('nrs', nrs)
                    console.log('k1', k1, 'k2', k2)
                    throw new Error(`invalid v1`)
                }
                else {
                    //有可能上層已被併入本層, 但本層亦是薄層, 故會有null
                    // console.log('nrs', nrs)
                    // console.log('k1', k1, 'k2', k2)
                    return true //跳出
                }
            }
            if (v2 === null) {
                console.log('nrs', nrs)
                console.log('k1', k1, 'k2', k2)
                throw new Error(`invalid v2`)
            }

            //dir
            let dir = ''

            if (useMgType) {
                //getDirByKeyStr
                dir = getDirByKeyStr(v1, v2, keyMgType) //keyMgType為Robertson的9或12分類
                if (isestr(dir)) {
                    if (rev) {
                        dir = revDir(dir)
                    }
                    rs = mergeLayerParams(dir, k1, rs)
                    merged = true
                    return true //跳出換下一個
                }
                // console.log(`${keyMgType}無法處理, 往後進行`)
            }

            if (useMgType4) {
                //getDirByKeyStr
                dir = getDirByKeyStr(v1, v2, keyMgType4) //keyMgType4為Robertson分類簡化成4類
                if (isestr(dir)) {
                    if (rev) {
                        dir = revDir(dir)
                    }
                    rs = mergeLayerParams(dir, k1, rs)
                    merged = true
                    return true //跳出換下一個
                }
                // console.log(`${keyMgType4}無法處理, 往後進行`)
            }

            //useMgTypeIcn typeIcn
            if (useMgTypeIcn) {
                //getDirByKeyStr
                dir = getDirByKeyStr(v1, v2, keyMgTypeIcn) //keyMgTypeIcn為Icn分類
                if (isestr(dir)) {
                    if (rev) {
                        dir = revDir(dir)
                    }
                    rs = mergeLayerParams(dir, k1, rs)
                    merged = true
                    return true //跳出換下一個
                }
                // console.log(`${keyMgTypeIcn}無法處理, 往後進行`)
            }

            if (useMgType3) {
                //getDirByKeyStr
                dir = getDirByKeyStr(v1, v2, keyMgType3) //keyMgType3為Robertson分類簡化成3類
                if (isestr(dir)) {
                    if (rev) {
                        dir = revDir(dir)
                    }
                    rs = mergeLayerParams(dir, k1, rs)
                    merged = true
                    return true //跳出換下一個
                }
                // console.log(`${keyMgType3}無法處理, 往後進行`)
            }

            if (useMgType2) {
                //getDirByKeyStr
                dir = getDirByKeyStr(v1, v2, keyMgType2) //keyMgType2為Robertson分類簡化成2類
                if (isestr(dir)) {
                    if (rev) {
                        dir = revDir(dir)
                    }
                    rs = mergeLayerParams(dir, k1, rs)
                    merged = true
                    return true //跳出換下一個
                }
                // console.log(`${keyMgType2}無法處理, 往後進行`)
            }

            if (useMgValueIcn && isestr(keyMgValueIcn)) {
                //getDirByKeyNum
                dir = getDirByKeyNum(v1, v2, mgValueIcnDiffMax, keyMgValueIcn) //指定keyMgValue之值小於mgValueIcnDiffMax
                if (isestr(dir)) {
                    // console.log('getDirByKeyNum', dir)
                    if (rev) {
                        dir = revDir(dir)
                    }
                    rs = mergeLayerParams(dir, k1, rs)
                    merged = true
                    return true //跳出換下一個
                }
                // console.log(`${keyMgValueIcn}無法處理, 往後進行`)
            }

            if (useDelThickness) {
                //本層薄層強制往下合併
                dir = 'down'
                if (rev) {
                    dir = revDir(dir)
                }
                rs = mergeLayerParams(dir, k1, rs)
                merged = true
                return true //跳出換下一個
            }

        })
        // console.log('merged', merged)

        //check
        if (merged) {

            //mergeLayerOper
            rs = mergeLayerOper(rs)
            // console.log('rs[0](mergeLayerOper)', rs[0], size(rs))

            return {
                merged: true,
                rs,
            }
        }

        return {
            merged: false,
            rs,
        }
    }

    //rowsOut
    let rowsOut = []
    if (true) {

        //_thicknessMax
        let _thicknessMax = levelsForThicknessMax

        //_mgValueIcnDiffMax
        let _mgValueIcnDiffMax = levelsForMgValueIcnDiffMax

        //ss
        let ss = []
        if (true) {
            let _useMgValueIcn = [false] //[false, true]
            let _useMgType2 = [false] //[false, true]
            let _useMgType3 = [false] //[false, true]
            let _useMgType4 = [false, true]
            let _useMgTypeIcn = [false, true]
            let _useMgType = [false, true]
            let _useDelThickness = [false, true]
            each(_useDelThickness, (useDelThickness) => {
                each(_thicknessMax, (thicknessMax) => {
                    each(_useMgValueIcn, (useMgValueIcn) => {
                        let _mgValueIcnDiffMaxt = [null]
                        if (useMgValueIcn) {
                            _mgValueIcnDiffMaxt = _mgValueIcnDiffMax
                        }
                        each(_mgValueIcnDiffMaxt, (mgValueIcnDiffMax) => {
                            each(_useMgType2, (useMgType2) => {
                                each(_useMgType3, (useMgType3) => {
                                    each(_useMgTypeIcn, (useMgTypeIcn) => {
                                        each(_useMgType4, (useMgType4) => {
                                            each(_useMgType, (useMgType) => {
                                                ss.push({
                                                    thicknessMax,
                                                    useMgType,
                                                    useMgType2,
                                                    useMgType3,
                                                    useMgType4,
                                                    useMgTypeIcn,
                                                    useMgValueIcn,
                                                    mgValueIcnDiffMax,
                                                    useDelThickness,
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
            // console.log('ss', ss)
        }

        let rs = rowsIn
        each(ss, (opt) => {

            //nrs
            let nrs = size(rs)
            // console.log('nrs', nrs)

            //check
            if (nrs <= numMaxLayers) {
                // console.log('已滿足最大層數')
                return false //跳出
            }

            //mergeThinLayers
            let r = mergeThinLayers(rs, opt)
            // console.log('r.merged', r.merged)
            rs = r.rs

        })

        rowsOut = rs

    }
    // console.log('rowsOut[0](merge)', rowsOut[0])

    //baseOnOriginalLayers
    if (baseOnOriginalLayers) {

        //nrsf
        let nrsf = size(rowsOut)
        // console.log('nrsf', `${nrsf}(${numMaxLayers})`)

        //rowsOut
        let _rowsOut = []
        each(rowsOut, (v, k) => {
        // console.log(k, v)
            let type = v.type
            if (isnum(type)) {
                type = cdbl(type)
            }
            v.fromInds = arrSort(v.fromInds)
            each(v.fromInds, (i) => {
                let r = rowsInTemp[i]
                r['layer_no'] = k + 1
                r[`type_merge_${nrsf}(${numMaxLayers})`] = type
                _rowsOut.push(r)
            })
        })
        rowsOut = _rowsOut
        // console.log('rowsOut[0](final)', rowsOut[0])

    }

    return rowsOut
}


export default calcLayersByCompress

