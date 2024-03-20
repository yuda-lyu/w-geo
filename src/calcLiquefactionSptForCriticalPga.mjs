
import get from 'lodash-es/get'
import each from 'lodash-es/each'
import map from 'lodash-es/map'
import keys from 'lodash-es/keys'
import filter from 'lodash-es/filter'
import size from 'lodash-es/size'
import times from 'lodash-es/times'
import pull from 'lodash-es/pull'
import isNumber from 'lodash-es/isNumber'
import cloneDeep from 'lodash-es/cloneDeep'
import dtmapping from 'wsemi/src/dtmapping.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import calcLiquefactionSptAddPropsBasic from './calcLiquefactionSptAddPropsBasic.mjs'
import calcLiquefactionSpt from './calcLiquefactionSpt.mjs'
import calcLiquefactionExtractErr from './calcLiquefactionExtractErr.mjs'


function pickCols(ltdt, keyIdentifier) {
    //挑選指定結尾字串的欄位
    let dt0 = get(ltdt, 0)
    let ks = keys(dt0)
    ks = filter(ks, (k) => {
        return k.indexOf(keyIdentifier) >= 0
    })
    return ks
}


function ckFS(ltdt, keyFS) {
    //判識rows的液化狀態與訊息, 由上往下判斷第1個出現液化土層即跳出
    let state = '未液化'
    let msg = '無'
    let FSmin = 1e20
    let failurePGA = ''
    each(ltdt, (v) => {
        let FS = get(v, keyFS, '')
        if (!isNumber(FS)) {
            // console.log(`欄位(${keyFS})的安全係數值(${FS})非數字`)
            return true //無FS跳出換下一個
        }
        if (FS <= 1) {
            state = '已液化'
            msg = `深度(${v.depthStart}-${v.depthEnd}m)發生液化(FS=${FS}<=1)`
            failurePGA = v.PGA
            return false //跳出
        }
        else {
            FSmin = Math.min(FSmin, FS)
        }
    })
    if (state === '未液化') {
        msg = `最小安全係數值(${FSmin})`
    }
    return {
        state,
        failurePGA,
        msg,
    }
}


function ckPL(ltdt, keyPL) {
    let state = '未有液化潛勢'
    let msg = '無'
    let failurePGA = ''

    //j, 最下列的指標
    let j = size(ltdt) - 1

    //取得最下列
    let rowEnd = get(ltdt, j)

    let PL = get(rowEnd, keyPL, '')
    if (!isNumber(PL)) {
        state = '錯誤'
        msg = `欄位(${keyPL})的液化潛勢值(${PL})非數字`
    }
    else if (PL >= 15) {
        state = '具液化潛勢'
        msg = `超過指定液化潛勢值(${PL}>=15)`
        failurePGA = rowEnd.PGA
    }
    else {
        msg = `液化潛勢值(${PL})`
    }

    return {
        state,
        failurePGA,
        msg,
    }
}


function ckStl(ltdt, keyStl, stlLim) {
    let state = '未有沉陷危害'
    let msg = '無'
    let failurePGA = ''

    //j, 最下列的指標
    let j = size(ltdt) - 1

    //取得最下列
    let rowEnd = get(ltdt, j)

    let Stl = get(rowEnd, keyStl, '')
    if (!isNumber(Stl)) {
        state = '錯誤'
        msg = `欄位(${keyStl})的沉陷值(${Stl})非數字`
    }
    else if (Stl >= stlLim) {
        state = '具沉陷危害'
        msg = `超過指定沉陷值(${Stl}>=${stlLim}m)`
        failurePGA = rowEnd.PGA
    }
    else {
        msg = `沉陷(${Stl}m)`
    }

    return {
        state,
        failurePGA,
        msg,
    }
}


function ckH1PL(ltdt, keyH1PL) {
    let state = '未有高可能性的顯著液化破壞'
    let msg = '無'
    let failurePGA = ''

    //j, 最下列的指標
    let j = size(ltdt) - 1

    //取得最下列
    let rowEnd = get(ltdt, j)

    let H1PL = get(rowEnd, keyH1PL, '')
    if (H1PL !== 'A' && H1PL !== 'B1' && H1PL !== 'B2' && H1PL !== 'B3' && H1PL !== 'C') {
        state = '錯誤'
        msg = `欄位(${keyH1PL})的顯著液化破壞之可能性值(${H1PL})非['A','B1','B2','B3','C']`
    }
    else if (H1PL === 'C') {
        state = '具液化潛勢'
        msg = `已達高可能性的顯著液化破壞(${H1PL})`
        failurePGA = rowEnd.PGA
    }
    else {
        msg = `顯著液化破壞之可能性值(${H1PL})`
    }

    return {
        state,
        failurePGA,
        msg,
    }
}


function calcCriticalPga(ltdt, PGA, methods, opt = {}) {

    //check
    if (!isnum(PGA)) {
        throw new Error(`PGA is not a number`)
    }
    PGA = cdbl(PGA)

    //methods
    if (!isearr(methods)) {
        throw new Error(`methods[${methods}] is not an effective array`)
    }

    //Mw, 不事先check, 因JRA非必要
    let Mw = get(opt, 'Mw', '')

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

    //pgaMax
    let pgaMax = get(opt, 'pgaMax', '')
    if (!isnum(pgaMax)) {
        pgaMax = 2 //PGA極限值給2g
    }
    pgaMax = cdbl(pgaMax)

    //useFS
    let useFS = get(opt, 'useFS', true)
    if (!isbol(useFS)) {
        useFS = true
    }

    //usePL
    let usePL = get(opt, 'usePL', true)
    if (!isbol(usePL)) {
        usePL = true
    }

    //useStl
    let useStl = get(opt, 'useStl', true)
    if (!isbol(useStl)) {
        useStl = true
    }

    //stlLims
    let stlLims = get(opt, 'stlLims', [])
    if (!isearr(stlLims)) {
        stlLims = [0.3]
    }

    //useH1PL
    let useH1PL = get(opt, 'useH1PL', true)
    if (!isbol(useH1PL)) {
        useH1PL = true
    }

    //calcLiquefactionSpt
    let r = calcLiquefactionSpt(ltdt, methods, { PGA, Mw, waterLevelUsual, waterLevelDesign, unitSvSvp })
    let ltdtTemp = r.ltdt
    let dtRes = r.dtRes
    // console.log('r.ltdt[sptNJRA2017-FS]', map(r.ltdt, 'sptNJRA2017-FS'))
    // console.log('ltdt[sptNJRA2017-FS]', map(ltdt, 'sptNJRA2017-FS')) //測試calcLiq無法修改原始ltdt, 裡面會沒有液化分析結果, 故無法使用記憶體共享加速
    // console.log('r.dtRes', r.dtRes)

    //要等液化分析完才有欄位
    let ksFS = pickCols(ltdtTemp, '-FS')
    let ksPL = pickCols(ltdtTemp, '-PL')
    let ksStlTS = pickCols(ltdtTemp, '-stlTS')
    let ksStlIY = pickCols(ltdtTemp, '-stlIY')
    let ksH1PL = pickCols(ltdtTemp, '-H1PL')

    //gPGA
    let gPGA = (v) => {
        if (isnum(v)) {
            return v
        }
        return pgaMax
    }

    //useFS
    if (useFS) {
        each(ksFS, (k) => {
            let r = ckFS(ltdtTemp, k)
            dtRes[`${k}-state`] = r.state
            dtRes[`${k}-failurePGA`] = gPGA(r.failurePGA)
            dtRes[`${k}-msg`] = r.msg
        })
    }

    //usePL
    if (usePL) {
        each(ksPL, (k) => {
            let r = ckPL(ltdtTemp, k)
            dtRes[`${k}-state`] = r.state
            dtRes[`${k}-failurePGA`] = gPGA(r.failurePGA)
            dtRes[`${k}-msg`] = r.msg
        })
    }

    //useStl
    if (useStl) {
        each(stlLims, (stlLim) => {
            each(ksStlTS, (k) => {
                let r = ckStl(ltdtTemp, k, stlLim)
                dtRes[`${k}${stlLim}-state`] = r.state
                dtRes[`${k}${stlLim}-failurePGA`] = gPGA(r.failurePGA)
                dtRes[`${k}${stlLim}-msg`] = r.msg
            })
            each(ksStlIY, (k) => {
                let r = ckStl(ltdtTemp, k, stlLim)
                dtRes[`${k}${stlLim}-state`] = r.state
                dtRes[`${k}${stlLim}-failurePGA`] = gPGA(r.failurePGA)
                dtRes[`${k}${stlLim}-msg`] = r.msg
            })
        })
    }

    //useH1PL
    if (useH1PL) {
        each(ksH1PL, (k) => {
            let r = ckH1PL(ltdtTemp, k)
            dtRes[`${k}-state`] = r.state
            dtRes[`${k}-failurePGA`] = gPGA(r.failurePGA)
            dtRes[`${k}-msg`] = r.msg
        })
    }

    return {
        ltdt: ltdtTemp,
        dtRes,
    }
}


function calcLiquefactionSptForCriticalPga(ltdt, methods, opt = {}) {

    //check
    if (!isearr(ltdt)) {
        throw new Error(`ltdt is not an effective array`)
    }

    //methods
    if (!isearr(methods)) {
        throw new Error(`methods[${methods}] is not an effective array`)
    }

    //Mw
    let Mw = get(opt, 'Mw', '')
    if (!isnum(Mw)) {
        Mw = 6.8
    }
    Mw = cdbl(Mw)

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

    //pgaMax
    let pgaMax = get(opt, 'pgaMax', '')
    if (!isnum(pgaMax)) {
        pgaMax = 2 //PGA極限值給2g
    }
    pgaMax = cdbl(pgaMax)

    //pgaSlice
    let pgaSlice = get(opt, 'pgaSlice', '')
    if (!isnum(pgaSlice)) {
        pgaSlice = 0.02 //切細至0.02g
    }
    pgaSlice = cdbl(pgaSlice)

    //useFS
    let useFS = get(opt, 'useFS', true)
    if (!isbol(useFS)) {
        useFS = true
    }

    //usePL
    let usePL = get(opt, 'usePL', true)
    if (!isbol(usePL)) {
        usePL = true
    }

    //useStl
    let useStl = get(opt, 'useStl', true)
    if (!isbol(useStl)) {
        useStl = true
    }

    //stlLims
    let stlLims = get(opt, 'stlLims', [])
    if (!isearr(stlLims)) {
        stlLims = [0.3]
    }

    //useH1PL
    let useH1PL = get(opt, 'useH1PL', true)
    if (!isbol(useH1PL)) {
        useH1PL = true
    }

    //keysPick
    let keysPick = get(opt, 'keysPick', [])
    if (!isearr(keysPick)) {
        keysPick = []
    }

    //returnLtdtForEachPga
    let returnLtdtForEachPga = get(opt, 'returnLtdtForEachPga', '')
    if (!isbol(returnLtdtForEachPga)) {
        returnLtdtForEachPga = false
    }

    //calcLiquefactionSptAddPropsBasic, 先擴充供液化分析之欄位, 即便液化分析會再重新偵測擴充, 主要是須更新原始數據之用
    ltdt = calcLiquefactionSptAddPropsBasic(ltdt)
    // console.log('calcLiquefactionSptAddPropsBasic layers', layers)

    //pgaTests
    let pgaTests = times(pgaMax / pgaSlice)
    // console.log('pgaTests', pgaTests)

    //ltdtRes
    let pgasLtdt = []
    let ltdtRes = []
    each(pgaTests, (v) => {
        // console.log(v, 'PGA', (v + 1) * pgaSlice)

        //PGA
        let PGA = (v + 1) * pgaSlice
        // console.log('PGA', PGA)

        //calcCriticalPga
        let optCalcCriticalPga = {
            Mw,
            waterLevelUsual,
            waterLevelDesign,
            unitSvSvp,
            pgaMax,
            useFS,
            usePL,
            useStl,
            stlLims,
            useH1PL,
        }
        let r = calcCriticalPga(ltdt, PGA, methods, optCalcCriticalPga)
        let ltdtTemp = r.ltdt
        let dtRes = r.dtRes

        //add inputPGA
        dtRes.inputPGA = PGA

        //push
        if (returnLtdtForEachPga) {
            pgasLtdt.push({
                PGA,
                ltdt: ltdtTemp,
            })
        }
        ltdtRes.push(dtRes)

    })
    // console.log('pgasLtdt', pgasLtdt)
    // console.log('ltdtRes', ltdtRes)

    //calcLiquefactionExtractErr, 合併各PGA下各液化方法的err
    ltdtRes = calcLiquefactionExtractErr(ltdtRes, { mergeTo: 'last', returnLastone: false })

    //取最後1個
    let res = cloneDeep(get(ltdtRes, size(ltdtRes) - 1))

    //searchLimit
    let searchLimit = (ksState, stateTar) => {
        each(ksState, (k) => {
            each(ltdtRes, (dtRes) => {
                if (dtRes[k] === stateTar) {

                    //kpga, kmsg
                    let kpga = k.replace('-state', '-failurePGA')
                    let kmsg = k.replace('-state', '-msg')

                    //save
                    res[k] = stateTar
                    res[kpga] = dtRes.PGA
                    res[kmsg] = dtRes[kmsg]

                    return false //跳出
                }
            })
        })
    }

    //searchLimit
    if (useFS) {

        //ksFSState
        let ksFSState = pickCols(ltdtRes, '-FS-state')
        searchLimit(ksFSState, '已液化')

    }
    if (usePL) {

        //ksPLState
        let ksPLState = pickCols(ltdtRes, '-PL-state')
        searchLimit(ksPLState, '具液化潛勢')

    }
    if (useStl) {

        each(stlLims, (stlLim) => {

            //ksStlTSState
            let ksStlTSState = pickCols(ltdtRes, `-stlTS${stlLim}-state`)
            searchLimit(ksStlTSState, '具沉陷危害')

            //ksStlIYstate
            let ksStlIYstate = pickCols(ltdtRes, `-stlIY${stlLim}-state`)
            searchLimit(ksStlIYstate, '具沉陷危害')

        })

    }
    if (useH1PL) {

        //ksH1PLState
        let ksH1PLState = pickCols(ltdtRes, '-H1PL-state')
        searchLimit(ksH1PLState, '具液化潛勢')

    }

    //ts
    let ts = []
    if (useFS) {
        ts.push('-FS')
    }
    if (usePL) {
        ts.push('-PL')
    }
    if (useStl) {
        each(stlLims, (stlLim) => {
            ts.push(`-stlTS${stlLim}`)
            ts.push(`-stlIY${stlLim}`)
        })
    }
    if (useH1PL) {
        ts.push('-H1PL')
    }

    //afts
    let afts = [
        '-state',
        '-failurePGA',
        '-msg',
    ]

    //ks
    let ks = [
        // 'keyProjHole',
        // 'projectNumber',
        // 'holeId',
        ...keysPick,
        'inputPGA',
    ]

    //add ks
    each(methods, (m) => {
        each(ts, (t) => {
            each(afts, (aft) => {
                let k = `${m}${t}${aft}`
                ks.push(k)
            })
        })
        ks.push(`${m}-err`) //儲存各液化方法的(各層累計提取)err, 代表各液化方法於全部分層所出現的錯誤
    })

    //重排欄位 ltdtRes
    ltdtRes = map(ltdtRes, (v, k) => {

        //dtmapping
        let dt = dtmapping(v, ks)

        return dt
    })

    //modify ks, ltdtResp內為彙整各pga條件下結果, 故不需要inputPGA
    pull(ks, 'inputPGA')

    //重排欄位 ltdtResp
    let ltdtResp = [res]
    ltdtResp = map(ltdtResp, (v, k) => {

        //dtmapping
        let dt = dtmapping(v, ks)

        return dt
    })

    //r
    let r = {
        ltdt,
        ltdtRes,
        ltdtResp,
    }
    if (returnLtdtForEachPga) {
        r.pgasLtdt = pgasLtdt
    }

    return r
}


export default calcLiquefactionSptForCriticalPga
