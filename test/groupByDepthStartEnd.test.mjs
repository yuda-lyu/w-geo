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


})
