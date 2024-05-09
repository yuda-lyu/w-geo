import assert from 'assert'
import _ from 'lodash-es'
import w from 'wsemi'
import cutByDepthStartEnd from '../src/cutByDepthStartEnd.mjs'


describe(`cutByDepthStartEnd`, function() {

    let rowsIn = [
        {
            depth: 1,
        },
        {
            depth: 3,
        },
        {
            depth: 10,
        },
    ]
    // let rowsOut = cutByDepthStartEnd(rowsIn, 0, 9)
    // console.log(rowsOut)
    let rowsOut = [{ depth: 1 }, { depth: 3 }]

    it(`should return ${JSON.stringify(rowsOut)} when cutByDepthStartEnd(${JSON.stringify(rowsIn)}, 0, 9)`, function() {
        let r = cutByDepthStartEnd(rowsIn, 0, 9)
        let rr = rowsOut
        assert.strict.deepStrictEqual(r, rr)
    })

})
