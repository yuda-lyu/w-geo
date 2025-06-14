import fs from 'fs'
import assert from 'assert'
import { calcCptLayer } from '../src/calcCptLayers.mjs'


describe(`calcCptLayers`, function() {

    let j
    j = fs.readFileSync('./test/calcCptLayers-rowsIn.json', 'utf8')
    let rowsIn = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptLayers-rowsOut1.json', 'utf8')
    let rowsOut1 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptLayers-rowsOut2.json', 'utf8')
    let rowsOut2 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptLayers-rowsOut3.json', 'utf8')
    let rowsOut3 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptLayers-rowsOut4.json', 'utf8')
    let rowsOut4 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptLayers-rowsOut5.json', 'utf8')
    let rowsOut5 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptLayers-rowsOut6.json', 'utf8')
    let rowsOut6 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptLayers-rowsOut7.json', 'utf8')
    let rowsOut7 = JSON.parse(j)
    j = fs.readFileSync('./test/calcCptLayers-rowsOut8.json', 'utf8')
    let rowsOut8 = JSON.parse(j)

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
