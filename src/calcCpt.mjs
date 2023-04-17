import each from 'lodash/each'
import map from 'lodash/map'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import isNumber from 'lodash/isNumber'
import trim from 'lodash/trim'
import isstr from 'wsemi/src/isstr.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import binarySearch from 'w-optimization/src/binarySearch.mjs'
import { pickData } from './_share.mjs'
import cnst from './cnst.mjs'
import { intrpDefPp, intrpDefSvSvp } from './intrpDefParam.mjs'
import smoothDepthByKey from './smoothDepthByKey.mjs'
import { checkVerticalStress } from './calcVerticalStress.mjs'
import { cptClassify } from './calcCptClassify.mjs'


function basic(ltdt, opt = {}) {

    //rs
    let rs = []
    each(ltdt, (v) => {

        //trim
        let t = {}
        each(v, (tv, tk) => {
            if (isstr(tv)) {
                tv = trim(tv)
            }
            t[tk] = tv
        })
        v = t

        //depth(m)
        let depth = pickData(v, 'depth')

        //qc(MPa), 錐尖阻抗
        let qc = pickData(v, 'qc')

        //fs(MPa), 袖管摩擦阻力
        let fs = pickData(v, 'fs')

        //u2(MPa), 錐體和摩擦袖管間孔隙水壓, 原數據已扣掉初始值(假設為靜水壓), 故視為超額孔隙水壓
        let u2 = pickData(v, 'u2')

        //push
        rs.push({
            ...v, //須保留原始數據其他欄位
            depth,
            qc,
            fs,
            u2,
        })

    })

    return rs
}


function smooth(ltdt, opt = {}) {

    //ranger
    let ranger = get(opt, 'ranger')
    if (!iseobj(ranger)) {
        ranger = {
            depthHalf: 0.25 //預設上下取0.25m共0.5m
        }
    }

    //methodSmooth
    let methodSmooth = get(opt, 'methodSmooth')
    if (methodSmooth !== 'none' && methodSmooth !== 'average' && methodSmooth !== 'averageIn95') {
        methodSmooth = 'none'
    }

    //smoothDepthByKey
    if (methodSmooth !== 'none') {
        ltdt = smoothDepthByKey(ltdt, 'qc', { ranger, methodSmooth })
        ltdt = smoothDepthByKey(ltdt, 'fs', { ranger, methodSmooth })
        ltdt = smoothDepthByKey(ltdt, 'u2', { ranger, methodSmooth })
    }

    return ltdt
}


function stress(ltdt, opt = {}) {

    //intrpSv
    let intrpSv = get(opt, 'intrpSv')
    if (!isfun(intrpSv)) {
        intrpSv = (depth) => {
            return intrpDefSvSvp(depth, 'MPa')
        }
    }

    //intrpU0
    let intrpU0 = get(opt, 'intrpU0')
    if (!isfun(intrpU0)) {
        intrpU0 = (depth) => {
            return intrpDefPp(depth, 'MPa')
        }
    }

    //rs
    let rs = []
    each(ltdt, (v, k) => {

        //depth(m)
        let depth = pickData(v, 'depth')

        //sv(MPa), 總覆土應力(根據海床水平計算)
        let svsvp = intrpSv(depth, k, v, ltdt)
        let sv = svsvp.sv //MPa, 只取內插的垂直總應力(垂直有效應力是扣靜止水壓), 後續扣掉CPT的超額孔隙水壓u2與靜止水壓u0才能得到垂直有效應力
        if (isnum(sv)) {
            sv = cdbl(sv)
        }
        // console.log('sv', sv)

        //u0(MPa), 現地孔隙壓力(根據海床水平計算)
        let u0 = intrpU0(depth, k, v, ltdt)
        if (isnum(u0)) {
            u0 = cdbl(u0)
        }
        // console.log('u0', u0)

        //u2(MPa), 錐體和摩擦袖管間孔隙水壓, 原數據已扣掉初始值(假設為靜水壓), 故視為基於海床水平的孔隙水壓
        let u2 = pickData(v, 'u2')
        // console.log('u2', u2)

        //check
        if (u2 !== null) {
            if (u2 > 10) { //u2>10(MPa)視為異常值, 此點不列入有效數據, 2021/09/18
                return true //遇到異常值, 強制跳出處理下1筆
            }
        }

        //svp(MPa), 有效覆土應力(根據海床水平計算)
        let svp = null
        if (isNumber(sv) && isNumber(u0)) {
            svp = sv - u0 //svp是基於sv與u0計算而不是基於u2
            svp = Math.max(svp, 0)
        }
        // console.log('svp', svp)

        //push
        rs.push({
            ...v, //須保留原始數據其他欄位
            sv,
            svp,
            u0,
        })

    })

    return rs
}


function calcRobQtnAndIcn(qnet, Fr, svp, opt = {}) {
    let Pa = cnst.Pa //大氣壓(MPa)
    let err = null
    let n = null
    let Cn = null
    let Qtn = null
    let Icn = null

    //useCnLeq
    let useCnLeq = get(opt, 'useCnLeq')
    if (!isbol(useCnLeq)) {
        useCnLeq = false
    }

    //ret
    let ret = () => {
        return {
            n,
            Cn,
            Qtn,
            Icn,
            err,
        }
    }

    //check qnet
    if (!isnum(qnet)) {
        err = `qnet[${qnet}] is not a number`
        return ret()
    }
    else if (qnet <= 0) {
        err = `qnet[${qnet}] <= 0`
        return ret()
    }

    //check Fr
    if (!isnum(Fr)) {
        err = `Fr[${Fr}] is not a number`
        return ret()
    }
    else if (Fr <= 0) {
        err = `Fr[${Fr}] <= 0`
        return ret()
    }

    //check svp
    if (!isnum(svp)) {
        err = `svp[${svp}] is not a number`
        return ret()
    }
    else if (svp <= 0) {
        err = `svp[${svp}] <= 0`
        return ret()
    }

    //core
    let core = (n) => {
        let Cn = (Pa / svp) ** n //Pa(MPa),svp(MPa)單位對消
        if (useCnLeq) {
            Cn = Math.min(Cn, 1.7)
        }
        let Qtn = Cn * qnet / Pa
        let Icn = Math.sqrt((3.47 - Math.log10(Qtn)) ** 2 + (Math.log10(Fr) + 1.22) ** 2)
        let nn = 0.381 * Icn + 0.05 * (svp / Pa) - 0.15 //Pa,svp單位對消
        return {
            n, Cn, Qtn, Icn, nn
        }
    }

    //fun
    let fun = (n) => {
        let r = core(n)
        return Math.abs(r.n - r.nn) //for binarySearch
    }

    //binarySearch
    try {

        // //test 0,1
        // let r0 = core(0)
        // let r1 = core(1)

        //binarySearch
        let bs = binarySearch(fun, 0, 1)
        let n = bs.x
        let r = core(n)
        // console.log('r.n', r.n, 'r.nn', r.nn)

        //check 收斂性
        if (r.nn > 1) {
            // throw new Error('無法收斂')
            r = core(1) //若無法收斂則依照要求強制使用n=1 2023/04/17
            // console.log('無法收斂', r, 'r0.nn', r0.nn, 'r1.nn', r1.nn)
        }

        //check 超大值
        if (r.nn > 1e20) {
            console.log('非預期超大值', r, { qnet, Fr, svp })
            throw new Error('非預期超大值')
        }

        //save
        n = get(r, 'n', null)
        Cn = get(r, 'Cn', null)
        Qtn = get(r, 'Qtn', null)
        Icn = get(r, 'Icn', null)

    }
    catch (e) {
        err = e.toString()
    }

    return ret()
}


function calcCptCore(dt, coe_a, opt = {}) {

    //unitSvSvp
    let unitSvSvp = get(opt, 'unitSvSvp')
    if (unitSvSvp !== 'kPa' && unitSvSvp !== 'MPa') {
        throw new Error(`opt.unitSvSvp[${unitSvSvp}] need kPa or MPa`)
    }

    //gv
    let gv = (o, key) => {
        return get(o, `success.${key}`, null)
    }

    //depth(m)
    let depth = get(dt, 'depth')
    if (!isnum(depth)) {
        depth = null
    }
    else {
        depth = cdbl(depth)
    }

    //sv
    let sv = get(dt, 'sv')
    if (!isnum(sv)) {
        sv = null
    }
    else {
        sv = cdbl(sv)
    }

    //svp
    let svp = get(dt, 'svp')
    if (!isnum(svp)) {
        svp = null
    }
    else {
        svp = cdbl(svp)
    }

    //check sv, svp
    // console.log('dt', dt)
    if (isNumber(sv)) {
        checkVerticalStress(sv, depth, unitSvSvp, 'sv')
    }
    if (isNumber(svp)) {
        checkVerticalStress(svp, depth, unitSvSvp, 'svp')
    }

    //sv, svp(MPa), 後續sv, svp採MPa進行分析
    if (unitSvSvp === 'kPa') {
        sv /= 1000
        svp /= 1000
    }

    //qc(MPa)
    let qc = get(dt, 'qc')
    if (!isnum(qc)) {
        qc = null
    }
    else {
        qc = cdbl(qc)
    }

    //fs(MPa)
    let fs = get(dt, 'fs')
    if (!isnum(fs)) {
        fs = null
    }
    else {
        fs = cdbl(fs)
    }

    //u0(MPa)
    let u0 = get(dt, 'u0')
    if (!isnum(u0)) {
        u0 = null
    }
    else {
        u0 = cdbl(u0)
    }

    //u2(MPa), 一般是孔隙水壓, 非超額孔隙水壓, 但因為數據已扣掉初始值(若初始值為靜水壓), 視為基於海床面的孔隙水壓
    let u2 = get(dt, 'u2')
    if (!isnum(u2)) {
        u2 = null
    }
    else {
        u2 = cdbl(u2)
    }

    //coe_a
    if (!isnum(coe_a)) {
        throw new Error(`coe_a[${coe_a}] is not a number`)
    }
    else {
        coe_a = cdbl(coe_a)
    }

    //useCnLeq
    let useCnLeq = get(opt, 'useCnLeq')
    if (!isbol(useCnLeq)) {
        useCnLeq = false
    }

    //qt(MPa), 校正面積差異的錐尖阻抗, 軟弱之黏性土壤本身qc很低，而產生之超額孔隙水壓又很高，因之錐頭阻力之修正便非常重要，相反砂性土壤其qc較高，而超額孔隙水壓常與靜水壓相近，此時qc與qt之間便相差極小
    let qt = null
    if (isNumber(qc) && isNumber(u0) && isNumber(u2)) {
        qt = qc + u2 * (1 - coe_a) //許家維有提u2 = u0 + beta * deltau, beta: 作用在錐形肩台上的超額孔隙水壓與作用在感應器位置的壓力比
        qt = Math.max(qt, 0)
    }

    //qnet(MPa), 淨錐尖阻抗, 扣完總應力sv得視為無水壓影響
    let qnet = null
    if (isNumber(qt) && isNumber(sv)) {
        qnet = qt - sv //WPD報告 pp.307, 另外也有考慮K0版本: qt - K0 * sv, 可再討論修改
        qnet = Math.max(qnet, 0)
    }

    //Bq, 超額孔隙壓力比
    let Bq = null
    if (isNumber(qnet) && isNumber(u2)) {
        if (qnet > 0) {
            Bq = (u2 - u0) / qnet
            // Bq = Math.max(Bq, 0) //有負的超額孔隙水壓, 故不能取max 0
        }
    }

    //Rf(%), 摩擦比
    let Rf = null
    if (isNumber(qt) && isNumber(fs)) {
        if (qt > 0) {
            Rf = fs / qt * 100
            Rf = Math.max(Rf, 0)
        }
    }

    //Qt, 正規化錐尖阻抗
    let Qt = null
    if (isNumber(qnet) && isNumber(svp)) {
        if (svp > 0) {
            Qt = qnet / svp
            Qt = Math.max(Qt, 0)
        }
    }

    //Fr(%), 正規化摩擦比
    let Fr = null
    if (isNumber(qnet) && isNumber(fs)) {
        if (qnet > 0) {
            Fr = fs / qnet * 100
            Fr = Math.max(Fr, 0)
        }
    }

    //Ic, Ic = [ (3.47 − log10 𝑄𝑡 )^2 + (log10 𝐹𝑟 + 1.22)^2 ]^0.5
    let Ic = null
    if (isNumber(Qt) && isNumber(Fr)) {
        if (Qt > 0 && Fr > 0) {
            Ic = Math.sqrt((3.47 - Math.log10(Qt)) ** 2 + (Math.log10(Fr) + 1.22) ** 2)
        }
    }

    //n, Cn, Icn, Qtn, calcRobQtnAndIcn
    let t = calcRobQtnAndIcn(qnet, Fr, svp, { useCnLeq })
    let n = get(t, 'n', null)
    let Cn = get(t, 'Cn', null)
    let Icn = get(t, 'Icn', null)
    let Qtn = get(t, 'Qtn', null)

    //cptClassify
    let clsIc = cptClassify.csfIc(Ic)
    let clsIcn = cptClassify.csfIc(Icn)
    let clsRobBqqt = cptClassify.csfRobBqqt(Bq, qt)
    let clsRobRfqt = cptClassify.csfRobRfqt(Rf, qt)
    let clsRobBqQt = cptClassify.csfRobBqQt(Bq, Qt)
    let clsRobFrQt = cptClassify.csfRobFrQt(Fr, Qt)
    let clsRobBqQtn = cptClassify.csfRobBqQt(Bq, Qtn)
    let clsRobFrQtn = cptClassify.csfRobFrQt(Fr, Qtn)
    let clsRamBqQt = cptClassify.csfRamBqQt(Bq, Qt)
    let clsRamFrQt = cptClassify.csfRamFrQt(Fr, Qt)

    let iIc = gv(clsIc, 'int')
    let iIcn = gv(clsIcn, 'int')
    let iRobBqqt = gv(clsRobBqqt, 'int')
    let iRobRfqt = gv(clsRobRfqt, 'int')
    let iRobBqQt = gv(clsRobBqQt, 'int')
    let iRobFrQt = gv(clsRobFrQt, 'int')
    let iRobBqQtn = gv(clsRobBqQtn, 'int')
    let iRobFrQtn = gv(clsRobFrQtn, 'int')
    let iRamBqQt = gv(clsRamBqQt, 'int')
    let iRamFrQt = gv(clsRamFrQt, 'int')

    //r
    let r = {

        ...dt, //須保留原始數據其他欄位

        sv,
        svp,
        qc,
        fs,
        u0,
        u2,

        qt,
        qnet,
        Bq,
        Qt,
        Qtn,
        Rf,
        Fr,
        Ic,
        Icn,
        n,
        Cn,

        iIc,
        iIcn,
        iRobBqqt,
        iRobRfqt,
        iRobBqQt,
        iRobFrQt,
        iRobBqQtn,
        iRobFrQtn,
        iRamBqQt,
        iRamFrQt,

    }
    // console.log(r)

    //unitSvSvp, 此處為MPa, 故指定為kPa才要轉
    if (unitSvSvp === 'kPa') {
        r.sv *= 1000
        r.svp *= 1000
    }

    return r
}


function calcCpt(ltdt, opt = {}) {

    //unitSvSvp
    let unitSvSvp = get(opt, 'unitSvSvp')
    if (unitSvSvp !== 'kPa' && unitSvSvp !== 'MPa') {
        throw new Error(`opt.unitSvSvp[${unitSvSvp}] need kPa or MPa`)
    }

    //coe_a
    let coe_a = get(opt, 'coe_a')
    if (!isnum(coe_a)) {
        coe_a = 0.8
    }
    coe_a = cdbl(coe_a)

    //cloneDeep
    ltdt = cloneDeep(ltdt)

    //basic
    ltdt = basic(ltdt, opt)

    //smooth
    ltdt = smooth(ltdt, opt)

    //stress
    ltdt = stress(ltdt, opt)

    //calcCptCore
    ltdt = map(ltdt, (v) => {
        return calcCptCore(v, coe_a, opt)
    })

    //unitSvSvp已於calcCptCore處理轉換

    return ltdt
}


export {
    basic,
    smooth,
    stress,
    calcCpt,
    calcCptCore
}
export default { //整合輸出預設得要有default
    basic,
    smooth,
    stress,
    calcCpt,
    calcCptCore,
}
