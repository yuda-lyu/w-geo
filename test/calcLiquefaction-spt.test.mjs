import fs from 'fs'
import assert from 'assert'
import calcLiquefaction from '../src/calcLiquefaction.mjs'


//註: 標準數據(rowsOut)內CRR75,CRR,FS,vstrIY,stlIY,PL等欄位, 其末位數字取決於JS引擎`**`(冪運算)之捨入結果,
//    現行引擎(Node.js v24.16.0)與早期產製標準數據之引擎不同, 例如NCEER之CRR75多項式含N160cs**3,
//    現24.584**3得14857.907208703999, 而24.584*24.584*24.584得14857.907208704, 相差1個ULP,
//    經CRR->FS->體積應變內插後放大至相對誤差最大約9e-15.
//    故於2026/07/23以Node.js v24.16.0重新產製標準數據(g_2_1-calcLiquefaction-spt.mjs), 計算邏輯與相依套件原始碼皆未更動.


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
