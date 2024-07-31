import assert from 'assert'
import estmRelativeDensity from '../src/estmRelativeDensity.mjs'


describe(`estmRelativeDensity`, function() {

    let rr1 = {
        rd: 16.5, //kN/m3
        rdMin: 16, //kN/m3
        rdMax: 17, //kN/m3
        Dr: 51.515151515151516,
    }
    it(`should return ${JSON.stringify(rr1)} when estmRelativeDensity( ${rr1.rd}, ${rr1.rdMin}, ${rr1.rdMax} )`, function() {
        let r = estmRelativeDensity(rr1.rd, rr1.rdMin, rr1.rdMax)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

    let rr2 = {
        rd: 17.5, //kN/m3
        rdMin: 16, //kN/m3
        rdMax: 17, //kN/m3
        Dr: 100,
    }
    it(`should return ${JSON.stringify(rr2)} when estmRelativeDensity( ${rr2.rd}, ${rr2.rdMin}, ${rr2.rdMax}, { checkLimit: false } )`, function() {
        let r = estmRelativeDensity(rr2.rd, rr2.rdMin, rr2.rdMax, { checkLimit: false })
        let rr = rr2
        assert.strict.deepStrictEqual(r, rr)
    })

})
