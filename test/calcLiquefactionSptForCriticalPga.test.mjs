import fs from 'fs'
import assert from 'assert'
import calcLiquefactionSptForCriticalPga from '../src/calcLiquefactionSptForCriticalPga.mjs'


describe(`calcLiquefactionSptForCriticalPga`, function() {

    let j
    j = fs.readFileSync('./test/calcLiquefactionSptForCriticalPga-rowsIn1.json', 'utf8')
    let rowsIn1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcLiquefactionSptForCriticalPga-resOut1.json', 'utf8')
    let resOut1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcLiquefactionSptForCriticalPga-rowsIn2.json', 'utf8')
    let rowsIn2 = JSON.parse(j)
    j = fs.readFileSync('./test/calcLiquefactionSptForCriticalPga-resOut2.json', 'utf8')
    let resOut2 = JSON.parse(j)

    let methods = [
        'sptHBF2017',
        'sptNJRA2017',
    ]

    let opt = {
        waterLevelUsual: 0,
        waterLevelDesign: 0,
        unitSvSvp: 'kPa',
        Mw: 6.8,
        pgaMax: 2,
        pgaSlice: 0.2,
        useFS: true,
        usePL: true,
        useStl: true,
        stlLims: [0.2, 0.3],
        useH1PL: true,
        keysPick: ['sampleId', 'depthStart', 'depthEnd', 'depth'],
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
