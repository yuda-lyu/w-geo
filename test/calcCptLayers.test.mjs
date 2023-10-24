import assert from 'assert'
import { calcCptLayers } from '../src/calcCptLayers.mjs'
import rowsIn1 from './calcCptLayers-rowsIn1.json' assert { type: "json" }
import rowsOut1 from './calcCptLayers-rowsOut1.json' assert { type: "json" }
import rowsOut2 from './calcCptLayers-rowsOut2.json' assert { type: "json" }
import rowsOut3 from './calcCptLayers-rowsOut3.json' assert { type: "json" }
import rowsOut4 from './calcCptLayers-rowsOut4.json' assert { type: "json" }
import rowsOut5 from './calcCptLayers-rowsOut5.json' assert { type: "json" }
import rowsOut6 from './calcCptLayers-rowsOut6.json' assert { type: "json" }
import rowsOut7 from './calcCptLayers-rowsOut7.json' assert { type: "json" }
import rowsOut8 from './calcCptLayers-rowsOut8.json' assert { type: "json" }


describe(`calcCptLayers`, function() {

    let methods = [
        'Robertson1986T6',
        'Robertson1986T4',
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

    //calcCptLayers
    let rowsOut = calcCptLayers(rowsIn1, methods, opt)
    // console.log('calcCptLayers rowsOut1', rowsOut)

    for (let k = 1; k <= methods.length; k++) {
        let j = k - 1
        let rs = rowsOut[j].ltdt
        // rs = rs.map((v) => {
        //     v.fromInds = JSON.stringify(v.fromInds) //字串過長mocha會報錯
        //     return v
        // })
        rowsOut[j] = rs
    }
    // console.log('calcCptLayers rowsOut2', rowsOut)

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

    it(`should return rowsOut1 when calcCptLayers(rowsIn1, opt) for method[${methods[0]}]`, function() {
        let r = gv(rowsOut[0])
        let rr = gv(rowsOut1)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut2 when calcCptLayers(rowsIn1, opt) for method[${methods[1]}]`, function() {
        let r = gv(rowsOut[1])
        let rr = gv(rowsOut2)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut3 when calcCptLayers(rowsIn1, opt) for method[${methods[2]}]`, function() {
        let r = gv(rowsOut[2])
        let rr = gv(rowsOut3)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut4 when calcCptLayers(rowsIn1, opt) for method[${methods[3]}]`, function() {
        let r = gv(rowsOut[3])
        let rr = gv(rowsOut4)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut5 when calcCptLayers(rowsIn1, opt) for method[${methods[4]}]`, function() {
        let r = gv(rowsOut[4])
        let rr = gv(rowsOut5)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut6 when calcCptLayers(rowsIn1, opt) for method[${methods[5]}]`, function() {
        let r = gv(rowsOut[5])
        let rr = gv(rowsOut6)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut7 when calcCptLayers(rowsIn1, opt) for method[${methods[6]}]`, function() {
        let r = gv(rowsOut[6])
        let rr = gv(rowsOut7)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut8 when calcCptLayers(rowsIn1, opt) for method[${methods[7]}]`, function() {
        let r = gv(rowsOut[7])
        let rr = gv(rowsOut8)
        assert.strict.deepStrictEqual(r, rr)
    })

})
