import assert from 'assert'
import dtEstmRelativeDensity from '../src/dtEstmRelativeDensity.mjs'


describe(`dtEstmRelativeDensity`, function() {

    let r1 = {
        rd: 16.5, //kN/m3
        rdMin: 16, //kN/m3
        rdMax: 17, //kN/m3
    }
    let rr1 = {
        rd: 16.5, //kN/m3
        rdMin: 16, //kN/m3
        rdMax: 17, //kN/m3
        Dr: 51.515151515151516,
    }
    it(`should return ${JSON.stringify(rr1)} when dtEstmRelativeDensity( ${JSON.stringify(r1)} )`, function() {
        let r = dtEstmRelativeDensity(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

    let r2 = {
        rd: 17.5, //kN/m3
        rdMin: 16, //kN/m3
        rdMax: 17, //kN/m3
    }
    let rr2 = {
        rd: 17.5, //kN/m3
        rdMin: 16, //kN/m3
        rdMax: 17, //kN/m3
        Dr: 100,
    }
    it(`should return ${JSON.stringify(rr2)} when dtEstmRelativeDensity( ${JSON.stringify(r2)}, { checkLimit: false } )`, function() {
        let r = dtEstmRelativeDensity(r2, { checkLimit: false })
        let rr = rr2
        assert.strict.deepStrictEqual(r, rr)
    })

})
