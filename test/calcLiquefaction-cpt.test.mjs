import assert from 'assert'
import calcLiquefaction from '../src/calcLiquefaction.mjs'
import rowsIn1 from './calcLiquefaction-cpt-rowsIn1.json' assert { type: "json" }
import rowsOut1 from './calcLiquefaction-cpt-rowsOut1.json' assert { type: "json" }
import rowsIn2 from './calcLiquefaction-cpt-rowsIn2.json' assert { type: "json" }
import rowsOut2 from './calcLiquefaction-cpt-rowsOut2.json' assert { type: "json" }


describe(`calcLiquefaction`, function() {

    it(`should return rowsOut1 when calcLiquefaction.calc('CPT', rowsIn1)`, function() {
        let r = calcLiquefaction.calc('CPT', rowsIn1)
        let rr = rowsOut1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut2 when calcLiquefaction.calc('CPT', rowsIn2)`, function() {
        let r = calcLiquefaction.calc('CPT', rowsIn2)
        let rr = rowsOut2
        assert.strict.deepStrictEqual(r, rr)
    })

})
