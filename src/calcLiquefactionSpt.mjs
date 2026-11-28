import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import size from 'lodash-es/size.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import { liquefactionCore } from './calcLiquefaction.mjs'
import calcLiquefactionClearStress from './calcLiquefactionClearStress.mjs'
import calcLiquefactionSptAddPropsBasic from './calcLiquefactionSptAddPropsBasic.mjs'
import calcLiquefactionSptAddPropsAdv from './calcLiquefactionSptAddPropsAdv.mjs'
import { calcLiquefactionExtractErrLastone } from './calcLiquefactionExtractErr.mjs'
import calcLiquefactionAddErr from './calcLiquefactionAddErr.mjs'


//calcLiquefactionSptCore, cap為內部用(不對外): 給予物件時擷取與PGA無關之中間結果供calcLiquefactionSptByPrepared重算其他PGA, 公開之calcLiquefactionSpt固定cap為null
//cap.preCalc: 液化分析前之各列(複製後清除應力並擴充欄位與PGA、Mw、地下水位), 液化分析拋錯時即回傳之ltdt
//cap.prepared: 液化分析之liqParams結果(深度、孔隙參數、垂直應力、Mw、振動形式等, 皆不讀PGA), 只於liqParams成功時存在
//cap.optLiq: 液化分析之設定
function calcLiquefactionSptCore(ltdt, methods, opt, cap) {

    //methods
    if (size(ltdt) === 0) {
        throw new Error(`invalid ltdt`)
    }

    //check, 因要自動偵測是否有提供PGA與Mw, 故須指定methods
    if (size(methods) === 0) {
        throw new Error(`invalid methods`)
    }

    //PGA
    let PGA = get(opt, 'PGA', '')

    //Mw
    let Mw = get(opt, 'Mw', '')

    //check
    let needPga = false
    let cneedPga = ''
    let needMw = false
    let cneedMw = ''
    each(methods, (m) => {
        if (m.indexOf('JRA') >= 0) {
            // needPga = true
            // cneedPga = m
        }
        else {
            needMw = true
            cneedMw = m
        }
        needPga = true //各方法皆需要pga
        cneedPga = m
    })
    if (needPga && !isnum(PGA)) {
        throw new Error(`use method[${cneedPga}] but PGA is not a number`)
    }
    if (needMw && !isnum(Mw)) {
        throw new Error(`use method[${cneedMw}] but Mw is not a number`)
    }

    //waterLevelUsual
    let waterLevelUsual = get(opt, 'waterLevelUsual', 0)
    waterLevelUsual = cdbl(waterLevelUsual)

    //waterLevelDesign
    let waterLevelDesign = get(opt, 'waterLevelDesign', 0)
    waterLevelDesign = cdbl(waterLevelDesign)

    //unitSvSvp
    let unitSvSvp = get(opt, 'unitSvSvp', '')
    if (!isestr(unitSvSvp)) {
        unitSvSvp = 'kPa'
    }

    //cloneDeep
    ltdt = cloneDeep(ltdt)

    //calcLiquefactionClearStress
    ltdt = calcLiquefactionClearStress(ltdt)

    //calcLiquefactionSptAddPropsBasic
    ltdt = calcLiquefactionSptAddPropsBasic(ltdt)
    // console.log('calcLiquefactionSptAddPropsBasic layers', layers)

    //calcLiquefactionSptAddPropsAdv
    ltdt = calcLiquefactionSptAddPropsAdv(ltdt, PGA, Mw, waterLevelUsual, waterLevelDesign)
    // console.log('ltdtIn', ltdt)

    //optLiq
    let optLiq = {
        unitSvSvp,
        methods,
    }

    //ctrl, 擷取中間結果; 液化分析入口會先複製輸入, 故cap.preCalc不被液化分析修改
    let ctrl = null
    if (cap !== null) {
        cap.preCalc = ltdt
        cap.optLiq = optLiq
        delete cap.prepared
        ctrl = {
            onPrepared: (rows) => {
                cap.prepared = rows
            },
        }
    }

    let errTemp = ''
    try {

        //calcLiquefaction.calc
        ltdt = liquefactionCore('SPT', ltdt, optLiq, ctrl)
        // console.log('ltdt', ltdt)

        // //downloadExcelFileFromData
        // w.downloadExcelFileFromData(`./ltdt.xlsx`, 'data', ltdt)

    }
    catch (e) {
        console.log(e)
        errTemp = e.toString()
    }

    //calcLiquefactionExtractErr, 合併各液化方法的err
    let dtRes = calcLiquefactionExtractErrLastone(ltdt)

    //calcLiquefactionAddErr, 若液化運算有非預期錯誤也要合併err
    dtRes = calcLiquefactionAddErr(dtRes, errTemp)

    return {
        ltdt,
        dtRes,
    }
}


//calcLiquefactionSptByPrepared, 內部用: 以calcLiquefactionSptCore對同一ltdt、methods與設定(僅PGA不同)所擷取之cap, 求另一PGA之結果, 與calcLiquefactionSpt(ltdt, methods, { ...opt, PGA })相同
//依據: 液化分析至liqParams止皆不讀PGA(liqParams之getPGA除外, 其值即各列之PGA), 故只須把cap.prepared各列之PGA改為本次之值; 其後各步與calcLiquefactionSptCore相同
//前提: cap.prepared存在, PGA為有效數字且不小於0(呼叫端須先確認, 否則改呼叫calcLiquefactionSptCore)
function calcLiquefactionSptByPrepared(cap, PGA) {

    //PGA, calcLiquefactionSptAddPropsAdv寫入各列之值為PGA, liqParams之getPGA再寫入cdbl(PGA)
    let PGAliq = cdbl(PGA)

    //改寫PGA, 液化分析之liqFS會逐列先複製才寫入, 故cap.prepared其餘欄位不被修改
    each(cap.prepared, (v) => {
        v.PGA = PGAliq
    })

    let ltdt = null
    let errTemp = ''
    try {

        //calcLiquefaction.calc
        ltdt = liquefactionCore('SPT', cap.prepared, cap.optLiq, { usePrepared: true })

    }
    catch (e) {
        console.log(e)
        errTemp = e.toString()

        //液化分析拋錯時回傳液化分析前之各列, 須為獨立複本且PGA為本次之值
        ltdt = cloneDeep(cap.preCalc)
        each(ltdt, (v) => {
            v.PGA = PGA
        })

    }

    //calcLiquefactionExtractErr, 合併各液化方法的err
    let dtRes = calcLiquefactionExtractErrLastone(ltdt)

    //calcLiquefactionAddErr, 若液化運算有非預期錯誤也要合併err
    dtRes = calcLiquefactionAddErr(dtRes, errTemp)

    return {
        ltdt,
        dtRes,
    }
}


function calcLiquefactionSpt(ltdt, methods, opt = {}) {
    return calcLiquefactionSptCore(ltdt, methods, opt, null)
}


export { calcLiquefactionSptCore, calcLiquefactionSptByPrepared } //內部用(calcLiquefactionSptForCriticalPga.mjs), 不由WGeo.mjs匯出


export default calcLiquefactionSpt
