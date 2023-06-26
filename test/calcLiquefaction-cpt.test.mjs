import assert from 'assert'
import calcLiquefaction from '../src/calcLiquefaction.mjs'
import rowsIn1 from './calcLiquefaction-cpt-rowsIn1.json' assert { type: "json" }
import rowsOut1 from './calcLiquefaction-cpt-rowsOut1.json' assert { type: "json" }
import rowsIn2 from './calcLiquefaction-cpt-rowsIn2.json' assert { type: "json" }
import rowsOut2 from './calcLiquefaction-cpt-rowsOut2.json' assert { type: "json" }


describe(`calcLiquefaction`, function() {

    let opt = {
        coe_a: 0.85,
        waterLevelUsual: 0.7,
        waterLevelDesign: 0.7,
        PGA: 0.32,
        Mw: 7.3,
        unitSvSvp: 'kPa',
    }

    it(`should return rowsOut1 when calcLiquefaction.calc('CPT', rowsIn1, ${JSON.stringify(opt)})`, function() {
        let r = calcLiquefaction.calc('CPT', rowsIn1, opt)
        let rr = rowsOut1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut2 when calcLiquefaction.calc('CPT', rowsIn2), ${JSON.stringify(opt)}`, function() {
        let r = calcLiquefaction.calc('CPT', rowsIn2, opt)
        let rr = rowsOut2
        assert.strict.deepStrictEqual(r, rr)
    })

})
