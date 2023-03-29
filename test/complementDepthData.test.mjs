import assert from 'assert'
import complementDepthData from '../src/complementDepthData.mjs'
import rowsIn from './complementDepthData-rowsIn.json' assert { type: "json" }
import rowsOutFill from './complementDepthData-rowsOut-linearFill.json' assert { type: "json" }
import rowsOutCut from './complementDepthData-rowsOut-cut.json' assert { type: "json" }


describe(`complementDepthData`, function() {

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
