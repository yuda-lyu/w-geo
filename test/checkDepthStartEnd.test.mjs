import assert from 'assert'
import checkDepthStartEnd from '../src/checkDepthStartEnd.mjs'


describe(`checkDepthStartEnd`, function() {

    let rows1 = [
        {
            depthStart: 0,
            depthEnd: 5,
        },
        {
            depthStart: 5,
            depthEnd: 10,
        },
        {
            depthStart: 10,
            depthEnd: 20,
        },
    ]
    // let errs1 = checkDepthStartEnd(rows1)
    let errs1 = []
    it(`should return ${JSON.stringify(errs1)} when checkDepthStartEnd(${JSON.stringify(rows1)})`, function() {
        let r = checkDepthStartEnd(rows1)
        let rr = errs1
        assert.strict.deepStrictEqual(r, rr)
    })

    let rows2 = [
        {
            depthStart: 0,
            depthEnd: 5,
        },
        {
            depthStart: 10,
            depthEnd: 20,
        },
    ]
    // let errs2 = checkDepthStartEnd(rows)
    let errs2 = ['第 1 樣本起訖深度depthEnd[5]不等於第 2 個樣本起始深度depthStart[10]']
    it(`should return ${JSON.stringify(errs2)} when checkDepthStartEnd(${JSON.stringify(rows2)})`, function() {
        let r = checkDepthStartEnd(rows2)
        let rr = errs2
        assert.strict.deepStrictEqual(r, rr)
    })

    let rows3 = [
        {
            depthStart: '0',
            depthEnd: '5',
        },
        {
            depthStart: '5',
            depthEnd: '10',
        },
    ]
    // let errs3 = checkDepthStartEnd(rows)
    let errs3 = []
    it(`should return ${JSON.stringify(errs3)} when checkDepthStartEnd(${JSON.stringify(rows3)})`, function() {
        let r = checkDepthStartEnd(rows3)
        let rr = errs3
        assert.strict.deepStrictEqual(r, rr)
    })

    let rows4 = [
        {
            depthStart: '0',
            depthEnd: 'abc',
        },
        {
            depthStart: 'abc',
            depthEnd: '10',
        },
    ]
    // let errs4 = checkDepthStartEnd(rows4)
    let errs4 = [
        '第 0 樣本起訖深度非有效數字: depthStart[0], depthEnd[abc]',
        '第 1 樣本起訖深度非有效數字: depthStart[abc], depthEnd[10]'
    ]
    it(`should return ${JSON.stringify(errs4)} when checkDepthStartEnd(${JSON.stringify(rows4)})`, function() {
        let r = checkDepthStartEnd(rows4)
        let rr = errs4
        assert.strict.deepStrictEqual(r, rr)
    })

})