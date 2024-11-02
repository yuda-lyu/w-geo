import assert from 'assert'
import calcLiquefaction from '../src/calcLiquefaction.mjs'
import rowsIn1 from './calcLiquefaction-spt-rowsIn1.json' assert { type: "json" }
import rowsOut1 from './calcLiquefaction-spt-rowsOut1.json' assert { type: "json" }
import rowsIn2 from './calcLiquefaction-spt-rowsIn2.json' assert { type: "json" }
import rowsOut2 from './calcLiquefaction-spt-rowsOut2.json' assert { type: "json" }


describe(`calcLiquefaction`, function() {

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
