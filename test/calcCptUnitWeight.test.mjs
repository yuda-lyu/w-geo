import assert from 'assert'
import calcCptUnitWeight from '../src/calcCptUnitWeight.mjs'
import rowsIn1 from './calcCptUnitWeight-cpt-rowsIn1.json' assert { type: "json" }
import rowsOut1 from './calcCptUnitWeight-cpt-rowsOut1.json' assert { type: "json" }


describe(`calcCptUnitWeight`, function() {

    //rsatIni
    let rsatIni = 19.5

    //opt
    let opt = {
        coe_a: 0.75
    }

    it(`should return rowsOut1 when calcCptUnitWeight(rowsIn1, ${rsatIni}, ${JSON.stringify(opt)})`, function() {
        let r = calcCptUnitWeight(rowsIn1, rsatIni, opt)
        let rr = rowsOut1
        assert.strict.deepStrictEqual(r, rr)
    })

})
