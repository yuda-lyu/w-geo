import assert from 'assert'
import dtRelaRelativeDensity from '../src/dtRelaRelativeDensity.mjs'


describe(`dtRelaRelativeDensity`, function() {

    let rd = 16.5 //kN/m3
    let Gt_dry_min = 16 //kN/m3
    let Gt_dry_max = 17 //kN/m3

    let r1 = {
        rd,
        Gt_dry_min,
        Gt_dry_max,
    }
    let rr1 = {
        rd,
        Gt_dry_min,
        Gt_dry_max,
        Dr: 51.515151515151516,
    }
    it(`should return ${JSON.stringify(rr1)} when dtRelaRelativeDensity(${JSON.stringify(r1)})`, function() {
        let r = dtRelaRelativeDensity(r1)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})
