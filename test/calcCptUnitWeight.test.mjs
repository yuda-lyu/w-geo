import fs from 'fs'
import assert from 'assert'
import calcCptUnitWeight from '../src/calcCptUnitWeight.mjs'


//註: 標準數據(rowsOut)內Robertson應力指數迭代所得之n,Cn,Qtn,Icn, 其末位數字取決於JS引擎`**`(冪運算)之捨入結果,
//    現行引擎(Node.js v24.16.0)與早期產製標準數據之引擎不同, 例如Cn=(Pa/svp)**n之(0.10139616/0.0012504000000000003)**0.5871172594706838,
//    現得13.206590989250211而舊標準數據為13.20659098925021, 相差1個ULP, 經迭代後相對誤差最大約7e-16.
//    故於2026/07/23以Node.js v24.16.0重新產製標準數據(g_3_2-calcCptUnitWeight.mjs), 計算邏輯與相依套件原始碼皆未更動.


describe(`calcCptUnitWeight`, function() {

    let j
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsIn.json', 'utf8')
    let rowsIn = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsOut1.json', 'utf8')
    let rowsOut1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsOut2.json', 'utf8')
    let rowsOut2 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsOut3.json', 'utf8')
    let rowsOut3 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsOut4.json', 'utf8')
    let rowsOut4 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptUnitWeight-rowsOut5.json', 'utf8')
    let rowsOut5 = JSON.parse(j)

    //optDef
    let optDef = {
        rsatIni: 19.5,
        unitSvSvp: 'MPa',
    }

    let opt1 = {
        method: 'Robertson(1986)',
        ...optDef,
    }
    it(`should return rowsOut1 when calcCptUnitWeight(rowsIn, ${JSON.stringify(opt1)})`, function() {
        let r = calcCptUnitWeight(rowsIn, opt1)
        let rr = rowsOut1
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt2 = {
        method: 'Lunne(1997)',
        ...optDef,
    }
    it(`should return rowsOut2 when calcCptUnitWeight(rowsIn, ${JSON.stringify(opt2)})`, function() {
        let r = calcCptUnitWeight(rowsIn, opt2)
        let rr = rowsOut2
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt3 = {
        method: 'Lunne(1997) for Robertson stress exponent',
        ...optDef,
    }
    it(`should return rowsOut3 when calcCptUnitWeight(rowsIn, ${JSON.stringify(opt3)})`, function() {
        let r = calcCptUnitWeight(rowsIn, opt3)
        let rr = rowsOut3
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt4 = {
        method: 'Robertson and Cabal(2010)',
        ...optDef,
    }
    it(`should return rowsOut4 when calcCptUnitWeight(rowsIn, ${JSON.stringify(opt4)})`, function() {
        let r = calcCptUnitWeight(rowsIn, opt4)
        let rr = rowsOut4
        assert.strict.deepStrictEqual(r, rr)
    })

    let opt5 = {
        method: 'Mayne(2014)',
        ...optDef,
    }
    it(`should return rowsOut5 when calcCptUnitWeight(rowsIn, ${JSON.stringify(opt5)})`, function() {
        let r = calcCptUnitWeight(rowsIn, opt5)
        let rr = rowsOut5
        assert.strict.deepStrictEqual(r, rr)
    })

})
