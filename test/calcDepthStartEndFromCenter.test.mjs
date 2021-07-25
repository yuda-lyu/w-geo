import assert from 'assert'
import calcDepthStartEndFromCenter from '../src/calcDepthStartEndFromCenter.mjs'


describe(`calcDepthStartEndFromCenter`, function() {

    let f1 = () => {
        let rows = [
            {
                depth: 0,
            },
            {
                depth: 6,
            },
            {
                depth: 20,
            },
        ]
        let rowsNew = [
            { depth: 0, depthStart: 0, depthEnd: 3 },
            { depth: 6, depthStart: 3, depthEnd: 13 },
            { depth: 20, depthStart: 13, depthEnd: 20 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndFromCenter(${JSON.stringify(rows)})`, function() {
            let r = calcDepthStartEndFromCenter(rows)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f1()

    let f2 = () => {
        let rows = [
            {
                depth: 4,
            },
            {
                depth: 6,
            },
            {
                depth: 20,
            },
        ]
        let rowsNew = [
            { depth: 4, depthStart: 0, depthEnd: 5 },
            { depth: 6, depthStart: 5, depthEnd: 13 },
            { depth: 20, depthStart: 13, depthEnd: 20 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndFromCenter(${JSON.stringify(rows)})`, function() {
            let r = calcDepthStartEndFromCenter(rows)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f2()

    let f3 = () => {
        let rows = [
            {
                depth: 4,
            },
            {
                depth: 6,
            },
            {
                depth: 20,
            },
        ]
        let rowsNew = [
            { depth: 4, depthStart: 0, depthEnd: 5 },
            { depth: 6, depthStart: 5, depthEnd: 13 },
            { depth: 20, depthStart: 13, depthEnd: 25 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndFromCenter(${JSON.stringify(rows)}, ${JSON.stringify({ depthEndMax: 25 })})`, function() {
            let r = calcDepthStartEndFromCenter(rows, { depthEndMax: 25 })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f3()

    let f4 = () => {
        let rows = [
            {
                depth: 4,
            },
            {
                depth: 6,
            },
            {
                depth: 20,
            },
        ]
        let rowsNew = [
            { depth: 4, depthStart: 0, depthEnd: 5 },
            { depth: 6, depthStart: 5, depthEnd: 13 },
            { depth: 20, depthStart: 13, depthEnd: 20 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndFromCenter(${JSON.stringify(rows)}, ${JSON.stringify({ depthEndMax: 15 })})`, function() {
            let r = calcDepthStartEndFromCenter(rows, { depthEndMax: 15 })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f4()

    let f5 = () => {
        let rows = [
            {
                dc: 4,
            },
            {
                dc: 6,
            },
            {
                dc: 20,
            },
        ]
        let rowsNew = [
            { dc: 4, ds: 0, de: 5 },
            { dc: 6, ds: 5, de: 13 },
            { dc: 20, ds: 13, de: 20 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndFromCenter(${JSON.stringify(rows)}, ${JSON.stringify({ keyDepth: 'dc', keyDepthStart: 'ds', keyDepthEnd: 'de' })})`, function() {
            let r = calcDepthStartEndFromCenter(rows, { keyDepth: 'dc', keyDepthStart: 'ds', keyDepthEnd: 'de' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f5()

})
