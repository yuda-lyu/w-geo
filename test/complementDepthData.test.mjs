import fs from 'fs'
import assert from 'assert'
import complementDepthData from '../src/complementDepthData.mjs'


describe(`complementDepthData`, function() {

    let j
    j = fs.readFileSync('./test/complementDepthData-rowsIn.json', 'utf8')
    let rowsIn = JSON.parse(j)
    j = fs.readFileSync('./test/complementDepthData-rowsOut-linearFill.json', 'utf8')
    let rowsOutFill = JSON.parse(j)
    j = fs.readFileSync('./test/complementDepthData-rowsOut-cut.json', 'utf8')
    let rowsOutCut = JSON.parse(j)

    let keyDepth = 'depth(m)'
    let keyValue = 'qc(MPa)'
    let keysValueCmp = ['qc(MPa)', 'fs(MPa)', 'u2(MPa)']

    it(`should return rowsOut1 when complementDepthData(rowsIn, keyDepth, keyValue, keysValueCmp, { cmpMode: 'linear-fill' })`, function() {
        let r = complementDepthData(rowsIn, keyDepth, keyValue, keysValueCmp, { cmpMode: 'linear-fill' })
        let rr = rowsOutFill
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut2 when complementDepthData(rowsIn, keyDepth, keyValue, keysValueCmp, { cmpMode: 'cut' })`, function() {
        let r = complementDepthData(rowsIn, keyDepth, keyValue, keysValueCmp, { cmpMode: 'cut' })
        let rr = rowsOutCut
        assert.strict.deepStrictEqual(r, rr)
    })

})
