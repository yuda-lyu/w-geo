import join from 'lodash-es/join.js'
import values from 'lodash-es/values.js'
import isNumber from 'lodash-es/isNumber.js'
import cdbl from 'wsemi/src/cdbl.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'


// //eps
// let eps = cnst.eps


/**
 * 計算土壤塑性參數：液限LL、塑限PL、塑性指數PI之間互相轉換，至少3給2才能反推全部
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/relaPlasticity.test.js Github}
 * @memberOf w-geo
 * @param {Number} [LL=null] 輸入液限數字，單位%，預設null
 * @param {Number} [PI=null] 輸入塑性指數數字，單位%，預設null
 * @param {Number} [PL=null] 輸入塑限數字，單位%，預設null
 * @returns {Object} 回傳物件，含鍵值LL、PI、PL
 * @example
 *
 * let LL = 24 //%
 * let PI = 14 //%
 * let PL = 10 //%
 * let r
 *
 * try {
 *     r = relaPlasticity(LL, null, null)
 * }
 * catch (e) {
 *     r = e.toString()
 * }
 * console.log('LL', r)
 * // => LL { LL: 24, PL: null, PI: null }
 *
 * try {
 *     r = relaPlasticity(null, PI, null)
 *     console.log('PI', r)
 * }
 * catch (e) {
 *     r = e.toString()
 * }
 * // => PI { LL: null, PL: null, PI: 14 }
 *
 * try {
 *     r = relaPlasticity(null, null, PL)
 * }
 * catch (e) {
 *     r = e.toString()
 * }
 * console.log('PL', r)
 * // => PL { LL: null, PL: 10, PI: null }
 *
 * try {
 *     r = relaPlasticity(LL, PI, null)
 * }
 * catch (e) {
 *     r = e.toString()
 * }
 * console.log('LL,PI', r)
 * // => LL,PI { LL: 24, PL: 10, PI: 14 }
 *
 * try {
 *     r = relaPlasticity(LL, null, PL)
 * }
 * catch (e) {
 *     r = e.toString()
 * }
 * console.log('LL,PL', r)
 * // => LL,PL { LL: 24, PL: 10, PI: 14 }
 *
 * try {
 *     r = relaPlasticity(null, PI, PL)
 * }
 * catch (e) {
 *     r = e.toString()
 * }
 * console.log('PI,PL', r)
 * // => PI,PL { LL: 24, PL: 10, PI: 14 }
 *
 * try {
 *     r = relaPlasticity(LL, PI, PL)
 * }
 * catch (e) {
 *     r = e.toString()
 * }
 * console.log('LL,PI,PL', r)
 * // => LL,PI,PL { LL: 24, PL: 10, PI: 14 }
 *
 * try {
 *     r = relaPlasticity(2, PI, PL)
 * }
 * catch (e) {
 *     r = e.toString()
 * }
 * console.log('2,PI,PL', r)
 * // => 2,PI,PL {
 * //   LL: 2,
 * //   PL: 10,
 * //   PI: 14,
 * //   err: '液限[2]<=塑限[10], 反算出塑限[-12]<=0, 反算出塑性指數[-8]<=0, 輸入液限[2]與反算出液限[24]差距過大'
 * // }
 *
 * try {
 *     r = relaPlasticity(32, PI, PL)
 * }
 * catch (e) {
 *     r = e.toString()
 * }
 * console.log('32,PI,PL', r)
 * // => 32,PI,PL {
 * //   LL: 32,
 * //   PL: 10,
 * //   PI: 14,
 * //   err: '輸入塑限[10]與反算出塑限[18]差距過大, 輸入塑性指數[14]與反算出塑性指數[22]差距過大, 輸入液限[32]與反算出液限[24]差距過大'
 * // }
 *
 */
function relaPlasticity(LL, PI, PL, WC = null) {
    let kpErr = {} //非中斷報錯訊息

    //LL, %
    if (isnum(LL)) {
        LL = cdbl(LL)
        if (LL <= 0) {
            kpErr['LL'] = `液限[${LL}]為數字但<=0，自動清除`
        }
    }
    else {
        LL = null
    }

    //PL, %
    if (isnum(PL)) {
        PL = cdbl(PL)
        if (PL <= 0) {
            kpErr['PL'] = `塑限[${PL}]為數字但<=0，自動清除`
        }
    }
    else {
        PL = null
    }

    //PI, %
    if (isnum(PI)) {
        PI = cdbl(PI)
        if (PI <= 0) {
            kpErr['PI'] = `塑性指數[${PI}]為數字但<=0，自動清除`
        }
    }
    else {
        PI = null
    }

    function core() {
        let bUpdate = false

        //LL>PL
        if (isNumber(LL) && isNumber(PL)) {
            if (LL <= PL) {
                kpErr['ck_LL_PL'] = `液限[${LL}]<=塑限[${PL}]`
            }
        }

        //LL-PI=PL
        let _PL
        if (isNumber(LL) && isNumber(PI)) {
            _PL = LL - PI
        }
        if (isNumber(_PL)) {
            if (!isNumber(PL)) {
                // console.log('set PL', _PL)
                PL = _PL
                bUpdate = true
            }
            else {
                // console.log('b1 PL', PL, _PL)
                if (_PL <= 0) {
                    kpErr['ck_PL'] = `反算出塑限[${_PL}]<=0`
                }
                else if (_PL >= 100) {
                    kpErr['ck_PL'] = `反算出塑限[${_PL}]>=100`
                }
                else if (Math.abs(PL - _PL) > _PL / 100 * 5) {
                    kpErr['ck_PL'] = `輸入塑限[${PL}]與反算出塑限[${_PL}]差距過大`
                }
            }
        }

        //PI=LL-PL
        let _PI
        if (isNumber(LL) && isNumber(PL)) {
            _PI = LL - PL
        }
        if (isNumber(_PI)) {
            if (!isNumber(PI)) {
                // console.log('set PI', _PI)
                PI = _PI
                bUpdate = true
            }
            else {
                // console.log('b2 PI', PI, _PI)
                if (_PI <= 0) {
                    kpErr['ck_PI'] = `反算出塑性指數[${_PI}]<=0`
                }
                else if (_PI >= 100) {
                    kpErr['ck_PI'] = `反算出塑性指數[${_PI}]>=100`
                }
                else if (Math.abs(PI - _PI) > _PI / 100 * 5) {
                    kpErr['ck_PI'] = `輸入塑性指數[${PI}]與反算出塑性指數[${_PI}]差距過大`
                }
            }
        }

        //PL+PI=LL
        let _LL
        if (isNumber(PL) && isNumber(PI)) {
            _LL = PL + PI
        }
        if (isNumber(_LL)) {
            if (!isNumber(LL)) {
                // console.log('set LL', _LL)
                LL = _LL
                bUpdate = true
            }
            else {
                // console.log('b3 LL', LL, _LL)
                if (_LL <= 0) {
                    kpErr['ck_LL'] = `反算出液限[${_LL}]<=0`
                }
                else if (_LL >= 100) {
                    kpErr['ck_LL'] = `反算出液限[${_LL}]>=100`
                }
                else if (Math.abs(LL - _LL) > _LL / 100 * 5) {
                    kpErr['ck_LL'] = `輸入液限[${LL}]與反算出液限[${_LL}]差距過大`
                }
            }
        }

        return bUpdate
    }

    //check 至少要2參數才進行轉換
    let ieff = 0
    ieff += isnum(LL) ? 1 : 0
    ieff += isnum(PL) ? 1 : 0
    ieff += isnum(PI) ? 1 : 0
    // console.log('ieff', ieff)
    if (ieff >= 2) {
        let b = core()
        // console.log('core1')
        while (b) {
            b = core()
            // console.log('core2')
        }
    }

    //LI, CI
    //CI<=0 : 流體狀，具流動性
    //0<CI<=1 : 塑體狀，具塑狀性質
    //CI>1 : 固體狀，具固體或半固體狀
    //CI與LI之和為1
    let LI = null //液性指數
    let CI = null //稠度指數
    if (isnum(WC) && PI !== 0) {
        WC = cdbl(WC)
        LI = (WC - PL) / PI
        CI = (LL - WC) / PI
    }

    //r
    let r = {
        LL,
        PL,
        PI,
        LI,
        CI,
    }
    if (iseobj(kpErr)) {
        let err = join(values(kpErr), ', ')
        r.err = err
    }

    return r
}


export default relaPlasticity
