import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import join from 'lodash-es/join.js'
import isNumber from 'lodash-es/isNumber.js'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import judge from './judge.mjs'


//LL非數字應該為'-'或'NP'
let cEmpty = '-'
let cNP = 'NP'
let cErrLL = `is not a number or '${cEmpty}' or '${cNP}'`
let cErrPI = cErrLL


function cvLL(oLL) {
    let LL = null
    if (isnum(oLL)) {
        LL = cdbl(oLL)
    }
    else if (oLL === cEmpty || oLL === cNP) { //PI與LL可以給予NP
        LL = 40
    }
    else {
        throw new Error(`LL[${oLL}] ${cErrLL}`)
    }
    return LL
}


function cvPI(oPI) {
    let PI = null
    if (isnum(oPI)) {
        PI = cdbl(oPI)
    }
    else if (oPI === cEmpty || oPI === cNP) { //PI與LL可以給予NP
        PI = 0
    }
    else {
        throw new Error(`PI[${oPI}] ${cErrLL}`)
    }
    return PI
}


function ckInvalidLFun(v, funCv) {
    let b = true
    try {
        v = funCv(v)
        if (!isNumber(v)) {
            b = false
        }
        else {
            if (v < 0 || v > 100) {
                b = false
            }
        }
    }
    catch (err) {
        b = false
    }
    return b
}
let ckInvalidLL = (LL) => {
    return ckInvalidLFun(LL, cvLL)
}
let ckInvalidPI = (PI) => {
    return ckInvalidLFun(PI, cvPI)
}


function ckWpByCu4(Cu, Cc) {
    // Private Function ckWpByCu4(Cu As Double, Cc As Double) As Boolean
    // If Cu >= 4 And 1 <= Cc And Cc <= 3 Then
    //     Return True
    // Else
    //     Return False
    // End If
    // End Function
    if (Cu >= 4 && Cc >= 1 && Cc <= 3) {
        return true
    }
    else {
        return false
    }
}


function ckWpByCu6(Cu, Cc) {
    // Private Function ckWpByCu6(Cu As Double, Cc As Double) As Boolean
    // If Cu >= 6 And 1 <= Cc And Cc <= 3 Then
    //     Return True
    // Else
    //     Return False
    // End If
    // End Function
    if (Cu >= 6 && Cc >= 1 && Cc <= 3) {
        return true
    }
    else {
        return false
    }
}


function getTypeByAlinePI(oPI, oLL) {
    // Private Function getTypeByAlinePI(oPI As Object, oLL As Object) As String
    // Dim PI As Double, LL As Double
    let PI = null
    let LL = null

    // '若人工判斷不需阿太堡時，預設樣品PI、LL位於塑性圖Aline以下，預設隸屬於ML(LL<50)，使用PI=0、LL=40 (2016/11/07)
    // If IsNumeric(oPI) Then
    //     PI = oPI
    // Else
    //     PI = 0
    // End If
    // If IsNumeric(oLL) Then
    //     LL = oLL
    // Else
    //     LL = 40 '非數字應該為"-"
    // End If
    // if (isnum(oPI)) {
    //     PI = cdbl(oPI)
    // }
    // else {
    //     PI = 0
    // }
    PI = cvPI(oPI)
    LL = cvLL(oLL)

    // Dim PIlim As Double = (0.73 * (LL - 20))
    // If PI > 7.0 And PI >= PIlim Then
    //     Return "C"
    // ElseIf PI < 4.0 Or PI < PIlim Then
    //     Return "M"
    // Else
    //     Return "C-M"
    // End If
    // End Function
    let PIlim = (0.73 * (LL - 20))
    if (PI > 7.0 && PI >= PIlim) {
        return 'C'
    }
    else if (PI < 4.0 || PI < PIlim) {
        return 'M'
    }
    else {
        return 'C-M'
    }
}


function getTypeByAline(oPI, oLL) {
    // Private Function getTypeByAline(oPI As Object, oLL As Object) As String
    // Dim PI As Double, LL As Double
    let PI = null
    let LL = null

    // '若人工判斷不需阿太堡時，預設樣品PI、LL位於塑性圖Aline以下，預設隸屬於ML(LL<50)，使用PI=0、LL=40 (2016/11/07)
    // If IsNumeric(oPI) Then
    //     PI = Val(oPI)
    // Else
    //     PI = 0 '非數字應該為"-"
    // End If
    // If IsNumeric(oLL) Then
    //     LL = Val(oLL)
    // Else
    //     LL = 40
    // End If
    // if (isnum(oPI)) {
    //     PI = cdbl(oPI)
    // }
    // else {
    //     PI = 0
    // }
    PI = cvPI(oPI)
    LL = cvLL(oLL)

    // Dim PIlim As Double = (0.73 * (LL - 20))
    // If PI >= PIlim Then
    //     Return "C"
    // Else
    //     Return "M"
    // End If
    // End Function
    let PIlim = (0.73 * (LL - 20))
    if (PI >= PIlim) {
        return 'C'
    }
    else {
        return 'M'
    }
}


function calcClassifyUscs(dt, opt = {}) {
    let err = []
    let USCS = ''
    let USCSDspEng = ''
    let USCSDspCht = ''
    let icd = 0

    //美國統一土壤分類法(Unified Soil Classification System, USCS)
    //http://www.dot.ca.gov/hq/maint/Pavement/Offices/Pavement_Engineering/PDF/USCS.pdf

    function ckErrFun(key, value, fun, msg = '') {
        let b = fun(value)
        if (!b) {
            err.push(`${key}[${value}] ${msg}`)
        }
        return null
    }

    function ckJudge(key1, value1, jud, key2, value2) {
        let ckv1 = `${key1}[${value1}]`
        if (!isestr(key1)) {
            ckv1 = `${value1}`
        }
        let ckv2 = `${key2}[${value2}]`
        if (!isestr(key2)) {
            ckv2 = `${value2}`
        }
        if (true) {
            let b = false
            if (!isNumber(value1)) {
                b = true
                err.push(`${ckv1} is not a number`)
            }
            if (!isNumber(value2)) {
                b = true
                err.push(`${ckv2} is not a number`)
            }
            if (b) {
                return
            }
        }
        if (true) {
            // console.log('value1', value1)
            // console.log('jud', jud)
            // console.log('value2', value2)
            let b = judge(value1, jud, value2)
            if (b) {
                err.push(`${ckv1} ${jud} ${ckv2}`)
                return
            }
        }
        return null
    }

    function ckJudge0To100(key, value) {
        ckJudge(key, value, '<', '', 0)
        ckJudge(key, value, '>', '', 100)
        return null
    }

    //hasErr
    let hasErr = () => {
        return size(err) > 0
    }

    //ret
    let ret = () => {
        if (hasErr(err)) {
            let cerr = join(err, ', ')
            return {
                USCS, //可能有錯但仍有分類
                USCSDspEng,
                USCSDspCht,
                icd,
                err,
                msg: cerr,
            }
        }
        else if (!isestr(USCS)) {
            return {
                USCS, //可能有錯但仍有分類
                USCSDspEng,
                USCSDspCht,
                icd,
                err: [`invalid USCS`],
                msg: `invalid USCS`,
            }
        }
        else {
            return {
                USCS,
                USCSDspEng,
                USCSDspCht,
                icd,
                // err: [],
                // msg: '',
            }
        }
    }

    //Organic
    let Organic = get(dt, 'Organic', 0)
    if (isnum(Organic)) {
        Organic = cdbl(Organic)
    }

    //LL
    let LL = get(dt, 'LL', '')
    if (isnum(LL)) {
        LL = cdbl(LL)
    }

    //LLdry
    let LLdry = get(dt, 'LLdry', '')
    if (isnum(LLdry)) {
        LLdry = cdbl(LLdry)
    }

    //PI
    let PI = get(dt, 'PI', '')
    if (isnum(PI)) {
        PI = cdbl(PI)
    }

    //Cu
    let Cu = get(dt, 'Cu', '')
    if (isnum(Cu)) {
        Cu = cdbl(Cu)
    }

    //Cc
    let Cc = get(dt, 'Cc', '')
    if (isnum(Cc)) {
        Cc = cdbl(Cc)
    }

    //ctClay
    let ctClay = get(dt, 'ctClay', '')
    if (isnum(ctClay)) {
        ctClay = cdbl(ctClay)
    }

    //ctSilt
    let ctSilt = get(dt, 'ctSilt', '')
    if (isnum(ctSilt)) {
        ctSilt = cdbl(ctSilt)
    }

    //ctSand
    let ctSand = get(dt, 'ctSand', '')
    if (isnum(ctSand)) {
        ctSand = cdbl(ctSand)
    }

    //ctGravel
    let ctGravel = get(dt, 'ctGravel', '')
    if (isnum(ctGravel)) {
        ctGravel = cdbl(ctGravel)
    }

    //rFineContent
    let rFineContent = get(dt, 'FC', '')
    if (isNumber(ctClay) && isNumber(ctSilt)) {
        rFineContent = ctClay + ctSilt
    }
    else if (isnum(rFineContent)) {
        rFineContent = cdbl(rFineContent)
    }

    //rCoarseContent
    let rCoarseContent = ''
    if (isNumber(ctSand) && isNumber(ctGravel)) {
        rCoarseContent = ctSand + ctGravel
    }
    else if (isnum(rCoarseContent)) {
        rCoarseContent = cdbl(rCoarseContent)
    }
    else if (isnum(rFineContent)) {
        rCoarseContent = 100 - rFineContent
    }

    //由rCoarseContent反算rFineContent
    if (!isNumber(rFineContent) && isNumber(rCoarseContent)) {
        rFineContent = 100 - rCoarseContent
    }

    ckJudge0To100('rFineContent', rFineContent)
    ckJudge0To100('rCoarseContent', rCoarseContent)
    if (hasErr()) {
        return ret() //重大錯誤直接報錯結束
    }

    //USCS
    if (rCoarseContent > 50) {

        ckJudge0To100('ctGravel', ctGravel)
        ckJudge0To100('ctSand', ctSand)
        if (hasErr()) {
            return ret() //重大錯誤直接報錯結束
        }

        if (ctGravel > ctSand) { //規範沒定義等於情況，先將等於情況歸砂 (2017/09/04)

            //已ck
            if (rFineContent < 5) {

                ckJudge('Cu', Cu, '<', '', 0)
                ckJudge('Cc', Cc, '<', '', 0)
                if (hasErr()) {
                    return ret() //重大錯誤直接報錯結束
                }

                if (ckWpByCu4(Cu, Cc)) {
                    icd = 1
                    USCS = 'GW'

                    //已ck
                    if (ctSand < 15) {

                        USCSDspEng = 'Well-graded gravel'
                        USCSDspCht = '級配良好礫石'

                    }
                    else { //ctSand >= 15

                        USCSDspEng = 'Well-graded gravel with sand'
                        USCSDspCht = '含砂之級配良好礫石'

                    }

                }
                else {
                    icd = 2
                    USCS = 'GP'

                    //已ck
                    if (ctSand < 15) {

                        USCSDspEng = 'Poorly graded gravel'
                        USCSDspCht = '級配不良礫石'

                    }
                    else { //ctSand >= 15

                        USCSDspEng = 'Poorly graded gravel with sand'
                        USCSDspCht = '含砂之級配不良礫石'

                    }

                }

            }
            else if (rFineContent > 12) {

                ckErrFun('PI', PI, ckInvalidPI, cErrPI)
                ckErrFun('LL', LL, ckInvalidLL, cErrLL)
                if (hasErr()) {
                    return ret() //重大錯誤直接報錯結束
                }

                let MC3 = getTypeByAlinePI(PI, LL)
                if (MC3 === 'C') {
                    icd = 3
                    USCS = 'GC'

                    //已ck
                    if (ctSand < 15) {

                        USCSDspEng = 'Clayey gravel'
                        USCSDspCht = '黏土質礫石'

                    }
                    else { //ctSand >= 15

                        USCSDspEng = 'Clayey gravel with sand'
                        USCSDspCht = '含砂之黏土質礫石'

                    }

                }
                else if (MC3 === 'M') {
                    icd = 4
                    USCS = 'GM'

                    //已ck
                    if (ctSand < 15) {

                        USCSDspEng = 'Silty gravel'
                        USCSDspCht = '粉土質礫石'

                    }
                    else { //ctSand >= 15

                        USCSDspEng = 'Silty gravel with sand'
                        USCSDspCht = '含砂之粉土質礫石'

                    }

                }
                else if (MC3 === 'C-M') {
                    icd = 5
                    USCS = 'GC-GM'

                    //已ck
                    if (ctSand < 15) {

                        USCSDspEng = 'Silty, clayey gravel'
                        USCSDspCht = '粉土質、黏土質礫石'

                    }
                    else { //ctSand >= 15

                        USCSDspEng = 'Silty, clayey gravel with sand'
                        USCSDspCht = '含砂之粉土質、黏土質礫石'

                    }

                }

            }
            else { //5 <= rFineContent && rFineContent <= 12

                ckJudge('Cu', Cu, '<', '', 0)
                ckJudge('Cc', Cc, '<', '', 0)
                if (hasErr()) {
                    return ret() //重大錯誤直接報錯結束
                }

                if (ckWpByCu4(Cu, Cc)) {

                    ckErrFun('PI', PI, ckInvalidPI, cErrPI)
                    ckErrFun('LL', LL, ckInvalidLL, cErrLL)
                    if (hasErr()) {
                        return ret() //重大錯誤直接報錯結束
                    }

                    let MC3 = getTypeByAlinePI(PI, LL)
                    if (MC3 === 'C' || MC3 === 'C-M') {
                        icd = 6
                        USCS = 'GW-GC'

                        //已ck
                        if (ctSand < 15) {

                            USCSDspEng = 'Well-graded gravel with clay (or silty clay)'
                            USCSDspCht = '含黏土之級配良好礫石'

                        }
                        else { //ctSand >= 15

                            USCSDspEng = 'Well-graded gravel with clay and sand (or silty clay and sand)'
                            USCSDspCht = '含黏土與砂之級配良好礫石'

                        }

                    }
                    else if (MC3 === 'M') {
                        icd = 7
                        USCS = 'GW-GM'

                        //已ck
                        if (ctSand < 15) {

                            USCSDspEng = 'Well-graded gravel with silt'
                            USCSDspCht = '含粉土之級配良好礫石'

                        }
                        else { //ctSand >= 15

                            USCSDspEng = 'Well-graded gravel with silt and sand'
                            USCSDspCht = '含粉土與砂之級配良好礫石'

                        }

                    }

                }
                else {

                    ckErrFun('PI', PI, ckInvalidPI, cErrPI)
                    ckErrFun('LL', LL, ckInvalidLL, cErrLL)
                    if (hasErr()) {
                        return ret() //重大錯誤直接報錯結束
                    }

                    let MC3 = getTypeByAlinePI(PI, LL)
                    if (MC3 === 'C' || MC3 === 'C-M') {
                        icd = 8
                        USCS = 'GP-GC'

                        //已ck
                        if (ctSand < 15) {

                            USCSDspEng = 'Poorly graded gravel with clay (or silty clay)'
                            USCSDspCht = '含黏土之級配不良礫石'

                        }
                        else { //ctSand >= 15

                            USCSDspEng = 'Poorly graded gravel with clay and sand (or silty clay and sand)'
                            USCSDspCht = '含黏土與砂之級配不良礫石'

                        }

                    }
                    else if (MC3 === 'M') {
                        icd = 9
                        USCS = 'GP-GM'

                        //已ck
                        if (ctSand < 15) {

                            USCSDspEng = 'Poorly graded gravel with silt'
                            USCSDspCht = '含粉土之級配不良礫石'

                        }
                        else { //ctSand >= 15

                            USCSDspEng = 'Poorly graded gravel with silt and sand'
                            USCSDspCht = '含粉土及砂之級配不良礫石'

                        }

                    }

                }

            }

        }
        else { //ctGravel < ctSand

            //已ck
            if (rFineContent < 5) {

                ckJudge('Cu', Cu, '<', '', 0)
                ckJudge('Cc', Cc, '<', '', 0)
                if (hasErr()) {
                    return ret() //重大錯誤直接報錯結束
                }

                if (ckWpByCu6(Cu, Cc)) {
                    icd = 10
                    USCS = 'SW'

                    //已ck
                    if (ctGravel < 15) {

                        USCSDspEng = 'Well-graded sand'
                        USCSDspCht = '級配良好砂'

                    }
                    else { //ctGravel >= 15

                        USCSDspEng = 'Well-graded sand with gravel'
                        USCSDspCht = '含礫石之級配良好砂'

                    }

                }
                else {
                    icd = 11
                    USCS = 'SP'

                    //已ck
                    if (ctGravel < 15) {

                        USCSDspEng = 'Poorly graded sand'
                        USCSDspCht = '級配不良砂'

                    }
                    else { //ctGravel >= 15

                        USCSDspEng = 'Poorly graded sand with gravel'
                        USCSDspCht = '含礫石之級配不良砂'

                    }

                }

            }
            else if (rFineContent > 12) {

                ckErrFun('PI', PI, ckInvalidPI, cErrPI)
                ckErrFun('LL', LL, ckInvalidLL, cErrLL)
                if (hasErr()) {
                    return ret() //重大錯誤直接報錯結束
                }

                let MC3 = getTypeByAlinePI(PI, LL)
                if (MC3 === 'C') {
                    icd = 12
                    USCS = 'SC'

                    //已ck
                    if (ctGravel < 15) {

                        USCSDspEng = 'Clayey sand'
                        USCSDspCht = '黏土質砂'

                    }
                    else { //ctGravel >= 15

                        USCSDspEng = 'Clayey sand with gravel'
                        USCSDspCht = '含礫石之黏土質砂'

                    }

                }
                else if (MC3 === 'M') {
                    icd = 13
                    USCS = 'SM'

                    //已ck
                    if (ctGravel < 15) {

                        USCSDspEng = 'Silty sand'
                        USCSDspCht = '粉土質砂'

                    }
                    else { //ctGravel >= 15

                        USCSDspEng = 'Silty sand with gravel'
                        USCSDspCht = '含礫石之粉土質砂'

                    }

                }
                else if (MC3 === 'C-M') {
                    icd = 14
                    USCS = 'SC-SM'

                    //已ck
                    if (ctGravel < 15) {

                        USCSDspEng = 'Silty, clayey sand'
                        USCSDspCht = '粉土質、黏土質砂'

                    }
                    else { //ctGravel >= 15

                        USCSDspEng = 'Silty,clayey sand with gravel'
                        USCSDspCht = '含礫石之粉土質、黏土質砂'

                    }

                }

            }
            else { //5 <= rFineContent && rFineContent <= 12

                ckJudge('Cu', Cu, '<', '', 0)
                ckJudge('Cc', Cc, '<', '', 0)
                if (hasErr()) {
                    return ret() //重大錯誤直接報錯結束
                }

                if (ckWpByCu6(Cu, Cc)) {

                    ckErrFun('PI', PI, ckInvalidPI, cErrPI)
                    ckErrFun('LL', LL, ckInvalidLL, cErrLL)
                    if (hasErr()) {
                        return ret() //重大錯誤直接報錯結束
                    }

                    let MC3 = getTypeByAlinePI(PI, LL)
                    if (MC3 === 'C' || MC3 === 'C-M') {
                        icd = 15
                        USCS = 'SW-SC'

                        //已ck
                        if (ctGravel < 15) {

                            USCSDspEng = 'Well-graded sand with clay (or silty clay)'
                            USCSDspCht = '含黏土之級配良好砂'

                        }
                        else { //ctGravel >= 15

                            USCSDspEng = 'Well-graded sand with clay and gravel (or silty clay and gravel)'
                            USCSDspCht = '含黏土與礫石之級配良好砂'

                        }

                    }
                    else if (MC3 === 'M') {
                        icd = 16
                        USCS = 'SW-SM'

                        //已ck
                        if (ctGravel < 15) {

                            USCSDspEng = 'Well-graded sand with silt'
                            USCSDspCht = '含粉土之級配良好砂'

                        }
                        else { //ctGravel >= 15

                            USCSDspEng = 'Well-graded sand with silt and gravel'
                            USCSDspCht = '含粉土與礫石之級配良好砂'

                        }

                    }

                }
                else {

                    ckErrFun('PI', PI, ckInvalidPI, cErrPI)
                    ckErrFun('LL', LL, ckInvalidLL, cErrLL)
                    if (hasErr()) {
                        return ret() //重大錯誤直接報錯結束
                    }

                    let MC3 = getTypeByAlinePI(PI, LL)
                    if (MC3 === 'C' || MC3 === 'C-M') {
                        icd = 17
                        USCS = 'SP-SC'

                        //已ck
                        if (ctGravel < 15) {

                            USCSDspEng = 'Poorly graded sand with clay (or silty clay)'
                            USCSDspCht = '含黏土之級配不良砂'

                        }
                        else { //ctGravel >= 15

                            USCSDspEng = 'Poorly graded sand with clay and gravel (or silty clay and gravel)'
                            USCSDspCht = '含黏土與礫石之級配不良砂'

                        }

                    }
                    else if (MC3 === 'M') {
                        icd = 18
                        USCS = 'SP-SM'

                        //已ck
                        if (ctGravel < 15) {

                            USCSDspEng = 'Poorly graded sand with silt'
                            USCSDspCht = '含粉土之級配不良砂'

                        }
                        else { //ctGravel >= 15

                            USCSDspEng = 'Poorly graded sand with silt and gravel'
                            USCSDspCht = '含粉土與礫石之級配不良砂'

                        }

                    }

                }

            }

        }

    }
    else { //rCoarseContent <= 50

        ckErrFun('LL', LL, ckInvalidLL, cErrLL)
        if (hasErr()) {
            return ret() //重大錯誤直接報錯結束
        }

        if (!isNumber(LL)) {

            //目前試驗室尚未有機土壤試驗，以及會有試驗者人工判斷不須做阿太堡狀況，會有無LL (2016/11/16)
            //若阿太堡結果LL為非數字，則土壤分類強制給「ML」 (2018/12/10)
            icd = 99
            USCS = 'ML'

            //已ck
            if (rCoarseContent < 30) {

                //已ck
                if (rCoarseContent < 15) {

                    USCSDspEng = 'Silt'
                    USCSDspCht = '粉土'

                }
                else { //15 <= rCoarseContent < 30

                    ckJudge0To100('ctGravel', ctGravel)
                    ckJudge0To100('ctSand', ctSand)
                    if (hasErr()) {
                        return ret() //重大錯誤直接報錯結束
                    }

                    if (ctSand >= ctGravel) {

                        USCSDspEng = 'Silt with sand'
                        USCSDspCht = '含砂之粉土'

                    }
                    else { //ctSand < ctGravel

                        USCSDspEng = 'Silt with gravel'
                        USCSDspCht = '含礫石之粉土'

                    }

                }

            }
            else { //rCoarseContent >= 30

                ckJudge0To100('ctGravel', ctGravel)
                ckJudge0To100('ctSand', ctSand)
                if (hasErr()) {
                    return ret() //重大錯誤直接報錯結束
                }

                if (ctSand >= ctGravel) {

                    //已ck
                    if (ctGravel < 15) {

                        USCSDspEng = 'Sandy silt'
                        USCSDspCht = '砂質粉土'

                    }
                    else { //ctGravel >= 15

                        USCSDspEng = 'Sandy silt with gravel'
                        USCSDspCht = '含礫石之砂質粉土'

                    }

                }
                else { //ctSand < ctGravel

                    //已ck
                    if (ctGravel < 15) {

                        USCSDspEng = 'Gravelly silt'
                        USCSDspCht = '礫石質粉土'

                    }
                    else { //ctGravel >= 15

                        USCSDspEng = 'Gravelly silt with sand'
                        USCSDspCht = '含砂之礫石質粉土'

                    }

                }

            }

        }
        else {

            //已ck
            if (LL >= 50) {

                if (Organic !== 0 && Organic !== 1) {
                    err.push(`Organic is not 0 or 1`)
                }
                if (hasErr()) {
                    return ret() //重大錯誤直接報錯結束
                }

                if (Organic === 0) {
                    //無機

                    ckErrFun('PI', PI, ckInvalidPI, cErrPI)
                    ckErrFun('LL', LL, ckInvalidLL, cErrLL)
                    if (hasErr()) {
                        return ret() //重大錯誤直接報錯結束
                    }

                    let MC2 = getTypeByAline(PI, LL)
                    if (MC2 === 'C') {
                        icd = 19
                        USCS = 'CH'

                        //已ck
                        if (rCoarseContent < 30) {

                            //已ck
                            if (rCoarseContent < 15) {

                                USCSDspEng = 'Fat clay'
                                USCSDspCht = '高塑性黏土'

                            }
                            else { //15 <= rCoarseContent < 30

                                ckJudge0To100('ctGravel', ctGravel)
                                ckJudge0To100('ctSand', ctSand)
                                if (hasErr()) {
                                    return ret() //重大錯誤直接報錯結束
                                }

                                if (ctSand >= ctGravel) {

                                    USCSDspEng = 'Fat clay with sand'
                                    USCSDspCht = '含砂之高塑性黏土'

                                }
                                else { //ctSand < ctGravel

                                    USCSDspEng = 'Fat clay with gravel'
                                    USCSDspCht = '含礫石之高塑性黏土'

                                }

                            }

                        }
                        else { //rCoarseContent >= 30

                            ckJudge0To100('ctGravel', ctGravel)
                            ckJudge0To100('ctSand', ctSand)
                            if (hasErr()) {
                                return ret() //重大錯誤直接報錯結束
                            }

                            if (ctSand >= ctGravel) {

                                //已ck
                                if (ctGravel < 15) {

                                    USCSDspEng = 'Sandy fat clay'
                                    USCSDspCht = '砂質高塑性黏土'

                                }
                                else { //ctGravel >= 15

                                    USCSDspEng = 'Sandy fat clay with gravel'
                                    USCSDspCht = '含礫石之砂質高塑性黏土'

                                }

                            }
                            else { //ctSand < ctGravel

                                //已ck
                                if (ctGravel < 15) {

                                    USCSDspEng = 'Gravelly fat clay'
                                    USCSDspCht = '礫石質高塑性黏土'

                                }
                                else { //ctGravel >= 15

                                    USCSDspEng = 'Gravelly fat clay with sand'
                                    USCSDspCht = '含砂之礫石質高塑性黏土'

                                }

                            }

                        }

                    }
                    else if (MC2 === 'M') {
                        icd = 20
                        USCS = 'MH'

                        //已ck
                        if (rCoarseContent < 30) {

                            //已ck
                            if (rCoarseContent < 15) {

                                USCSDspEng = 'Elastic silt'
                                USCSDspCht = '彈性粉土'

                            }
                            else { //15 <= rCoarseContent < 30

                                ckJudge0To100('ctGravel', ctGravel)
                                ckJudge0To100('ctSand', ctSand)
                                if (hasErr()) {
                                    return ret() //重大錯誤直接報錯結束
                                }

                                if (ctSand >= ctGravel) {

                                    USCSDspEng = 'Elastic silt with sand'
                                    USCSDspCht = '含砂之彈性粉土'

                                }
                                else { //ctSand < ctGravel

                                    USCSDspEng = 'Elastic silt with gravel'
                                    USCSDspCht = '含礫石之彈性粉土'

                                }

                            }

                        }
                        else { //rCoarseContent >= 30

                            ckJudge0To100('ctGravel', ctGravel)
                            ckJudge0To100('ctSand', ctSand)
                            if (hasErr()) {
                                return ret() //重大錯誤直接報錯結束
                            }

                            if (ctSand >= ctGravel) {

                                //已ck
                                if (ctGravel < 15) {

                                    USCSDspEng = 'Sandy Elastic silt'
                                    USCSDspCht = '砂質彈性粉土'

                                }
                                else { //ctGravel >= 15

                                    USCSDspEng = 'Sandy Elastic silt with gravel'
                                    USCSDspCht = '含礫石之砂質彈性粉土'

                                }

                            }
                            else { //ctSand < ctGravel

                                //已ck
                                if (ctGravel < 15) {

                                    USCSDspEng = 'Gravelly Elastic silt'
                                    USCSDspCht = '礫石質彈性粉土'

                                }
                                else { //ctGravel >= 15

                                    USCSDspEng = 'Gravelly Elastic silt with sand'
                                    USCSDspCht = '含砂之礫石質彈性粉土'

                                }

                            }

                        }

                    }

                }
                else if (Organic === 1) {
                    //有機

                    ckErrFun('LL', LL, ckInvalidLL, cErrLL)
                    ckErrFun('LLdry', LLdry, ckInvalidLL, cErrLL)
                    if (hasErr()) {
                        return ret() //重大錯誤直接報錯結束
                    }

                    if (LLdry / LL < 0.75) {

                        icd = 21
                        USCS = 'OH' //有機Organic Silt, Organic Clay
                        USCSDspEng = cEmpty
                        USCSDspCht = cEmpty

                    }
                    else { //LLdry / LL >= 0.75

                        icd = 22
                        USCS = 'PT(待確認)' //泥炭Peat
                        USCSDspEng = cEmpty
                        USCSDspCht = cEmpty

                    }

                }

            }
            else { //LL < 50
                //阿太堡 U線 = 0.9(LL-8)
                //U線約為我們目前所知土壤「塑性指數PI」與「液性限度LL」間關係之上限
                //由此可知 LL 最小值為 8

                if (Organic !== 0 && Organic !== 1) {
                    err.push(`Organic is not 0 or 1`)
                }
                if (hasErr()) {
                    return ret() //重大錯誤直接報錯結束
                }

                if (Organic === 0) {
                    //無機

                    ckErrFun('PI', PI, ckInvalidPI, cErrPI)
                    ckErrFun('LL', LL, ckInvalidLL, cErrLL)
                    if (hasErr()) {
                        return ret() //重大錯誤直接報錯結束
                    }

                    let MC3 = getTypeByAlinePI(PI, LL)
                    if (MC3 === 'C') {
                        icd = 23
                        USCS = 'CL'

                        //已ck
                        if (rCoarseContent < 30) {

                            //已ck
                            if (rCoarseContent < 15) {

                                USCSDspEng = 'Lean clay'
                                USCSDspCht = '低塑性黏土'

                            }
                            else { //15 <= rCoarseContent < 30

                                ckJudge0To100('ctGravel', ctGravel)
                                ckJudge0To100('ctSand', ctSand)
                                if (hasErr()) {
                                    return ret() //重大錯誤直接報錯結束
                                }

                                if (ctSand >= ctGravel) {

                                    USCSDspEng = 'Lean clay with sand'
                                    USCSDspCht = '含砂之低塑性黏土'

                                }
                                else { //ctSand < ctGravel

                                    USCSDspEng = 'Lean clay with gravel'
                                    USCSDspCht = '含礫石之低塑性黏土'

                                }

                            }

                        }
                        else { //rCoarseContent >= 30

                            ckJudge0To100('ctGravel', ctGravel)
                            ckJudge0To100('ctSand', ctSand)
                            if (hasErr()) {
                                return ret() //重大錯誤直接報錯結束
                            }

                            if (ctSand >= ctGravel) {

                                //已ck
                                if (ctGravel < 15) {

                                    USCSDspEng = 'Sandy lean clay'
                                    USCSDspCht = '砂質低塑性黏土'

                                }
                                else { //ctGravel >= 15

                                    USCSDspEng = 'Sandy lean clay with gravel'
                                    USCSDspCht = '含礫石之砂質低塑性黏土'

                                }

                            }
                            else { //ctSand < ctGravel

                                //已ck
                                if (ctGravel < 15) {

                                    USCSDspEng = 'Gravelly lean clay'
                                    USCSDspCht = '礫石質低塑性黏土'

                                }
                                else { //ctGravel >= 15

                                    USCSDspEng = 'Gravelly lean clay with sand'
                                    USCSDspCht = '含砂之礫石質低塑性黏土'

                                }

                            }

                        }

                    }
                    else if (MC3 === 'M') {
                        icd = 24
                        USCS = 'ML'

                        //已ck
                        if (rCoarseContent < 30) {

                            //已ck
                            if (rCoarseContent < 15) {

                                USCSDspEng = 'Silt'
                                USCSDspCht = '粉土'

                            }
                            else { //15 <= rCoarseContent < 30

                                ckJudge0To100('ctGravel', ctGravel)
                                ckJudge0To100('ctSand', ctSand)
                                if (hasErr()) {
                                    return ret() //重大錯誤直接報錯結束
                                }

                                if (ctSand >= ctGravel) {

                                    USCSDspEng = 'Silt with sand'
                                    USCSDspCht = '含砂之粉土'

                                }
                                else { //ctSand < ctGravel

                                    USCSDspEng = 'Silt with gravel'
                                    USCSDspCht = '含礫石之粉土'

                                }

                            }

                        }
                        else { //rCoarseContent >= 30

                            ckJudge0To100('ctGravel', ctGravel)
                            ckJudge0To100('ctSand', ctSand)
                            if (hasErr()) {
                                return ret() //重大錯誤直接報錯結束
                            }

                            if (ctSand >= ctGravel) {

                                //已ck
                                if (ctGravel < 15) {

                                    USCSDspEng = 'Sandy silt'
                                    USCSDspCht = '砂質粉土'

                                }
                                else { //ctGravel >= 15

                                    USCSDspEng = 'Sandy silt with gravel'
                                    USCSDspCht = '含礫石之砂質粉土'

                                }

                            }
                            else { //ctSand < ctGravel

                                //已ck
                                if (ctGravel < 15) {

                                    USCSDspEng = 'Gravelly silt'
                                    USCSDspCht = '礫石質粉土'

                                }
                                else { //ctGravel >= 15

                                    USCSDspEng = 'Gravelly silt with sand'
                                    USCSDspCht = '含砂之礫石質粉土'

                                }

                            }

                        }

                    }
                    else if (MC3 === 'C-M') {
                        icd = 25
                        USCS = 'CL-ML'

                        //已ck
                        if (rCoarseContent < 30) {

                            //已ck
                            if (rCoarseContent < 15) {

                                USCSDspEng = 'Silty clay'
                                USCSDspCht = '粉土質黏土'

                            }
                            else { //15 <= rCoarseContent < 30

                                ckJudge0To100('ctGravel', ctGravel)
                                ckJudge0To100('ctSand', ctSand)
                                if (hasErr()) {
                                    return ret() //重大錯誤直接報錯結束
                                }

                                if (ctSand >= ctGravel) {

                                    USCSDspEng = 'Silty clay with sand'
                                    USCSDspCht = '含砂之粉土質黏土'

                                }
                                else { //ctSand < ctGravel

                                    USCSDspEng = 'Silty clay with gravel'
                                    USCSDspCht = '含礫石之粉土質黏土'

                                }

                            }

                        }
                        else { //rCoarseContent >= 30

                            ckJudge0To100('ctGravel', ctGravel)
                            ckJudge0To100('ctSand', ctSand)
                            if (hasErr()) {
                                return ret() //重大錯誤直接報錯結束
                            }

                            if (ctSand >= ctGravel) {

                                if (ctGravel < 15) {

                                    USCSDspEng = 'Sandy Silty clay'
                                    USCSDspCht = '砂質粉土質黏土'

                                }
                                else { //ctGravel >= 15

                                    USCSDspEng = 'Sandy Silty clay with gravel'
                                    USCSDspCht = '含礫石之砂質粉土質黏土'

                                }

                            }
                            else { //ctSand < ctGravel

                                //已ck
                                if (ctGravel < 15) {

                                    USCSDspEng = 'Gravelly Silty clay'
                                    USCSDspCht = '礫石質粉土質黏土'

                                }
                                else { //ctGravel >= 15

                                    USCSDspEng = 'Gravelly Silty clay with sand'
                                    USCSDspCht = '含砂之礫石質粉土質黏土'

                                }

                            }

                        }

                    }

                }
                else if (Organic === 1) {
                    //有機

                    ckErrFun('LL', LL, ckInvalidLL, cErrLL)
                    ckErrFun('LLdry', LLdry, ckInvalidLL, cErrLL)
                    if (hasErr()) {
                        return ret() //重大錯誤直接報錯結束
                    }

                    if (LLdry / LL < 0.75) {

                        icd = 26
                        USCS = 'OL' //有機Organic Silt, Organic Clay
                        USCSDspEng = cEmpty
                        USCSDspCht = cEmpty

                    }
                    else { //LLdry / LL >= 0.75

                        icd = 27
                        USCS = 'PT(待確認)' //泥炭Peat
                        USCSDspEng = cEmpty
                        USCSDspCht = cEmpty

                    }

                }

            }

        }

    }

    return ret()
}


export default calcClassifyUscs
