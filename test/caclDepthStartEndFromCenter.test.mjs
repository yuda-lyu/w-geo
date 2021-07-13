import assert from 'assert'
import caclDepthStartEndFromCenter from '../src/caclDepthStartEndFromCenter.mjs'


describe(`caclDepthStartEndFromCenter`, function() {

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

        it(`should return ${JSON.stringify(rowsNew)} when caclDepthStartEndFromCenter(${JSON.stringify(rows)})`, function() {
            let r = caclDepthStartEndFromCenter(rows)
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

        it(`should return ${JSON.stringify(rowsNew)} when caclDepthStartEndFromCenter(${JSON.stringify(rows)})`, function() {
            let r = caclDepthStartEndFromCenter(rows)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f2()

    let f3 = () => {
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

        it(`should return ${JSON.stringify(rowsNew)} when caclDepthStartEndFromCenter(${JSON.stringify(rows)}, ${JSON.stringify({ keyDepth: 'dc', keyDepthStart: 'ds', keyDepthEnd: 'de' })})`, function() {
            let r = caclDepthStartEndFromCenter(rows, { keyDepth: 'dc', keyDepthStart: 'ds', keyDepthEnd: 'de' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f3()

})
