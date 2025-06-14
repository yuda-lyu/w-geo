import fs from 'fs'
import assert from 'assert'
import { calcCpt } from '../src/calcCpt.mjs'


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
