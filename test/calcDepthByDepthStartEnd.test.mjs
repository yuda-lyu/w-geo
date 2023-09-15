import assert from 'assert'
import calcDepthByDepthStartEnd from '../src/calcDepthByDepthStartEnd.mjs'


describe(`calcDepthByDepthStartEnd`, function() {

    let f1 = () => {
        let rows = [
            {
                depthStart: 0,
                depthEnd: 3,
            },
            {
                depthStart: 3,
                depthEnd: 13,
            },
            {
                depthStart: 13,
                depthEnd: 20,
            },
        ]
        let rowsNew = [
            { depthStart: 0, depthEnd: 3, depth: 1.5 },
            { depthStart: 3, depthEnd: 13, depth: 8 },
            { depthStart: 13, depthEnd: 20, depth: 16.5 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthByDepthStartEnd(${JSON.stringify(rows)})`, function() {
            let r = calcDepthByDepthStartEnd(rows)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f1()

    let f2 = () => {
        let rows = [
            {
                depthStart: 0,
                depthEnd: 3,
            },
            {
                depthStart: 13,
                depthEnd: 20,
            },
        ]
        let rowsNew = [
            { depthStart: 0, depthEnd: 3, depth: 1.5 },
            { depthStart: 13, depthEnd: 20, depth: 16.5 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthByDepthStartEnd(${JSON.stringify(rows)})`, function() {
            let r = calcDepthByDepthStartEnd(rows)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f2()

    let f3 = () => {
        let rows = [
            {
                ds: 0,
                de: 3,
            },
            {
                ds: 3,
                de: 13,
            },
            {
                ds: 13,
                de: 20,
            },
        ]
        let rowsNew = [
            { ds: 0, de: 3, dc: 1.5 },
            { ds: 3, de: 13, dc: 8 },
            { ds: 13, de: 20, dc: 16.5 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthByDepthStartEnd(${JSON.stringify(rows)}, ${JSON.stringify({ keyDepthStart: 'ds', keyDepthEnd: 'de', keyDepth: 'dc' })})`, function() {
            let r = calcDepthByDepthStartEnd(rows, { keyDepthStart: 'ds', keyDepthEnd: 'de', keyDepth: 'dc' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f3()

})
