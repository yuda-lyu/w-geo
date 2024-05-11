import assert from 'assert'
import dtRelaPlasticity from '../src/dtRelaPlasticity.mjs'


describe(`dtRelaPlasticity`, function() {
    let eps = 1e-6

    let LL = 24 //%
    let PI = 14 //%
    let PL = 10 //%
    let all = {
        LL,
        PI,
        PL,
        CI: null,
        LI: null,
    }
    let call = JSON.stringify(all)

    function ck(r) {
        return Math.abs(r.LL - LL) < eps && Math.abs(r.PL - PL) < eps && Math.abs(r.PI - PI) < eps
    }

    let r1 = {
        LL,
        PL: null,
        PI: null,
    }
    let rr1 = {
        LL: 24,
        PL: null,
        PI: null,
        CI: null,
        LI: null,
    }
    it(`should return ${JSON.stringify(rr1)} when dtRelaPlasticity(${JSON.stringify(r1)})`, function() {
        let r = dtRelaPlasticity(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

    let r2 = {
        LL: null,
        PI,
        PL: null,
    }
    let rr2 = {
        LL: null,
        PL: null,
        PI: 14,
        CI: null,
        LI: null,
    }
    it(`should return ${JSON.stringify(rr2)} when dtRelaPlasticity(${JSON.stringify(r2)})`, function() {
        let r = dtRelaPlasticity(r2)
        let rr = rr2
        assert.strict.deepStrictEqual(r, rr)
    })

    let r3 = {
        LL: null,
        PI: null,
        PL,
    }
    let rr3 = {
        LL: null,
        PL: 10,
        PI: null,
        CI: null,
        LI: null,
    }
    it(`should return ${JSON.stringify(rr3)} when dtRelaPlasticity(${JSON.stringify(r3)})`, function() {
        let r = dtRelaPlasticity(r3)
        let rr = rr3
        assert.strict.deepStrictEqual(r, rr)
    })

    let r4 = {
        LL,
        PI,
        PL: null,
    }
    it(`should return ${call} when dtRelaPlasticity(${JSON.stringify(r4)})`, function() {
        let r = dtRelaPlasticity(r4)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r5 = {
        LL,
        PI,
        PL: null,
    }
    it(`should return ${call} when dtRelaPlasticity(${JSON.stringify(r5)})`, function() {
        let r = dtRelaPlasticity(r5)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r6 = {
        LL: null,
        PI,
        PL,
    }
    it(`should return ${call} when dtRelaPlasticity(${JSON.stringify(r6)})`, function() {
        let r = dtRelaPlasticity(r6)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r7 = {
        LL,
        PI,
        PL,
    }
    it(`should return ${call} when dtRelaPlasticity(${JSON.stringify(r7)})`, function() {
        let r = dtRelaPlasticity(r7)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r8 = {
        LL: 2,
        PI,
        PL,
    }
    let rr8 = {
        LL: 2,
        PL: 10,
        PI: 14,
        CI: null,
        LI: null,
        err: '液限[2]<=塑限[10], 反算出塑限[-12]<=0, 反算出塑性指數[-8]<=0, 輸入液限[2]與反算出液限[24]差距過大'
    }
    it(`should return ${JSON.stringify(rr8)} when dtRelaPlasticity(${JSON.stringify(r8)})`, function() {
        let r = dtRelaPlasticity(r8)
        let rr = rr8
        assert.strict.deepStrictEqual(r, rr)
    })

    let r9 = {
        LL: 32,
        PI,
        PL,
    }
    let rr9 = {
        LL: 32,
        PL: 10,
        PI: 14,
        CI: null,
        LI: null,
        err: '輸入塑限[10]與反算出塑限[18]差距過大, 輸入塑性指數[14]與反算出塑性指數[22]差距過大, 輸入液限[32]與反算出液限[24]差距過大'
    }
    it(`should return ${JSON.stringify(rr9)} when dtRelaPlasticity(${JSON.stringify(r9)})`, function() {
        let r = dtRelaPlasticity(r9)
        let rr = rr9
        assert.strict.deepStrictEqual(r, rr)
    })

})
