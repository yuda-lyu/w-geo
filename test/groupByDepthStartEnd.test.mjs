import assert from 'assert'
import groupByDepthStartEnd from '../src/groupByDepthStartEnd.mjs'


describe(`groupByDepthStartEnd`, function() {

    let f1 = () => {
        let rows = [
            {
                depth: 0,
            },
            {
                depth: 1,
            },
            {
                depth: 3,
            },
            {
                depth: 10,
            },
        ]
        let ranges = [
            {
                depthStart: 0,
                depthEnd: 1,
            },
            {
                depthStart: 1,
                depthEnd: 4,
            },
        ]
        let rowsNew = [
            {
                'depthStart': 0,
                'depthEnd': 1,
                'rows': [
                    {
                        'depth': 0
                    },
                    {
                        'depth': 1
                    }
                ]
            },
            {
                'depthStart': 1,
                'depthEnd': 4,
                'rows': [
                    {
                        'depth': 3
                    }
                ]
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when groupByDepthStartEnd(${JSON.stringify(rows)}, ${JSON.stringify(ranges)})`, function() {
            let r = groupByDepthStartEnd(rows, ranges)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f1()

    let f2 = () => {
        let rows = [
            {
                depth: 0,
            },
            {
                depth: 1,
            },
            {
                depth: 3,
            },
            {
                depth: 10,
            },
        ]
        let ranges = [
            {
                depthStart: 0,
                depthEnd: 3,
            },
            {
                depthStart: 1,
                depthEnd: 5,
            },
        ]
        let rowsNew = `Error: 第 1 樣本結束深度depthEnd[3]大於第 2 個樣本起始深度depthStart[1]`

        it(`should return ${JSON.stringify(rowsNew)} when groupByDepthStartEnd(${JSON.stringify(rows)}, ${JSON.stringify(ranges)})`, function() {
            let r = ''
            try {
                r = groupByDepthStartEnd(rows, ranges)
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
                depth: 0,
            },
            {
                depth: 1,
            },
            {
                depth: 3,
            },
            {
                depth: 10,
            },
        ]
        let ranges = [
            {
                depthStart: 0,
                depthEnd: 2,
            },
            {
                depthStart: 5,
                depthEnd: 10,
            },
        ]
        let rowsNew = [
            {
                'depthStart': 0,
                'depthEnd': 2,
                'rows': [
                    {
                        'depth': 0
                    },
                    {
                        'depth': 1
                    }
                ]
            },
            {
                'depthStart': 5,
                'depthEnd': 10,
                'rows': [
                    {
                        'depth': 10
                    }
                ]
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when groupByDepthStartEnd(${JSON.stringify(rows)}, ${JSON.stringify(ranges)})`, function() {
            let r = groupByDepthStartEnd(rows, ranges)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f3()

    let f4 = () => {
        let rows = [
            {
                depth: 0,
            },
            {
                depth: 1,
            },
            {
                depth: 3,
            },
            {
                depth: 10,
            },
        ]
        let ranges = [
            {
                depthStart: 0,
                depthEnd: 10,
            },
        ]
        let rowsNew = [
            {
                'depthStart': 0,
                'depthEnd': 10,
                'rows': [
                    {
                        'depth': 0
                    },
                    {
                        'depth': 1
                    },
                    {
                        'depth': 3
                    },
                    {
                        'depth': 10
                    }
                ]
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when groupByDepthStartEnd(${JSON.stringify(rows)}, ${JSON.stringify(ranges)})`, function() {
            let r = groupByDepthStartEnd(rows, ranges)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f4()

    let f5 = () => {
        let rows = [
            {
                dc: 0,
            },
            {
                dc: 1,
            },
            {
                dc: 3,
            },
            {
                dc: 10,
            },
        ]
        let ranges = [
            {
                ds: 0,
                de: 1,
            },
            {
                ds: 1,
                de: 4,
            },
        ]
        let rowsNew = [
            {
                'ds': 0,
                'de': 1,
                'rows': [
                    {
                        'dc': 0
                    },
                    {
                        'dc': 1
                    }
                ]
            },
            {
                'ds': 1,
                'de': 4,
                'rows': [
                    {
                        'dc': 3
                    }
                ]
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when groupByDepthStartEnd(${JSON.stringify(rows)}, ${JSON.stringify(ranges)}, ${JSON.stringify({ keyDepth: 'dc', keyDepthStart: 'ds', keyDepthEnd: 'de' })})`, function() {
            let r = groupByDepthStartEnd(rows, ranges, { keyDepth: 'dc', keyDepthStart: 'ds', keyDepthEnd: 'de' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f5()

    let f6 = () => {
        //spec: isnum放行之極端值('0x10', '1e400', ±Infinity)作為樣本深度時, 與群組起訖深度之比較須如同函數內其餘站點先cdbl為有限數, 不得因wsemi judge改用isenum判定而throw
        let rangs = [
            { depthStart: 0, depthEnd: 5 },
            { depthStart: 5, depthEnd: 20 },
        ]
        let cases = [
            { dc: '0x10', rows2: [{ depth: '0x10' }] }, //cdbl('0x10')=16, 位於5~20
            { dc: '1e400', rows2: [] }, //cdbl為正最大有限數, 大於20, 不屬任何群組
            { dc: Infinity, rows2: [] }, //同上
            { dc: -Infinity, rows2: [] }, //cdbl為負最大有限數, 小於0, 不屬任何群組
        ]
        for (let c of cases) {
            let rows = [{ depth: 1 }, { depth: c.dc }]
            let rowsNew = [
                { depthStart: 0, depthEnd: 5, rows: [{ depth: 1 }] },
                { depthStart: 5, depthEnd: 20, rows: c.rows2 },
            ]
            it(`should return rowsNew when groupByDepthStartEnd([{ depth: 1 }, { depth: ${String(c.dc)} }], ranges)`, function() {
                let r = groupByDepthStartEnd(rows, rangs)
                let rr = rowsNew
                assert.strict.deepStrictEqual(r, rr)
            })
        }
    }
    f6()

})
