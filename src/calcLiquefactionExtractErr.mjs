import size from 'lodash-es/size.js'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import keys from 'lodash-es/keys.js'
import filter from 'lodash-es/filter.js'
import uniq from 'lodash-es/uniq.js'
import join from 'lodash-es/join.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isestr from 'wsemi/src/isestr.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import sep from 'wsemi/src/sep.mjs'
import dig from 'wsemi/src/dig.mjs'
import strleft from 'wsemi/src/strleft.mjs'


function calcLiquefactionExtractErr(ltdt, opt = {}) {

    //keyDepthStart, 計算核心複雜不提供更換鍵名
    // let keyDepthStart = get(opt, 'keyDepthStart')
    // if (!isestr(keyDepthStart)) {
    //     keyDepthStart = 'depthStart'
    // }
    let keyDepthStart = 'depthStart'

    //keyDepthEnd, 計算核心複雜不提供更換鍵名
    // let keyDepthEnd = get(opt, 'keyDepthEnd')
    // if (!isestr(keyDepthEnd)) {
    //     keyDepthEnd = 'depthEnd'
    // }
    let keyDepthEnd = 'depthEnd'

    // //preTag
    // let preTag = get(opt, 'preTag', null)
    // if (preTag === null) {
    //     preTag = 'depth'
    // }

    //mergeTo
    let mergeTo = get(opt, 'mergeTo')
    if (!isestr(mergeTo)) {
        mergeTo = 'last'
    }

    //returnLastone
    let returnLastone = get(opt, 'returnLastone')
    if (!isbol(returnLastone)) {
        returnLastone = true
    }

    //check
    if (size(ltdt) === 0) {
        return ltdt
    }

    //cloneDeep
    ltdt = cloneDeep(ltdt)

    //ub, 最下列的指標
    let ub = size(ltdt) - 1

    //mergeErrs
    mergeErrs(ltdt, keyDepthStart, keyDepthEnd, (k, cers) => {

        //save
        if (mergeTo === 'last') {
            ltdt[ub][k] = cers
        }
        else { //first
            ltdt[0][k] = cers
        }

    })

    if (returnLastone) {
        let r = get(ltdt, ub) //取得最下列
        return r
    }
    return ltdt
}


//mergeErrs, 提取rows各列之錯誤欄位(首列之鍵含'-err'者與'err'), 加註深度後合併, 逐鍵交save(k, cers)儲存; 只讀rows不修改, save所寫之鍵不再被讀取
function mergeErrs(ltdt, keyDepthStart, keyDepthEnd, save) {

    //ks
    let row0 = get(ltdt, 0)
    let ks = keys(row0)
    ks = filter(ks, (k) => {
        return k.indexOf('-err') >= 0 //提取各液化方法儲存錯誤欄位
    })
    ks = [...ks, 'err']

    //merge
    each(ks, (k) => {

        //ers
        let ers = []
        each(ltdt, (dt) => {

            //check
            if (!isestr(dt[k])) {
                return true //跳出換下一個
            }

            // if (isestr(preTag)) {
            //     if (preTag === 'depth') {
            //         ers.push(`深度[${dt.depthStart}-${dt.depthEnd}]: ${dt[k]}`)
            //     }
            //     else {
            //         ers.push(`${preTag}: ${dt[k]}`)
            //     }
            // }
            // else if (isfun(preTag)) {
            //     let t = preTag(dt)
            //     if (isestr(t)) {
            //         ers.push(`${t}: ${dt[k]}`)
            //     }
            // }
            // else {
            //     ers.push(dt[k])
            // }

            //ds, de
            let ds = get(dt, keyDepthStart, '')
            let de = get(dt, keyDepthEnd, '')

            //ds
            if (isnum(ds)) {
                ds = cdbl(ds)
                ds = dig(ds, 3)
            }

            //de
            if (isnum(de)) {
                de = cdbl(de)
                de = dig(de, 3)
            }

            //push
            ers.push(`depth[${ds}-${de}]: ${dt[k]}`)

        })

        //check
        if (size(ers) > 0) {

            //cers
            let cers = join(ers, '; ')
            cers = sep(cers, '; ') //假設各row會有重複err得剔除
            cers = uniq(cers)
            cers = join(cers, '; ')
            // cers = replace(cers, ', ', '; ') //多錯誤是用英文逗號分隔故一律取代為分號, 已於前處理取代
            // cers = replace(cers, ',', ';') //若非預期出現英文逗號則一律取代為分號, 已於前處理取代

            //check
            if (size(cers) > 1000) {
                cers = strleft(cers, 1000) + '...' //json可輸出全文字但xlsx不行, 故得限制最大長度
            }

            //save
            save(k, cers)

        }

    })

}


//calcLiquefactionExtractErrLastone, 內部用: 結果與calcLiquefactionExtractErr(ltdt, { returnLastone: true })相同(mergeTo為'last'), 但只複製回傳之最下列而非整個ltdt(Gitea #232)
//等價依據: mergeErrs只讀各列, 寫入之鍵不再被讀取, 故自原ltdt讀取與自其複製讀取所得相同; 回傳物件為最下列之cloneDeep並寫入合併結果, 與整體複製後取最下列相同
function calcLiquefactionExtractErrLastone(ltdt) {

    //check
    if (size(ltdt) === 0) {
        return ltdt
    }

    //ub, 最下列的指標
    let ub = size(ltdt) - 1

    //rowLast
    let rowLast = cloneDeep(get(ltdt, ub))

    //mergeErrs, 計算核心複雜不提供更換鍵名
    mergeErrs(ltdt, 'depthStart', 'depthEnd', (k, cers) => {
        rowLast[k] = cers
    })

    return rowLast
}


export { calcLiquefactionExtractErrLastone } //內部用(calcLiquefactionSpt.mjs), 不由WGeo.mjs匯出


export default calcLiquefactionExtractErr

