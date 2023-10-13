import assert from 'assert'
import calcLiquefactionSpt from '../src/calcLiquefactionSpt.mjs'
import rowsIn1 from './calcLiquefactionSpt-rowsIn1.json' assert { type: "json" }
import resOut1 from './calcLiquefactionSpt-resOut1.json' assert { type: "json" }
import rowsIn2 from './calcLiquefactionSpt-rowsIn2.json' assert { type: "json" }
import resOut2 from './calcLiquefactionSpt-resOut2.json' assert { type: "json" }


describe(`calcLiquefactionSpt`, function() {

    let methods = [
        'sptHBF2017',
        'sptNJRA2017',
    ]

    let opt = {
        waterLevelUsual: 0.7,
        waterLevelDesign: 0.7,
        PGA: 0.32,
        Mw: 7.3,
        unitSvSvp: 'kPa',
    }

    it(`should return resOut1 when calcLiquefactionSpt(rowsIn1, ${JSON.stringify(methods)}), ${JSON.stringify(opt)})`, function() {
        let r = calcLiquefactionSpt(rowsIn1, methods, opt)
        let rr = resOut1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return resOut2 when calcLiquefactionSpt(rowsIn2, ${JSON.stringify(methods)}), ${JSON.stringify(opt)})`, function() {
        let r = calcLiquefactionSpt(rowsIn2, methods, opt)
        let rr = resOut2
        assert.strict.deepStrictEqual(r, rr)
    })

})
