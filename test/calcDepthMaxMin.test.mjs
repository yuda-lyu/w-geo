import fs from 'fs'
import assert from 'assert'
import { calcDepthMaxMin } from '../src/calcDepthMaxMin.mjs'


describe(`calcDepthMaxMin`, function() {

    let j
    j = fs.readFileSync('./test/calcDepthMaxMin-rowsIn1.json', 'utf8')
    let rowsIn1 = JSON.parse(j)

    let ropt = {
        1: { approximate: false },
        2: { approximate: true },
    }
    let rout = {
        1: { depthMax: 99.98, depthMin: 0 },
        2: { depthMax: 100, depthMin: 0 },
    }

    it(`should return ${JSON.stringify(rout[1])} when calcDepthMaxMin(rowsIn1, ${JSON.stringify(ropt[1])})`, function() {
        let r = calcDepthMaxMin(rowsIn1, ropt[1])
        let rr = rout[1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${JSON.stringify(rout[2])} when calcDepthMaxMin(rowsIn1, ${JSON.stringify(ropt[2])})`, function() {
        let r = calcDepthMaxMin(rowsIn1, ropt[2])
        let rr = rout[2]
        assert.strict.deepStrictEqual(r, rr)
    })

})
