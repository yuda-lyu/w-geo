import assert from 'assert'
import sepDepthStartEndByDepth from '../src/sepDepthStartEndByDepth.mjs'


describe(`sepDepthStartEndByDepth`, function() {

    let f1 = () => {
        let rows = [
            {
                depthStart: 0,
                depthEnd: 5,
                data: 'abc',
            },
            {
                depthStart: 5,
                depthEnd: 10,
                data: 'def',
            },
        ]
        let points = [{ depth: 2.5 }]
        let rowsNew = [
            { depthStart: 0, depthEnd: 2.5, data: 'abc' },
            { depthStart: 2.5, depthEnd: 5, data: 'abc' },
            { depthStart: 5, depthEnd: 10, data: 'def' }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when sepDepthStartEndByDepth(${JSON.stringify(rows)}, ${JSON.stringify(points)})`, function() {
            let r = sepDepthStartEndByDepth(rows, points)
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
                data: 'abc',
            },
            {
                depthStart: 5,
                depthEnd: 10,
                data: 'def',
            },
        ]
        let points = [{ depth: 0 }]
        let rowsNew = [
            { depthStart: 0, depthEnd: 5, data: 'abc' },
            { depthStart: 5, depthEnd: 10, data: 'def' }
        ]
        it(`should return ${JSON.stringify(rowsNew)} when sepDepthStartEndByDepth(${JSON.stringify(rows)}, ${JSON.stringify(points)})`, function() {
            let r = sepDepthStartEndByDepth(rows, points)
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
                data: 'abc',
            },
            {
                depthStart: 5,
                depthEnd: 10,
                data: 'def',
            },
        ]
        let points = [{ depth: 5 }]
        let rowsNew = [
            { depthStart: 0, depthEnd: 5, data: 'abc' },
            { depthStart: 5, depthEnd: 10, data: 'def' }
        ]
        it(`should return ${JSON.stringify(rowsNew)} when sepDepthStartEndByDepth(${JSON.stringify(rows)}, ${JSON.stringify(points)})`, function() {
            let r = sepDepthStartEndByDepth(rows, points)
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
                data: 'abc',
            },
            {
                depthStart: 5,
                depthEnd: 10,
                data: 'def',
            },
        ]
        let points = [{ depth: -1 }]
        let rowsNew = [
            { depthStart: 0, depthEnd: 5, data: 'abc' },
            { depthStart: 5, depthEnd: 10, data: 'def' }
        ]
        it(`should return ${JSON.stringify(rowsNew)} when sepDepthStartEndByDepth(${JSON.stringify(rows)}, ${JSON.stringify(points)})`, function() {
            let r = sepDepthStartEndByDepth(rows, points)
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
                data: 'abc',
            },
            {
                depthStart: 5,
                depthEnd: 10,
                data: 'def',
            },
        ]
        let points = [{ depth: 11 }]
        let rowsNew = [
            { depthStart: 0, depthEnd: 5, data: 'abc' },
            { depthStart: 5, depthEnd: 10, data: 'def' }
        ]
        it(`should return ${JSON.stringify(rowsNew)} when sepDepthStartEndByDepth(${JSON.stringify(rows)}, ${JSON.stringify(points)})`, function() {
            let r = sepDepthStartEndByDepth(rows, points)
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f5()

    let f6 = () => {
        let rows = [
            {
                top_depth: 0,
                bottom_depth: 5,
                data: 'abc',
            },
            {
                top_depth: 5,
                bottom_depth: 10,
                data: 'def',
            },
        ]
        let points = [{ center_depth: 5.5 }]
        let rowsNew = [
            { top_depth: 0, bottom_depth: 5, data: 'abc' },
            { top_depth: 5, bottom_depth: 5.5, data: 'def' },
            { top_depth: 5.5, bottom_depth: 10, data: 'def' }
        ]
        it(`should return ${JSON.stringify(rowsNew)} when sepDepthStartEndByDepth(${JSON.stringify(rows)}, ${JSON.stringify(points)}, { keyDepthStart: 'top_depth', keyDepthEnd: 'bottom_depth', keyDepth: 'center_depth' })`, function() {
            let r = sepDepthStartEndByDepth(rows, points, { keyDepthStart: 'top_depth', keyDepthEnd: 'bottom_depth', keyDepth: 'center_depth' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f6()

})
