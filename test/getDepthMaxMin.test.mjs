import assert from 'assert'
import { getDepthMaxMin } from '../src/getDepthMaxMin.mjs'
import rowsIn1 from './getDepthMaxMin-rowsIn1.json' assert { type: "json" }


describe(`getDepthMaxMin`, function() {

    let ropt = {
        1: { approximate: false },
        2: { approximate: true },
    }
    let rout = {
        1: { depthMax: 99.98, depthMin: 0 },
        2: { depthMax: 100, depthMin: 0 },
    }

    it(`should return ${JSON.stringify(rout[1])} when getDepthMaxMin(rowsIn1, ${JSON.stringify(ropt[1])})`, function() {
        let r = getDepthMaxMin(rowsIn1, ropt[1])
        let rr = rout[1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${JSON.stringify(rout[2])} when getDepthMaxMin(rowsIn1, ${JSON.stringify(ropt[2])})`, function() {
        let r = getDepthMaxMin(rowsIn1, ropt[2])
        let rr = rout[2]
        assert.strict.deepStrictEqual(r, rr)
    })

})
