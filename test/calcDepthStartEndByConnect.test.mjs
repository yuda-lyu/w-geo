import assert from 'assert'
import calcDepthStartEndByConnect from '../src/calcDepthStartEndByConnect.mjs'


describe(`calcDepthStartEndByConnect`, function() {

    let f1 = () => {
        let rows = [{
            depthStart: 0,
            depthEnd: 4,
        },
        {
            depthStart: 6,
            depthEnd: 10,
        },
        {
            depthStart: 11,
            depthEnd: 15,
        },
        ]
        let rowsNew = [
            { depthStart: 0, depthEnd: 5 },
            { depthStart: 5, depthEnd: 10.5 },
            { depthStart: 10.5, depthEnd: 15 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndByConnect(${JSON.stringify(rows)})`, function() {
            let r = calcDepthStartEndByConnect(rows)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f1()

    let f2 = () => {
        let rows = [
            {
                depthStart: 0,
                depthEnd: 5,
            },
            {
                depthStart: 4,
                depthEnd: 15,
            },
        ]
        let rowsNew = `Error: 第 0 樣本之結束深度depthEnd[5]大於第 1 樣本之起點深度depthStart[4]`

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndByConnect(${JSON.stringify(rows)})`, function() {
            let r = null
            try {
                calcDepthStartEndByConnect(rows)
            }
            catch (err) {
                r = err.toString()
            }
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f2()

    let f3 = () => {
        let rows = [
            {
                depthStart: '0',
                depthEnd: '4',
            },
            {
                depthStart: '6',
                depthEnd: '10',
            },
        ]
        let rowsNew = [
            { depthStart: '0', depthEnd: 5 },
            { depthStart: 5, depthEnd: '10' },
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndByConnect(${JSON.stringify(rows)})`, function() {
            let r = calcDepthStartEndByConnect(rows)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f3()

    let f4 = () => {
        let rows = [
            {
                depthStart: '0',
                depthEnd: 'abc',
            },
            {
                depthStart: 'abc',
                depthEnd: '10',
            },
        ]
        let rowsNew = `Error: 第 0 樣本結束深度depthEnd[abc]非有效數字, 第 1 樣本起始深度depthStart[abc]非有效數字`

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndByConnect(${JSON.stringify(rows)})`, function() {
            let r = null
            try {
                calcDepthStartEndByConnect(rows)
            }
            catch (err) {
                r = err.toString()
            }
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f4()

    let f5 = () => {
        let rows = [
            {
                top_depth: 0,
                bottom_depth: 4,
            },
            {
                top_depth: 6,
                bottom_depth: 10,
            },
        ]
        let rowsNew = [
            { top_depth: 0, bottom_depth: 5 },
            { top_depth: 5, bottom_depth: 10 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndByConnect(${JSON.stringify(rows)}, { keyDepthStart: 'top_depth', keyDepthEnd: 'bottom_depth' })`, function() {
            let r = calcDepthStartEndByConnect(rows, { keyDepthStart: 'top_depth', keyDepthEnd: 'bottom_depth' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f5()

    let f6 = () => {
        let rows = [
            {
                depthStart: 0,
                depthEnd: 4,
            },
            {
                depthStart: 6,
                depthEnd: 10,
            },
            {
                depthStart: 11,
                depthEnd: 15,
            },
        ]
        let rowsNew = [
            { depthStart: 0, depthEnd: 5 },
            { depthStart: 5, depthEnd: 10.5 },
            { depthStart: 10.5, depthEnd: 20 }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndByConnect(${JSON.stringify(rows)}, { depthEndMax: 20 })`, function() {
            let r = calcDepthStartEndByConnect(rows, { depthEndMax: 20 })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f6()

})
