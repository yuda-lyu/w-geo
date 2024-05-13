import assert from 'assert'
import estmRelativeDensity from '../src/estmRelativeDensity.mjs'


describe(`estmRelativeDensity`, function() {

    let rd = 16.5 //kN/m3
    let rdMin = 16 //kN/m3
    let rdMax = 17 //kN/m3

    let rr1 = {
        rd,
        rdMin,
        rdMax,
        Dr: 51.515151515151516,
    }
    it(`should return ${JSON.stringify(rr1)} when estmRelativeDensity( ${rd}, ${rdMin}, ${rdMax} )`, function() {
        let r = estmRelativeDensity(rd, rdMin, rdMax)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})
