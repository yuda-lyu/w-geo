import fs from 'fs'
import assert from 'assert'
import calcLiquefaction from '../src/calcLiquefaction.mjs'


describe(`calcLiquefaction`, function() {

    let j
    j = fs.readFileSync('./test/calcLiquefaction-cpt-rowsIn1.json', 'utf8')
    let rowsIn1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcLiquefaction-cpt-rowsOut1.json', 'utf8')
    let rowsOut1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcLiquefaction-cpt-rowsIn2.json', 'utf8')
    let rowsIn2 = JSON.parse(j)
    j = fs.readFileSync('./test/calcLiquefaction-cpt-rowsOut2.json', 'utf8')
    let rowsOut2 = JSON.parse(j)

    let opt = {
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
