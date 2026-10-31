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

    let f7 = () => {
        //spec: isnum放行之極端值('0x10', '1e400', ±Infinity)作為末樣本depthEnd時, 與depthEndMax之比較須如同函數內其餘站點先cdbl為有限數, 不得因wsemi judge改用isenum判定而throw
        let cases = [
            { de: '0x10', deNew: 20 }, //cdbl('0x10')=16<20, 故改為depthEndMax
            { de: -Infinity, deNew: 20 }, //cdbl(-Infinity)為負最大有限數<20, 故改為depthEndMax
            { de: Infinity, deNew: Infinity }, //cdbl(Infinity)為正最大有限數, 不小於20, 故保留原值
            { de: '1e400', deNew: '1e400' }, //同上, 保留原值
        ]
        for (let c of cases) {
            let rows = [
                { depthStart: 0, depthEnd: 5 },
                { depthStart: 5, depthEnd: c.de },
            ]
            let rowsNew = [
                { depthStart: 0, depthEnd: 5 },
                { depthStart: 5, depthEnd: c.deNew },
            ]
            it(`should return rowsNew with last depthEnd[${String(c.deNew)}] when calcDepthStartEndByConnect(rows with last depthEnd[${String(c.de)}], { depthEndMax: 20 })`, function() {
                let r = calcDepthStartEndByConnect(rows, { depthEndMax: 20 })
                let rr = rowsNew
                assert.strict.deepStrictEqual(r, rr)
            })
        }
    }
    f7()

})
