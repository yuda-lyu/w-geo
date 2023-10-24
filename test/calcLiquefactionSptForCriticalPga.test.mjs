import assert from 'assert'
import calcLiquefactionSptForCriticalPga from '../src/calcLiquefactionSptForCriticalPga.mjs'
import rowsIn1 from './calcLiquefactionSptForCriticalPga-rowsIn1.json' assert { type: "json" }
import resOut1 from './calcLiquefactionSptForCriticalPga-resOut1.json' assert { type: "json" }
import rowsIn2 from './calcLiquefactionSptForCriticalPga-rowsIn2.json' assert { type: "json" }
import resOut2 from './calcLiquefactionSptForCriticalPga-resOut2.json' assert { type: "json" }


describe(`calcLiquefactionSptForCriticalPga`, function() {

    let methods = [
        'sptHBF2017',
        'sptNJRA2017',
    ]

    let opt = {
        waterLevelUsual: 0.7,
        waterLevelDesign: 0.7,
        unitSvSvp: 'kPa',
        Mw: 6.8,
        pgaMax: 2,
        pgaSlice: 0.2,
        useFS: true,
        usePL: true,
        useStl: true,
        useH1PL: true,
        returnLtdtForEachPga: true,
    }

    it(`should return resOut1 when calcLiquefactionSptForCriticalPga(rowsIn1, ${JSON.stringify(methods)}), ${JSON.stringify(opt)})`, function() {
        let r = calcLiquefactionSptForCriticalPga(rowsIn1, methods, opt)
        let rr = resOut1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return resOut2 when calcLiquefactionSptForCriticalPga(rowsIn2, ${JSON.stringify(methods)}), ${JSON.stringify(opt)})`, function() {
        let r = calcLiquefactionSptForCriticalPga(rowsIn2, methods, opt)
        let rr = resOut2
        assert.strict.deepStrictEqual(r, rr)
    })

})
