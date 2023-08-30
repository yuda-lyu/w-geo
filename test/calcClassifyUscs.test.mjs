import assert from 'assert'
import calcClassifyUscs from '../src/calcClassifyUscs.mjs'
import rowsIn1 from './calcClassifyUscs-rowsIn1.json' assert { type: "json" }
import rowsOut1 from './calcClassifyUscs-rowsOut1.json' assert { type: "json" }


describe(`calcClassifyUscs`, function() {

    for (let k = 0; k < rowsIn1.length; k++) {
        let rIn = rowsIn1[k]
        let rOut = rowsOut1[k]
        it(`should return ${JSON.stringify(rOut)} when calcClassifyUscs(${JSON.stringify(rIn)})`, function() {
            let r = calcClassifyUscs(rIn)
            delete r.icd
            delete r.err
            delete r.msg
            let rr = rOut
            assert.strict.deepStrictEqual(r, rr)
        })
    }

})
