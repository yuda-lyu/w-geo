import fs from 'fs'
import assert from 'assert'
import { calcCpt } from '../src/calcCpt.mjs'


//註: 標準數據(rowsOut)內Robertson應力指數迭代所得之n,Cn,Qtn,Icn, 其末位數字取決於JS引擎`**`(冪運算)之捨入結果,
//    現行引擎(Node.js v24.16.0)與早期產製標準數據之引擎不同, 例如Cn=(Pa/svp)**n之(0.10139616/0.0012504000000000003)**0.5871172594706838,
//    現得13.206590989250211而舊標準數據為13.20659098925021, 相差1個ULP, 經迭代後相對誤差最大約7e-16.
//    故於2026/07/23以Node.js v24.16.0重新產製標準數據(g_3_1-calcCpt.mjs), 計算邏輯與相依套件原始碼皆未更動.


describe(`calcCpt`, function() {

    let j
    j = fs.readFileSync('./test/calcCpt-rowsIn1.json', 'utf8')
    let rowsIn1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCpt-rowsOut1.json', 'utf8')
    let rowsOut1 = JSON.parse(j)

    //opt
    let opt = {
        methodIterate: 'basic', //basic, binarySearch
        methodSmooth: 'none', //測試數據已使用averageIn95
        intrpSv: (depth, k, v, ltdt) => {
            // console.log('intrpSv', depth, k, v)
            let sv = v.sv //單位為MPa
            return {
                sv,
            }
        },
        // intrpU0: (depth, k, v, ltdt) => {
        // },
        unitSvSvp: 'MPa',
    }

    it(`should return rowsOut1 when calcCpt(rowsIn1, opt)`, function() {
        let r = calcCpt(rowsIn1, opt)
        let rr = rowsOut1
        assert.strict.deepStrictEqual(r, rr)
    })

})
