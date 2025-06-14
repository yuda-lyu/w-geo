import fs from 'fs'
import assert from 'assert'
import calcClassifyUscs from '../src/calcClassifyUscs.mjs'


describe(`calcClassifyUscs`, function() {

    let j
    j = fs.readFileSync('./test/calcClassifyUscs-rowsIn1.json', 'utf8')
    let rowsIn1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcClassifyUscs-rowsOut1.json', 'utf8')
    let rowsOut1 = JSON.parse(j)

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
