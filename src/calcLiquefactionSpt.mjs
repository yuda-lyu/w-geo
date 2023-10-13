import get from 'lodash/get'
import each from 'lodash/each'
import size from 'lodash/size'
import cloneDeep from 'lodash/cloneDeep'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import calcLiquefaction from './calcLiquefaction.mjs'
import calcLiquefactionClearStress from './calcLiquefactionClearStress.mjs'
import calcLiquefactionSptAddPropsBasic from './calcLiquefactionSptAddPropsBasic.mjs'
import calcLiquefactionSptAddPropsAdv from './calcLiquefactionSptAddPropsAdv.mjs'
import calcLiquefactionExtractErr from './calcLiquefactionExtractErr.mjs'
import calcLiquefactionAddErr from './calcLiquefactionAddErr.mjs'


function calcLiquefactionSpt(ltdt, methods, opt = {}) {

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
            needPga = true
            cneedPga = m
        }
        else {
            needMw = true
            cneedMw = m
        }
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

    let errTemp = ''
    try {

        //calcLiquefaction.calc
        let optLiq = {
            unitSvSvp,
            methods,
        }
        ltdt = calcLiquefaction.calc('SPT', ltdt, optLiq)
        // console.log('ltdt', ltdt)

        // //downloadExcelFileFromData
        // w.downloadExcelFileFromData(`./ltdt.xlsx`, 'data', ltdt)

    }
    catch (e) {
        console.log(e)
        errTemp = e.toString()
    }

    //calcLiquefactionExtractErr, 合併各液化方法的err
    let dtRes = calcLiquefactionExtractErr(ltdt, { returnLastone: true })

    //calcLiquefactionAddErr, 若液化運算有非預期錯誤也要合併err
    dtRes = calcLiquefactionAddErr(dtRes, errTemp)

    return {
        ltdt,
        dtRes,
    }
}


export default calcLiquefactionSpt
