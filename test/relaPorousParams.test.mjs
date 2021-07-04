import assert from 'assert'
import relaPorousParams from '../src/relaPorousParams.mjs'


describe(`relaPorousParams`, function() {
    let eps = 1e-6
    let GS = 2.7
    let e = 0.86
    let rd = 14.240322580645163 //kN/m3
    let rsat = 18.776129032258066 //kN/m3
    let all = {
        rd, rsat, GS, e
    }
    let call = JSON.stringify(all)
    let coreFuncs = relaPorousParams(null, null, null, null, { returnFuncs: true }).coreFuncs

    it(`should return ${rd} when coreFuncs.get_rd_from_GS_e( ${GS}, ${e} )`, function() {
        let r = coreFuncs.get_rd_from_GS_e(GS, e)
        let rr = Math.abs(r - rd) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${rd} when coreFuncs.get_rd_from_rsat_e( ${rsat}, ${e} )`, function() {
        let r = coreFuncs.get_rd_from_rsat_e(rsat, e)
        let rr = Math.abs(r - rd) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${rd} when coreFuncs.get_rd_from_rsat_GS( ${rsat}, ${GS} )`, function() {
        let r = coreFuncs.get_rd_from_rsat_GS(rsat, GS)
        let rr = Math.abs(r - rd) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${rsat} when coreFuncs.get_rsat_from_GS_e( ${GS}, ${e} )`, function() {
        let r = coreFuncs.get_rsat_from_GS_e(GS, e)
        let rr = Math.abs(r - rsat) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${rsat} when coreFuncs.get_rsat_from_rd_e( ${rd}, ${e} )`, function() {
        let r = coreFuncs.get_rsat_from_rd_e(rd, e)
        let rr = Math.abs(r - rsat) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${rsat} when coreFuncs.get_rsat_from_rd_GS( ${rd}, ${GS} )`, function() {
        let r = coreFuncs.get_rsat_from_rd_GS(rd, GS)
        let rr = Math.abs(r - rsat) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${e} when coreFuncs.get_e_from_GS_rd( ${GS}, ${rd} )`, function() {
        let r = coreFuncs.get_e_from_GS_rd(GS, rd)
        let rr = Math.abs(r - e) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${e} when coreFuncs.get_e_from_rd_rsat( ${rd}, ${rsat} )`, function() {
        let r = coreFuncs.get_e_from_rd_rsat(rd, rsat)
        let rr = Math.abs(r - e) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${e} when coreFuncs.get_e_from_GS_rsat( ${GS}, ${rsat} )`, function() {
        let r = coreFuncs.get_e_from_GS_rsat(GS, rsat)
        let rr = Math.abs(r - e) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${GS} when coreFuncs.get_GS_from_rd_e( ${rd}, ${e} )`, function() {
        let r = coreFuncs.get_GS_from_rd_e(rd, e)
        let rr = Math.abs(r - GS) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${GS} when coreFuncs.get_GS_from_rd_rsat( ${rd}, ${rsat} )`, function() {
        let r = coreFuncs.get_GS_from_rd_rsat(rd, rsat)
        let rr = Math.abs(r - GS) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${GS} when coreFuncs.get_GS_from_rsat_e( ${rsat}, ${e} )`, function() {
        let r = coreFuncs.get_GS_from_rsat_e(rsat, e)
        let rr = Math.abs(r - GS) < eps
        assert.strict.deepStrictEqual(true, rr)
    })

    function ck(r) {
        return Math.abs(r.rd - rd) < eps && Math.abs(r.rsat - rsat) < eps && Math.abs(r.GS - GS) < eps && Math.abs(r.e - e) < eps
    }

    it(`should return ${call} when relaPorousParams( ${rd}, ${rsat}, null, null )`, function() {
        let r = relaPorousParams(rd, rsat, null, null)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPorousParams( ${rd}, null, ${GS}, null )`, function() {
        let r = relaPorousParams(rd, null, GS, null)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPorousParams( ${rd}, null, null, ${e} )`, function() {
        let r = relaPorousParams(rd, null, null, e)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPorousParams( null, ${rsat}, ${GS}, null )`, function() {
        let r = relaPorousParams(null, rsat, GS, null)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPorousParams( null, ${rsat}, null, ${e} )`, function() {
        let r = relaPorousParams(null, rsat, null, e)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPorousParams( null, null, ${GS}, ${e} )`, function() {
        let r = relaPorousParams(null, null, GS, e)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPorousParams( ${rd}, ${rsat}, ${GS}, null )`, function() {
        let r = relaPorousParams(rd, rsat, GS, null)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPorousParams( ${rd}, ${rsat}, null, ${e} )`, function() {
        let r = relaPorousParams(rd, rsat, null, e)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPorousParams( ${rd}, null, ${GS}, ${e} )`, function() {
        let r = relaPorousParams(rd, null, GS, e)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return ${call} when relaPorousParams( null, ${rsat}, ${GS}, ${e} )`, function() {
        let r = relaPorousParams(null, rsat, GS, e)
        let rr = ck(r)
        assert.strict.deepStrictEqual(true, rr)
    })

})
