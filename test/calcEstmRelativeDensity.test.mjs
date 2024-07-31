import assert from 'assert'
import calcEstmRelativeDensity from '../src/calcEstmRelativeDensity.mjs'


describe(`calcEstmRelativeDensity`, function() {

    let r1 = [{
        rd: 16.5, //kN/m3
        rdMin: 16, //kN/m3
        rdMax: 17, //kN/m3
    }]
    let rr1 = [{
        rd: 16.5, //kN/m3
        rdMin: 16, //kN/m3
        rdMax: 17, //kN/m3
        Dr: 51.515151515151516,
    }]
    it(`should return ${JSON.stringify(rr1)} when calcEstmRelativeDensity( ${JSON.stringify(r1)} )`, function() {
        let r = calcEstmRelativeDensity(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

    let r2 = [
        {
            depth: 1,
            rd: 16.5,
            rdMin: 16,
            rdMax: 17,
        },
        {
            depth: 1.5,
            rd: null,
            rdMin: 16.2,
            rdMax: 17.7,
        },
        {
            depth: 2,
            rd: 17.1,
            rdMin: 16.6,
            rdMax: 18,
        },
    ]
    let rr2 = [
        {
            depth: 1,
            rd: 16.5,
            rdMin: 16,
            rdMax: 17,
            Dr: 51.515151515151516,
        },
        {
            depth: 1.5,
            rd: 16.8,
            rdMin: 16.2,
            rdMax: 17.7,
            Dr: 42.14285714285723,
        },
        {
            depth: 2,
            rd: 17.1,
            rdMin: 16.6,
            rdMax: 18,
            Dr: 37.593984962406054,
        },
    ]
    it(`should return ${JSON.stringify(rr2)} when calcEstmRelativeDensity( ${JSON.stringify(r2)} )`, function() {
        let r = calcEstmRelativeDensity(r2)
        let rr = rr2
        assert.strict.deepStrictEqual(r, rr)
    })

    let r3 = [{
        rd: 17.5, //kN/m3
        rdMin: 16, //kN/m3
        rdMax: 17, //kN/m3
    }]
    let rr3 = [{
        rd: 17.5, //kN/m3
        rdMin: 16, //kN/m3
        rdMax: 17, //kN/m3
        Dr: 100,
    }]
    it(`should return ${JSON.stringify(rr3)} when calcEstmRelativeDensity( ${JSON.stringify(r3)}, { checkLimit: false } )`, function() {
        let r = calcEstmRelativeDensity(r3, { checkLimit: false })
        let rr = rr3
        assert.strict.deepStrictEqual(r, rr)
    })

})
