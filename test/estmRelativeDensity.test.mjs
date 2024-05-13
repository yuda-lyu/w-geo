import assert from 'assert'
import estmRelativeDensity from '../src/estmRelativeDensity.mjs'


describe(`estmRelativeDensity`, function() {

    let rd = 16.5 //kN/m3
    let Gt_dry_min = 16 //kN/m3
    let Gt_dry_max = 17 //kN/m3

    let rr1 = {
        rd,
        Gt_dry_min,
        Gt_dry_max,
        Dr: 51.515151515151516,
    }
    it(`should return ${JSON.stringify(rr1)} when estmRelativeDensity( ${rd}, ${Gt_dry_min}, ${Gt_dry_max} )`, function() {
        let r = estmRelativeDensity(rd, Gt_dry_min, Gt_dry_max)
        let rr = rr1
        assert.strict.deepStrictEqual(r, rr)
    })

})