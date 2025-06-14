import fs from 'fs'
import assert from 'assert'
import calcLiquefaction from '../src/calcLiquefaction.mjs'


describe(`calcLiquefaction`, function() {

    let j
    j = fs.readFileSync('./test/calcLiquefaction-spt-rowsIn1.json', 'utf8')
    let rowsIn1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcLiquefaction-spt-rowsOut1.json', 'utf8')
    let rowsOut1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcLiquefaction-spt-rowsIn2.json', 'utf8')
    let rowsIn2 = JSON.parse(j)
    j = fs.readFileSync('./test/calcLiquefaction-spt-rowsOut2.json', 'utf8')
    let rowsOut2 = JSON.parse(j)

    let opt = {
        // waterLevelUsual: 0.7,
        // waterLevelDesign: 0.7,
        // PGA: 0.32,
        // Mw: 7.3,
        unitSvSvp: 'kPa',
    }

    // let gv = (ds) => {
    //     ds = _.map(ds, (v) => {
    //         let ks = [
    //             'sptHBF2012',
    //             'sptHBF2017',
    //             'sptNJRA1996',
    //             'sptNJRA2017',
    //             'sptNCEER',
    //             'sptSeed',
    //             'sptTY',
    //         ]
    //         let dt = {}
    //         _.each(ks, (k) => {
    //             dt[`${k}-FS`] = _.get(v, `${k}-FS`)
    //             dt[`${k}-stateFS`] = _.get(v, `${k}-stateFS`)
    //             dt[`${k}-stlTS`] = _.get(v, `${k}-stlTS`)
    //             dt[`${k}-stlIY`] = _.get(v, `${k}-stlIY`)
    //             dt[`${k}-H1`] = _.get(v, `${k}-H1`)
    //             dt[`${k}-H1PL`] = _.get(v, `${k}-H1PL`)
    //             dt[`${k}-err`] = _.get(v, `${k}-err`)
    //         })
    //         return dt
    //     })
    //     return ds
    // }

    it(`should return rowsOut1 when calcLiquefaction.calc('SPT', rowsIn1, ${JSON.stringify(opt)})`, function() {
        let r = calcLiquefaction.calc('SPT', rowsIn1, opt)
        let rr = rowsOut1
        // r = gv(r)
        // rr = gv(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut2 when calcLiquefaction.calc('SPT', rowsIn2, ${JSON.stringify(opt)})`, function() {
        let r = calcLiquefaction.calc('SPT', rowsIn2, opt)
        let rr = rowsOut2
        // r = gv(r)
        // rr = gv(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

})
