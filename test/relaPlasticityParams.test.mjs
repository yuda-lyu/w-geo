import assert from 'assert'
import relaPlasticityParams from '../src/relaPlasticityParams.mjs'


describe(`relaPlasticityParams`, function() {
    let eps = 1e-6
    let LL = 24 //%
    let PI = 14 //%
    let PL = 10 //%
    let all = {
        LL, PI, PL
    }
    let call = JSON.stringify(all)

    function ck(r) {
        return Math.abs(r.LL - LL) < eps && Math.abs(r.PL - PL) < eps && Math.abs(r.PI - PI) < eps
    }

    let rr1 = { LL: 24, PL: null, PI: null }
    it(`should return ${JSON.stringify(rr1)} when relaPlasticityParams( ${LL}, null, null )`, function() {
        let r = relaPlasticityParams(LL, null, null)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

    let rr2 = { LL: null, PL: null, PI: 14 }
    it(`should return ${JSON.stringify(rr2)} when relaPlasticityParams( null, ${PI}, null )`, function() {
        let r = relaPlasticityParams(null, PI, null)
        let rr = rr2
        assert.strict.deepStrictEqual(r, rr)
    })

    let rr3 = { LL: null, PL: 10, PI: null }
    it(`should return ${JSON.stringify(rr3)} when relaPlasticityParams( null, null, ${PL} )`, function() {
        let r = relaPlasticityParams(null, null, PL)
        let rr = rr3
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${call} when relaPlasticityParams( ${LL}, ${PI}, null )`, function() {
        let r = relaPlasticityParams(LL, PI, null)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPlasticityParams( ${LL}, null, ${PL} )`, function() {
        let r = relaPlasticityParams(LL, null, PL)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPlasticityParams( null, ${PI}, ${PL} )`, function() {
        let r = relaPlasticityParams(null, PI, PL)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPlasticityParams( ${LL}, ${PI}, ${PL} )`, function() {
        let r = relaPlasticityParams(LL, PI, PL)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let rr4 = {
        LL: 2,
        PL: 10,
        PI: 14,
        err: '液限[2]<=塑限[10], 反算出塑限[-12]<=0, 反算出塑性指數[-8]<=0, 輸入液限[2]與反算出液限[24]差距過大'
    }
    it(`should return ${JSON.stringify(rr4)} when relaPlasticityParams( 2, ${PI}, ${PL} )`, function() {
        let r = relaPlasticityParams(2, PI, PL)
        let rr = rr4
        assert.strict.deepStrictEqual(r, rr)
    })

    let rr5 = {
        LL: 32,
        PL: 10,
        PI: 14,
        err: '輸入塑限[10]與反算出塑限[18]差距過大, 輸入塑性指數[14]與反算出塑性指數[22]差距過大, 輸入液限[32]與反算出液限[24]差距過大'
    }
    it(`should return ${JSON.stringify(rr5)} when relaPlasticityParams( 32, ${PI}, ${PL} )`, function() {
        let r = relaPlasticityParams(32, PI, PL)
        let rr = rr5
        assert.strict.deepStrictEqual(r, rr)
    })

})
