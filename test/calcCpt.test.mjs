import assert from 'assert'
import { calcCpt } from '../src/calcCpt.mjs'
import rowsIn1 from './calcCpt-rowsIn1.json'
import rowsOut1 from './calcCpt-rowsOut1.json'


describe(`calcCpt`, function() {

    //opt
    let opt = {
        coe_a: 0.74,
        methodSmooth: 'none', //測試數據已使用averageIn95
        intrpSvSvp: (depth, k, v, ltdt) => {
            // console.log('intrpSvSvp', depth, k, v)
            let sv = v.sv * 1000 //字串轉數字, 且單位為MPa得轉kPa(程式內會再統一成為MPa)
            return {
                sv,
            }
        },
        // intrpU0: (depth, k, v, ltdt) => {
        // },
    }

    it(`should return rowsOut1 when calcCpt(rowsIn1, opt)`, function() {
        let r = calcCpt(rowsIn1, opt)
        let rr = rowsOut1
        assert.strict.deepStrictEqual(r, rr)
    })

})
