import assert from 'assert'
import { calcCptLayer } from '../src/calcCptLayer.mjs'
import rowsIn from './calcCptLayer-rowsIn.json' assert { type: "json" }
import rowsOut1 from './calcCptLayer-rowsOut1.json' assert { type: "json" }
import rowsOut2 from './calcCptLayer-rowsOut2.json' assert { type: "json" }
import rowsOut3 from './calcCptLayer-rowsOut3.json' assert { type: "json" }
import rowsOut4 from './calcCptLayer-rowsOut4.json' assert { type: "json" }
import rowsOut5 from './calcCptLayer-rowsOut5.json' assert { type: "json" }
import rowsOut6 from './calcCptLayer-rowsOut6.json' assert { type: "json" }
import rowsOut7 from './calcCptLayer-rowsOut7.json' assert { type: "json" }
import rowsOut8 from './calcCptLayer-rowsOut8.json' assert { type: "json" }


describe(`calcCptLayer`, function() {

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

    let rowsOuts = []
    for (let k = 0; k < methods.length; k++) {

        //method
        let method = methods[k]

        //calcCptLayer
        let rowsOut = calcCptLayer(rowsIn, method, opt)

        //push
        rowsOuts.push(rowsOut)

    }

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

    it(`should return rowsOut1 when calcCptLayer(rowsIn, opt) for method[${methods[0]}]`, function() {
        let r = gv(rowsOuts[0])
        let rr = gv(rowsOut1)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut2 when calcCptLayer(rowsIn, opt) for method[${methods[1]}]`, function() {
        let r = gv(rowsOuts[1])
        let rr = gv(rowsOut2)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut3 when calcCptLayer(rowsIn, opt) for method[${methods[2]}]`, function() {
        let r = gv(rowsOuts[2])
        let rr = gv(rowsOut3)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut4 when calcCptLayer(rowsIn, opt) for method[${methods[3]}]`, function() {
        let r = gv(rowsOuts[3])
        let rr = gv(rowsOut4)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut5 when calcCptLayer(rowsIn, opt) for method[${methods[4]}]`, function() {
        let r = gv(rowsOuts[4])
        let rr = gv(rowsOut5)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut6 when calcCptLayer(rowsIn, opt) for method[${methods[5]}]`, function() {
        let r = gv(rowsOuts[5])
        let rr = gv(rowsOut6)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut7 when calcCptLayer(rowsIn, opt) for method[${methods[6]}]`, function() {
        let r = gv(rowsOuts[6])
        let rr = gv(rowsOut7)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return rowsOut8 when calcCptLayer(rowsIn, opt) for method[${methods[7]}]`, function() {
        let r = gv(rowsOuts[7])
        let rr = gv(rowsOut8)
        assert.strict.deepStrictEqual(r, rr)
    })

})
