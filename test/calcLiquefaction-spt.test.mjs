import assert from 'assert'
import calcLiquefaction from '../src/calcLiquefaction.mjs'
import rowsIn1 from './calcLiquefaction-spt-rowsIn1.json'
import rowsOut1 from './calcLiquefaction-spt-rowsOut1.json'
import rowsIn2 from './calcLiquefaction-spt-rowsIn2.json'
import rowsOut2 from './calcLiquefaction-spt-rowsOut2.json'


describe(`calcLiquefaction`, function() {

    it(`should return rowsOut1 when calcLiquefaction.calc('SPT', rowsIn1)`, function() {
        let r = calcLiquefaction.calc('SPT', rowsIn1)
        let rr = rowsOut1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut2 when calcLiquefaction.calc('SPT', rowsIn2)`, function() {
        let r = calcLiquefaction.calc('SPT', rowsIn2)
        let rr = rowsOut2
        assert.strict.deepStrictEqual(r, rr)
    })

})
