import assert from 'assert'
import dtRelaPorous from '../src/dtRelaPorous.mjs'


describe(`dtRelaPorous`, function() {
    let eps = 1e-6

    let GS = 2.7
    let e = 0.86
    let rd = 14.240322580645163 //kN/m3
    let rsat = 18.776129032258066 //kN/m3
    let all = {
        rd, rsat, GS, e
    }
    let call = JSON.stringify(all)

    function ck(r) {
        return Math.abs(r.rd - rd) < eps && Math.abs(r.rsat - rsat) < eps && Math.abs(r.GS - GS) < eps && Math.abs(r.e - e) < eps
    }

    let r1 = {
        rd,
        rsat,
        GS: null,
        e: null,
    }
    it(`should return ${call} when dtRelaPorous(${JSON.stringify(r1)})`, function() {
        let r = dtRelaPorous(r1)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r2 = {
        rd,
        rsat: null,
        GS,
        e: null,
    }
    it(`should return ${call} when dtRelaPorous(${JSON.stringify(r2)})`, function() {
        let r = dtRelaPorous(r2)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r3 = {
        rd,
        rsat: null,
        GS: null,
        e,
    }
    it(`should return ${call} when dtRelaPorous(${JSON.stringify(r3)})`, function() {
        let r = dtRelaPorous(r3)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r4 = {
        rd: null,
        rsat,
        GS,
        e: null,
    }
    it(`should return ${call} when dtRelaPorous(${JSON.stringify(r4)})`, function() {
        let r = dtRelaPorous(r4)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r5 = {
        rd: null,
        rsat,
        GS: null,
        e,
    }
    it(`should return ${call} when dtRelaPorous(${JSON.stringify(r5)})`, function() {
        let r = dtRelaPorous(r5)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r6 = {
        rd: null,
        rsat: null,
        GS,
        e,
    }
    it(`should return ${call} when dtRelaPorous(${JSON.stringify(r6)})`, function() {
        let r = dtRelaPorous(r6)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r7 = {
        rd,
        rsat,
        GS,
        e: null,
    }
    it(`should return ${call} when dtRelaPorous(${JSON.stringify(r7)})`, function() {
        let r = dtRelaPorous(r7)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r8 = {
        rd,
        rsat,
        GS: null,
        e,
    }
    it(`should return ${call} when dtRelaPorous(${JSON.stringify(r8)})`, function() {
        let r = dtRelaPorous(r8)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r9 = {
        rd,
        rsat: null,
        GS,
        e,
    }
    it(`should return ${call} when dtRelaPorous(${JSON.stringify(r9)})`, function() {
        let r = dtRelaPorous(r9)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r10 = {
        rd: null,
        rsat,
        GS,
        e,
    }
    it(`should return ${call} when dtRelaPorous(${JSON.stringify(r10)})`, function() {
        let r = dtRelaPorous(r10)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    let r11 = {
        rd: 13.9,
        rsat: null,
        GS,
        e,
    }
    let rr11 = {
        rd: 13.9,
        rsat: 18.776129032258066,
        GS: 2.7,
        e: 0.86,
        err: '輸入孔隙比[0.86]與反算出孔隙比[0.9055395683453238]差距過大'
    }
    it(`should return ${JSON.stringify(rr11)} when dtRelaPorous(${JSON.stringify(r11)})`, function() {
        let r = dtRelaPorous(r11)
        let rr = rr11
        assert.strict.deepStrictEqual(r, rr)
    })

})
