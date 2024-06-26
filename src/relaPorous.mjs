import get from 'lodash-es/get.js'
import join from 'lodash-es/join.js'
import values from 'lodash-es/values.js'
import isNumber from 'lodash-es/isNumber.js'
import isnum from 'wsemi/src/isnum.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cnst from './cnst.mjs'


// //eps
// let eps = cnst.eps


//rw, 水單位重(kN/m3)
let rw = cnst.rw


function get_rd_from_GS_e(GS, e) {
    let rd = GS * rw / (1 + e)
    return rd
}


function get_rd_from_rsat_e(rsat, e) {
    let rd = rsat - (e * rw) / (1 + e)
    return rd
}


function get_rd_from_rsat_GS(rsat, GS) {
    let rd = (rsat - rw) * GS / (GS - 1)
    return rd
}


function get_rsat_from_GS_e(GS, e) {
    let rsat = (GS + e) * rw / (1 + e)
    return rsat
}


function get_rsat_from_rd_e(rd, e) {
    let rsat = rd + (e * rw) / (1 + e)
    return rsat
}


function get_rsat_from_rd_GS(rd, GS) {
    let rsat = rd * (GS - 1) / GS + rw
    return rsat
}


function get_e_from_GS_rd(GS, rd) {
    let e = (GS * rw - rd) / rd
    return e
}


function get_e_from_rd_rsat(rd, rsat) {
    let e = (rd - rsat) / (rsat - rw - rd)
    return e
}


// function get_e_from_rsat_rd(rsat, rd) {
//     let e = rw * (rsat - rd) / (1 - rw * (rsat - rd)) //結果同get_e_from_rd_rsat
//     return e
// }


function get_e_from_GS_rsat(GS, rsat) {
    let e = (GS * rw - rsat) / (rsat - rw)
    return e
}


function get_GS_from_rd_e(rd, e) {
    let GS = rd * (1 + e) / rw
    return GS
}


function get_GS_from_rd_rsat(rd, rsat) {
    let GS = rd / (rd - (rsat - rw))
    return GS
}


function get_GS_from_rsat_e(rsat, e) {
    let GS = (rsat + rsat * e - e * rw) / rw
    return GS
}


/**
 * 計算岩土孔隙參數：乾單位重rd、飽和單位重rsat、比重GS、孔隙比e之間互相轉換，至少4給2才能反推全部
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/relaPorous.test.js Github}
 * @memberOf w-geo
 * @param {Number} [rd=null] 輸入乾單位重數字，單位kN/m3，預設null
 * @param {Number} [rsat=null] 輸入飽和單位重數字，單位kN/m3，預設null
 * @param {Number} [GS=null] 輸入比重數字，無單位，預設null
 * @param {Number} [e=null] 輸入孔隙比數字，無單位，預設null
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnFuncs=false] 輸入是否回傳函數布林值，預設false
 * @returns {Object} 回傳物件，含鍵值rd、rsat、GS、e
 * @example
 *
 * let GS = 2.7
 * let e = 0.86
 * let rd = 14.240322580645163 //kN/m3
 * let rsat = 18.776129032258066 //kN/m3
 * let r
 *
 * let coreFuncs = relaPorous(null, null, null, null, { returnFuncs: true }).coreFuncs
 *
 * console.log('rd get_rd_from_GS_e', coreFuncs.get_rd_from_GS_e(GS, e))
 * // => rd get_rd_from_GS_e 14.240322580645163
 *
 * console.log('rd get_rd_from_rsat_e', coreFuncs.get_rd_from_rsat_e(rsat, e))
 * // => rd get_rd_from_rsat_e 14.240322580645163
 *
 * console.log('rd get_rd_from_rsat_GS', coreFuncs.get_rd_from_rsat_GS(rsat, GS))
 * // => rd get_rd_from_rsat_GS 14.240322580645161
 *
 * console.log('rsat get_rsat_from_GS_e', coreFuncs.get_rsat_from_GS_e(GS, e))
 * // => rsat get_rsat_from_GS_e 18.776129032258066
 *
 * console.log('rsat get_rsat_from_rd_e', coreFuncs.get_rsat_from_rd_e(rd, e))
 * // => rsat get_rsat_from_rd_e 18.776129032258066
 *
 * console.log('rsat get_rsat_from_rd_GS', coreFuncs.get_rsat_from_rd_GS(rd, GS))
 * // => rsat get_rsat_from_rd_GS 18.77612903225807
 *
 * console.log('e get_e_from_GS_rd', coreFuncs.get_e_from_GS_rd(GS, rd))
 * // => e get_e_from_GS_rd 0.8599999999999999
 *
 * console.log('e get_e_from_rd_rsat', coreFuncs.get_e_from_rd_rsat(rd, rsat))
 * // => e get_e_from_rd_rsat 0.8599999999999998
 *
 * console.log('e get_e_from_GS_rsat', coreFuncs.get_e_from_GS_rsat(GS, rsat))
 * // => e get_e_from_GS_rsat 0.86
 *
 * console.log('GS get_GS_from_rd_e', coreFuncs.get_GS_from_rd_e(rd, e))
 * // => GS get_GS_from_rd_e 2.7
 *
 * console.log('GS get_GS_from_rd_rsat', coreFuncs.get_GS_from_rd_rsat(rd, rsat))
 * // => GS get_GS_from_rd_rsat 2.6999999999999997
 *
 * console.log('GS get_GS_from_rsat_e', coreFuncs.get_GS_from_rsat_e(rsat, e))
 * // => GS get_GS_from_rsat_e 2.7
 *
 * r = relaPorous(rd, rsat, null, null)
 * console.log('rd,rsat', r)
 * // => rd,rsat {
 * //     rd: 14.240322580645163,
 * //     rsat: 18.776129032258066,
 * //     GS: 2.7,
 * //     e: 0.8599999999999998
 * // }
 *
 * r = relaPorous(rd, null, GS, null)
 * console.log('rd,GS', r)
 * // => rd,GS {
 * //     rd: 14.240322580645163,
 * //     rsat: 18.77612903225807,
 * //     GS: 2.7,
 * //     e: 0.8599999999999999
 * // }
 *
 * r = relaPorous(rd, null, null, e)
 * console.log('rd,e', r)
 * // => rd,e {
 * //     rd: 14.240322580645163,
 * //     rsat: 18.776129032258066,
 * //     GS: 2.7,
 * //     e: 0.86
 * // }
 *
 * r = relaPorous(null, rsat, GS, null)
 * console.log('rsat,GS', r)
 * // => rsat,GS {
 * //     rd: 14.240322580645161,
 * //     rsat: 18.776129032258066,
 * //     GS: 2.7,
 * //     e: 0.8600000000000001
 * // }
 *
 * r = relaPorous(null, rsat, null, e)
 * console.log('rsat,e', r)
 * // => rsat,e {
 * //     rd: 14.240322580645163,
 * //     rsat: 18.776129032258066,
 * //     GS: 2.7,
 * //     e: 0.86
 * // }
 *
 * r = relaPorous(null, null, GS, e)
 * console.log('GS,e', r)
 * // => GS,e {
 * //     rd: 14.240322580645163,
 * //     rsat: 18.776129032258066,
 * //     GS: 2.7,
 * //     e: 0.86
 * // }
 *
 * r = relaPorous(rd, rsat, GS, null)
 * console.log('rd,rsat,GS', r)
 * // => rd,rsat,GS {
 * //     rd: 14.240322580645163,
 * //     rsat: 18.776129032258066,
 * //     GS: 2.7,
 * //     e: 0.8599999999999999
 * // }
 *
 * r = relaPorous(rd, rsat, null, e)
 * console.log('rd,rsat,e', r)
 * // => rd,rsat,e {
 * //     rd: 14.240322580645163,
 * //     rsat: 18.776129032258066,
 * //     GS: 2.7,
 * //     e: 0.86
 * // }
 *
 * r = relaPorous(rd, null, GS, e)
 * console.log('rd,GS,e', r)
 * // => rd,GS,e {
 * //     rd: 14.240322580645163,
 * //     rsat: 18.776129032258066,
 * //     GS: 2.7,
 * //     e: 0.86
 * // }
 *
 * r = relaPorous(null, rsat, GS, e)
 * console.log('rsat,GS,e', r)
 * // => rsat,GS,e {
 * //     rd: 14.240322580645163,
 * //     rsat: 18.776129032258066,
 * //     GS: 2.7,
 * //     e: 0.86
 * // }
 *
 * try {
 *     r = relaPorous(13.9, null, GS, e)
 * }
 * catch (e) {
 *     r = e.toString()
 * }
 * console.log('GS,e', r)
 * // => GS,e {
 * //   rd: 13.9,
 * //   rsat: 18.776129032258066,
 * //   GS: 2.7,
 * //   e: 0.86,
 * //   err: '輸入孔隙比[0.86]與反算出孔隙比[0.9055395683453238]差距過大'
 * // }
 *
 */
function relaPorous(rd, rsat, GS, e, opt = {}) {
    let kpErr = {} //非中斷報錯訊息

    //returnFuncs
    let returnFuncs = get(opt, 'returnFuncs')
    if (!isbol(returnFuncs)) {
        returnFuncs = false
    }

    //rd, 乾單位重(kN/m3)
    if (isnum(rd)) {
        rd = cdbl(rd)
        if (rd <= 0) {
            kpErr['rd'] = `乾單位重[${rd}]為數字但<=0，自動清除`
        }
        if (rd <= rw) {
            kpErr['rd'] = `乾單位重[${rd}]<=水單位重[${rw}]`
        }
    }
    else {
        rd = null
    }

    //rsat, 飽和單位重(kN/m3)
    if (isnum(rsat)) {
        rsat = cdbl(rsat)
        if (rsat <= 0) {
            kpErr['rsat'] = `飽和單位重[${rsat}]為數字但<=0，自動清除`
        }
        if (rsat <= rw) {
            kpErr['rsat'] = `飽和單位重[${rsat}]<=水單位重[${rw}]`
        }
    }
    else {
        rsat = null
    }

    //GS, 比重
    if (isnum(GS)) {
        GS = cdbl(GS)
        if (GS <= 0) {
            kpErr['GS'] = `比重[${GS}]為數字但<=0，自動清除`
        }
    }
    else {
        GS = null
    }

    //e, 孔隙比
    if (isnum(e)) {
        e = cdbl(e)
        if (e <= 0) {
            kpErr['e'] = `孔隙比[${e}]為數字但<=0，自動清除`
        }
    }
    else {
        e = null
    }

    function core() {
        let bUpdate = false

        //calc rd
        let _rd
        if (!isNumber(_rd) && isNumber(GS) && isNumber(e)) {
            _rd = get_rd_from_GS_e(GS, e)
        }
        if (!isNumber(_rd) && isNumber(rsat) && isNumber(e)) {
            _rd = get_rd_from_rsat_e(rsat, e)
        }
        if (!isNumber(_rd) && isNumber(rsat) && isNumber(GS)) {
            if (GS !== 1) {
                _rd = get_rd_from_rsat_GS(rsat, GS)
            }
        }
        if (!isNumber(rd)) {
            rd = _rd
            bUpdate = true
        }
        else {
            // console.log('rd isNumber', Math.abs(rd - _rd) > eps)
            if (Math.abs(rd - _rd) > _rd / 100 * 5) {
                kpErr['ck_rd'] = `輸入乾單位重[${rd}]與反算出乾單位重[${_rd}]差距過大`
            }
        }

        //calc rsat
        let _rsat
        if (!isNumber(_rsat) && isNumber(GS) && isNumber(e)) {
            _rsat = get_rsat_from_GS_e(GS, e)
        }
        if (!isNumber(_rsat) && isNumber(rd) && isNumber(e)) {
            _rsat = get_rsat_from_rd_e(rd, e)
        }
        if (!isNumber(_rsat) && isNumber(rd) && isNumber(GS)) {
            _rsat = get_rsat_from_rd_GS(rd, GS)
        }
        if (!isNumber(rsat)) {
            rsat = _rsat
            bUpdate = true
        }
        else {
            if (Math.abs(rsat - _rsat) > _rsat / 100 * 5) {
                kpErr['ck_rsat'] = `輸入飽和單位重[${rsat}]與反算出飽和單位重[${_rsat}]差距過大`
            }
        }

        //calc e
        let _e
        if (!isNumber(_e) && isNumber(GS) && isNumber(rd)) {
            _e = get_e_from_GS_rd(GS, rd)
        }
        if (!isNumber(_e) && isNumber(rsat) && isNumber(rd)) {
            if ((rsat - rw - rd) !== 0) {
                _e = get_e_from_rd_rsat(rd, rsat)
            }
        }
        if (!isNumber(_e) && isNumber(rsat) && isNumber(GS)) {
            if ((rsat - rw) !== 0) {
                _e = get_e_from_GS_rsat(GS, rsat)
            }
        }
        if (!isNumber(e)) {
            e = _e
            bUpdate = true
        }
        else {
            if (Math.abs(e - _e) > _e / 100 * 5) {
                kpErr['ck_e'] = `輸入孔隙比[${e}]與反算出孔隙比[${_e}]差距過大`
            }
        }

        //calc GS
        let _GS
        if (!isNumber(_GS) && isNumber(rd) && isNumber(e)) {
            _GS = get_GS_from_rd_e(rd, e)
        }
        if (!isNumber(_GS) && isNumber(rd) && isNumber(rsat)) {
            if ((rd - (rsat - rw)) !== 0) {
                _GS = get_GS_from_rd_rsat(rd, rsat)
            }
        }
        if (!isNumber(_GS) && isNumber(rsat) && isNumber(e)) {
            _GS = get_GS_from_rsat_e(rsat, e)
        }
        if (!isNumber(GS)) {
            GS = _GS
            bUpdate = true
        }
        else {
            if (Math.abs(GS - _GS) > _GS / 100 * 5) {
                kpErr['ck_GS'] = `輸入比重[${GS}]與反算出比重[${_GS}]差距過大`
            }
        }

        return bUpdate
    }

    //check 至少要2參數才進行轉換
    let ieff = 0
    ieff += isnum(rd) ? 1 : 0
    ieff += isnum(rsat) ? 1 : 0
    ieff += isnum(GS) ? 1 : 0
    ieff += isnum(e) ? 1 : 0
    if (ieff >= 2) {
        let b = core()
        while (b) {
            b = core()
        }
    }

    //r
    let r = {
        rd,
        rsat,
        GS,
        e,
    }
    if (iseobj(kpErr)) {
        let err = join(values(kpErr), ', ')
        r.err = err
    }
    if (returnFuncs) {
        r.coreFuncs = {
            get_rd_from_GS_e,
            get_rd_from_rsat_e,
            get_rd_from_rsat_GS,
            get_rsat_from_GS_e,
            get_rsat_from_rd_e,
            get_rsat_from_rd_GS,
            get_e_from_GS_rd,
            get_e_from_rd_rsat,
            get_e_from_GS_rsat,
            get_GS_from_rd_e,
            get_GS_from_rd_rsat,
            get_GS_from_rsat_e,
        }
    }

    return r
}


export default relaPorous
