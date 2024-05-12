import assert from 'assert'
import calcRelaRelativeDensity from '../src/calcRelaRelativeDensity.mjs'


describe(`calcRelaRelativeDensity`, function() {

    let rd = 16.5 //kN/m3
    let Gt_dry_min = 16 //kN/m3
    let Gt_dry_max = 17 //kN/m3

    let r1 = [{
        rd,
        Gt_dry_min,
        Gt_dry_max,
    }]
    let rr1 = [{
        rd,
        Gt_dry_min,
        Gt_dry_max,
        Dr: 51.515151515151516,
    }]
    it(`should return ${JSON.stringify(rr1)} when calcRelaRelativeDensity(${JSON.stringify(r1)})`, function() {
        let r = calcRelaRelativeDensity(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})
