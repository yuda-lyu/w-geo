import assert from 'assert'
import { calcLayers } from '../src/calcLayers.mjs'
import rowsIn1 from './calcLayers-rowsIn1.json' assert { type: "json" }
import rowsOut1 from './calcLayers-rowsOut1.json' assert { type: "json" }
import rowsOut2 from './calcLayers-rowsOut2.json' assert { type: "json" }
import rowsOut3 from './calcLayers-rowsOut3.json' assert { type: "json" }
import rowsOut4 from './calcLayers-rowsOut4.json' assert { type: "json" }
import rowsOut5 from './calcLayers-rowsOut5.json' assert { type: "json" }
import rowsOut6 from './calcLayers-rowsOut6.json' assert { type: "json" }


describe(`calcLayers`, function() {

    let methods = [
        'Robertson1990T6',
        'Robertson1990T4',
        'Robertson2009T6',
        'Robertson2009T4',
        'RamseyT6',
        'RamseyT4',
    ]

    //opt
    let opt = {
        keyDepth: 'depth',
        keyDepthStart: 'depthStart',
        keyDepthEnd: 'depthEnd',
    }

    //calcLayers
    let rowsOut = calcLayers(rowsIn1, methods, opt)
    // console.log('calcLayers rowsOut1', rowsOut)

    for (let k = 1; k <= 6; k++) {
        let j = k - 1
        let rs = rowsOut[j].ltdt
        // rs = rs.map((v) => {
        //     v.fromInds = JSON.stringify(v.fromInds) //字串過長mocha會報錯
        //     return v
        // })
        rowsOut[j] = rs
    }
    // console.log('calcLayers rowsOut2', rowsOut)

    let gv = (rs) => {
        rs = rs.map((v) => {
            return {
                depthStart: v.depthStart,
                depthEnd: v.depthEnd,
                type: v.type,
            }
        })
        return rs
    }

    it(`should return rowsOut1 when calcLayers(rowsIn1, opt) for method[${methods[0]}]`, function() {
        let r = gv(rowsOut[0])
        let rr = gv(rowsOut1)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut2 when calcLayers(rowsIn1, opt) for method[${methods[1]}]`, function() {
        let r = gv(rowsOut[1])
        let rr = gv(rowsOut2)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut3 when calcLayers(rowsIn1, opt) for method[${methods[2]}]`, function() {
        let r = gv(rowsOut[2])
        let rr = gv(rowsOut3)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut4 when calcLayers(rowsIn1, opt) for method[${methods[3]}]`, function() {
        let r = gv(rowsOut[3])
        let rr = gv(rowsOut4)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut5 when calcLayers(rowsIn1, opt) for method[${methods[4]}]`, function() {
        let r = gv(rowsOut[4])
        let rr = gv(rowsOut5)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut6 when calcLayers(rowsIn1, opt) for method[${methods[5]}]`, function() {
        let r = gv(rowsOut[5])
        let rr = gv(rowsOut6)
        assert.strict.deepStrictEqual(r, rr)
    })

})
