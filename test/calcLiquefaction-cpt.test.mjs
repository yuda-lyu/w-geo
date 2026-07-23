import fs from 'fs'
import assert from 'assert'
import calcLiquefaction from '../src/calcLiquefaction.mjs'


//註: 標準數據(rowsOut)內n,Cn,Qtn,Icn,CRR75,CRR,CSR,FS等欄位, 其末位數字取決於JS引擎`**`(冪運算)之捨入結果,
//    現行引擎(Node.js v24.16.0)與早期產製標準數據之引擎不同, 例如Cn=(Pa/svp)**n之(0.10139616/0.0012504000000000003)**0.5871172594706838,
//    現得13.206590989250211而舊標準數據為13.20659098925021, 相差1個ULP, 經應力指數迭代與CRR/FS放大後相對誤差最大約5e-14,
//    亦包含cptRobertson2009-stateFS訊息內所夾帶之FS數值字串.
//    故於2026/07/23以Node.js v24.16.0重新產製標準數據(g_2_2-calcLiquefaction-cpt.mjs), 計算邏輯與相依套件原始碼皆未更動.


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
