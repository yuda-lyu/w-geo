import assert from 'assert'
import calcDepthStartEndByGroup from '../src/calcDepthStartEndByGroup.mjs'


describe(`calcDepthStartEndByGroup`, function() {

    let f1 = () => {
        let rows = [
            {
                depth: 0,
                group: 'a',
            },
            {
                depth: 6,
                group: 'b',
            },
            {
                depth: 20,
                group: 'c',
            },
        ]
        let rowsNew = [
            {
                'group': 'a',
                'depthStart': 0,
                'depthEnd': 3,
                'rows': [
                    {
                        'depth': 0,
                        'group': 'a',
                        'depthStart': 0,
                        'depthEnd': 3
                    }
                ]
            },
            {
                'group': 'b',
                'depthStart': 3,
                'depthEnd': 13,
                'rows': [
                    {
                        'depth': 6,
                        'group': 'b',
                        'depthStart': 3,
                        'depthEnd': 13
                    }
                ]
            },
            {
                'group': 'c',
                'depthStart': 13,
                'depthEnd': 20,
                'rows': [
                    {
                        'depth': 20,
                        'group': 'c',
                        'depthStart': 13,
                        'depthEnd': 20
                    }
                ]
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndByGroup(${JSON.stringify(rows)})`, function() {
            let r = calcDepthStartEndByGroup(rows)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f1()

    let f2 = () => {
        let rows = [
            {
                dc: 0,
                g: 'a',
            },
            {
                dc: 6,
                g: 'b',
            },
            {
                dc: 20,
                g: 'c',
            },
        ]
        let rowsNew = [
            {
                'g': 'a',
                'ds': 0,
                'de': 3,
                'rows': [
                    {
                        'dc': 0,
                        'g': 'a',
                        'ds': 0,
                        'de': 3
                    }
                ]
            },
            {
                'g': 'b',
                'ds': 3,
                'de': 13,
                'rows': [
                    {
                        'dc': 6,
                        'g': 'b',
                        'ds': 3,
                        'de': 13
                    }
                ]
            },
            {
                'g': 'c',
                'ds': 13,
                'de': 20,
                'rows': [
                    {
                        'dc': 20,
                        'g': 'c',
                        'ds': 13,
                        'de': 20
                    }
                ]
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndByGroup(${JSON.stringify(rows)}, ${JSON.stringify({ keyDepth: 'dc', keyGroup: 'g', keyDepthStart: 'ds', keyDepthEnd: 'de' })})`, function() {
            let r = calcDepthStartEndByGroup(rows, { keyDepth: 'dc', keyGroup: 'g', keyDepthStart: 'ds', keyDepthEnd: 'de' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f2()

    let f3 = () => {
        let rows = [
            {
                depth: 0,
                group: 'a',
            },
            {
                depth: 2,
                group: 'a',
            },
            {
                depth: 4,
                group: 'b',
            },
            {
                depth: 6,
                group: 'b',
            },
            {
                depth: 8,
                group: 'b',
            },
            {
                depth: 10,
                group: 'c',
            },
            {
                depth: 12,
                group: 'b',
            },
            {
                depth: 14,
                group: 'c',
            },
            {
                depth: 16,
                group: 'b',
            },
            {
                depth: 18,
                group: 'b',
            },
            {
                depth: 30,
                group: 'd',
            },
        ]
        let rowsNew = [
            {
                'group': 'a',
                'depthStart': 0,
                'depthEnd': 3,
                'rows': [
                    {
                        'depth': 0,
                        'group': 'a',
                        'depthStart': 0,
                        'depthEnd': 1
                    },
                    {
                        'depth': 2,
                        'group': 'a',
                        'depthStart': 1,
                        'depthEnd': 3
                    }
                ]
            },
            {
                'group': 'b',
                'depthStart': 3,
                'depthEnd': 9,
                'rows': [
                    {
                        'depth': 4,
                        'group': 'b',
                        'depthStart': 3,
                        'depthEnd': 5
                    },
                    {
                        'depth': 6,
                        'group': 'b',
                        'depthStart': 5,
                        'depthEnd': 7
                    },
                    {
                        'depth': 8,
                        'group': 'b',
                        'depthStart': 7,
                        'depthEnd': 9
                    }
                ]
            },
            {
                'group': 'c',
                'depthStart': 9,
                'depthEnd': 11,
                'rows': [
                    {
                        'depth': 10,
                        'group': 'c',
                        'depthStart': 9,
                        'depthEnd': 11
                    }
                ]
            },
            {
                'group': 'b',
                'depthStart': 11,
                'depthEnd': 13,
                'rows': [
                    {
                        'depth': 12,
                        'group': 'b',
                        'depthStart': 11,
                        'depthEnd': 13
                    }
                ]
            },
            {
                'group': 'c',
                'depthStart': 13,
                'depthEnd': 15,
                'rows': [
                    {
                        'depth': 14,
                        'group': 'c',
                        'depthStart': 13,
                        'depthEnd': 15
                    }
                ]
            },
            {
                'group': 'b',
                'depthStart': 15,
                'depthEnd': 24,
                'rows': [
                    {
                        'depth': 16,
                        'group': 'b',
                        'depthStart': 15,
                        'depthEnd': 17
                    },
                    {
                        'depth': 18,
                        'group': 'b',
                        'depthStart': 17,
                        'depthEnd': 24
                    }
                ]
            },
            {
                'group': 'd',
                'depthStart': 24,
                'depthEnd': 30,
                'rows': [
                    {
                        'depth': 30,
                        'group': 'd',
                        'depthStart': 24,
                        'depthEnd': 30
                    }
                ]
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcDepthStartEndByGroup(${JSON.stringify(rows)})`, function() {
            let r = calcDepthStartEndByGroup(rows)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f3()

})
