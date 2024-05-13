import assert from 'assert'
import dtEstmRelativeDensity from '../src/dtEstmRelativeDensity.mjs'


describe(`dtEstmRelativeDensity`, function() {

    let rd = 16.5 //kN/m3
    let rdMin = 16 //kN/m3
    let rdMax = 17 //kN/m3

    let r1 = {
        rd,
        rdMin,
        rdMax,
    }
    let rr1 = {
        rd,
        rdMin,
        rdMax,
        Dr: 51.515151515151516,
    }
    it(`should return ${JSON.stringify(rr1)} when dtEstmRelativeDensity(${JSON.stringify(r1)})`, function() {
        let r = dtEstmRelativeDensity(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})
