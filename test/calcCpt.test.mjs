import assert from 'assert'
import { calcCpt } from '../src/calcCpt.mjs'
import rowsIn1 from './calcCpt-rowsIn1.json' assert { type: "json" }
import rowsOut1 from './calcCpt-rowsOut1.json' assert { type: "json" }


describe(`calcCpt`, function() {

    //opt
    let opt = {
        coe_a: 0.74,
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
