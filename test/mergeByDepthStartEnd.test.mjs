import assert from 'assert'
import mergeByDepthStartEnd from '../src/mergeByDepthStartEnd.mjs'


describe(`mergeByDepthStartEnd`, function() {

    let f1 = () => {
        let rows = [
            {
                depthStart: 0,
                depthEnd: 5,
                value: 'a',
                ext: 12.3,
            },
            {
                depthStart: 5,
                depthEnd: 7,
                value: 'b',
                ext: 12.4,
            },
            {
                depthStart: 7,
                depthEnd: 11,
                value: 'b',
                ext: 2.5,
            },
            {
                depthStart: 11,
                depthEnd: 15,
                value: 'a',
                ext: 2.3,
            },
        ]
        let rowsNew = [
            {
                'depthStart': 0,
                'depthEnd': 5,
                'value': 'a',
                'ext': 12.3
            },
            {
                'depthStart': 5,
                'depthEnd': 11,
                'value': 'b',
                'ext': 2.5
            },
            {
                'depthStart': 11,
                'depthEnd': 15,
                'value': 'a',
                'ext': 2.3
            }
        ]
        it(`should return ${JSON.stringify(rowsNew)} when mergeByDepthStartEnd(${JSON.stringify(rows)})`, function() {
            let r = ''
            try {
                r = mergeByDepthStartEnd(rows)
            }
            catch (err) {
                r = err.toString()
            }
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f1()

    let f2 = () => {
        let rows = [
            {
                ds: 0,
                de: 5,
                value: 'a',
                ext: 12.3,
            },
            {
                ds: 5,
                de: 7,
                value: 'b',
                ext: 12.4,
            },
            {
                ds: 7,
                de: 11,
                value: 'b',
                ext: 2.5,
            },
            {
                ds: 11,
                de: 15,
                value: 'a',
                ext: 2.3,
            },
        ]
        let rowsNew = [
            {
                'ds': 0,
                'de': 5,
                'value': 'a',
                'ext': 12.3
            },
            {
                'ds': 5,
                'de': 11,
                'value': 'b',
                'ext': 2.5
            },
            {
                'ds': 11,
                'de': 15,
                'value': 'a',
                'ext': 2.3
            }
        ]
        it(`should return ${JSON.stringify(rowsNew)} when mergeByDepthStartEnd(${JSON.stringify(rows)}, { keyDepthStart: 'ds', keyDepthEnd: 'de' })`, function() {
            let r = ''
            try {
                r = mergeByDepthStartEnd(rows, { keyDepthStart: 'ds', keyDepthEnd: 'de' })
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
                depthStart: 0,
                depthEnd: 5,
                data: 'a',
                ext: 12.3,
            },
            {
                depthStart: 5,
                depthEnd: 7,
                data: 'b',
                ext: 12.4,
            },
            {
                depthStart: 7,
                depthEnd: 11,
                data: 'b',
                ext: 2.5,
            },
            {
                depthStart: 11,
                depthEnd: 15,
                data: 'a',
                ext: 2.3,
            },
        ]
        let rowsNew = [
            {
                'depthStart': 0,
                'depthEnd': 5,
                'data': 'a',
                'ext': 12.3
            },
            {
                'depthStart': 5,
                'depthEnd': 11,
                'data': 'b',
                'ext': 2.5
            },
            {
                'depthStart': 11,
                'depthEnd': 15,
                'data': 'a',
                'ext': 2.3
            }
        ]
        it(`should return ${JSON.stringify(rowsNew)} when mergeByDepthStartEnd(${JSON.stringify(rows)}, { keyValue: 'data' })`, function() {
            let r = ''
            try {
                r = mergeByDepthStartEnd(rows, { keyValue: 'data' })
            }
            catch (err) {
                r = err.toString()
            }
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f3()

    let f4 = () => {
        let rows = [
            {
                depthStart: 0,
                depthEnd: 5,
                value: 'a',
                ext: 12.3,
            },
            {
                depthStart: 5,
                depthEnd: 7,
                value: 'b',
                ext: 12.4,
            },
            {
                depthStart: 7,
                depthEnd: 11,
                value: 'b',
                ext: 2.5,
            },
            {
                depthStart: 11,
                depthEnd: 15,
                value: 'b',
                ext: 2.3,
            },
            {
                depthStart: 15,
                depthEnd: 18,
                value: 'a',
                ext: 7.9,
            },
        ]
        let rowsNew = [
            {
                'depthStart': 0,
                'depthEnd': 5,
                'value': 'a',
                'ext': 12.3
            },
            {
                'value': 'b',
                'ext': 2.3,
                '_v0': {
                    'value': 'b',
                    'ext': 2.5,
                    '_v0': {
                        'depthStart': 5,
                        'depthEnd': 7,
                        'value': 'b',
                        'ext': 12.4
                    },
                    '_v1': {
                        'depthStart': 7,
                        'depthEnd': 11,
                        'value': 'b',
                        'ext': 2.5
                    },
                    'depthStart': 5,
                    'depthEnd': 11
                },
                '_v1': {
                    'depthStart': 11,
                    'depthEnd': 15,
                    'value': 'b',
                    'ext': 2.3
                },
                'depthStart': 5,
                'depthEnd': 15
            },
            {
                'depthStart': 15,
                'depthEnd': 18,
                'value': 'a',
                'ext': 7.9
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when mergeByDepthStartEnd(${JSON.stringify(rows)}, { funMerge: (v0, v1) => { return { value: v1.value, ext: v1.ext, _v0: v0, _v1: v1, } } })`, function() {
            let r = ''
            try {
                r = mergeByDepthStartEnd(rows, {
                    funMerge: (v0, v1) => {
                        return {
                        // depthStart: null,
                        // depthEnd: null,
                            value: v1.value,
                            ext: v1.ext,
                            _v0: v0,
                            _v1: v1,
                        }
                    }
                })
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
                depthStart: 0,
                depthEnd: 5,
                value: 'a',
                ext: 12.3,
            },
            {
                depthStart: 5,
                depthEnd: 7,
                value: 'b',
                ext: 12.4,
            },
            {
                depthStart: 7,
                depthEnd: 11,
                value: 'b',
                ext: 2.5,
            },
            {
                depthStart: 11,
                depthEnd: 15,
                value: 'b',
                ext: 2.3,
            },
            {
                depthStart: 15,
                depthEnd: 18,
                value: 'a',
                ext: 7.9,
            },
        ]
        let rowsNew = [
            {
                'depthStart': 0,
                'depthEnd': 5,
                'value': 'a',
                'ext': 12.3
            },
            {
                'depthStart': 5,
                'depthEnd': 15,
                'value': 'b',
                'ext': 12.4
            },
            {
                'depthStart': 15,
                'depthEnd': 18,
                'value': 'a',
                'ext': 7.9
            }
        ]
        it(`should return ${JSON.stringify(rowsNew)} when mergeByDepthStartEnd(${JSON.stringify(rows)}, { typeMerge: 'up' })`, function() {
            let r = ''
            try {
                r = mergeByDepthStartEnd(rows, { typeMerge: 'up' })
            }
            catch (err) {
                r = err.toString()
            }
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f5()

    let f6 = () => {
        let rows = ''
        let rowsNew = 'Error: 無有效數據'
        it(`should return ${JSON.stringify(rowsNew)} when mergeByDepthStartEnd(${JSON.stringify(rows)})`, function() {
            let r = ''
            try {
                r = mergeByDepthStartEnd(rows)
            }
            catch (err) {
                r = err.toString()
            }
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f6()

})
