import assert from 'assert'
import checkDepth from '../src/checkDepth.mjs'


describe(`checkDepth`, function() {

    let rows1 = [
        {
            depth: 0,
        },
        {
            depth: 5,
        },
        {
            depth: 10,
        },
    ]
    // let errs1 = checkDepth(rows1)
    let errs1 = []
    it(`should return ${JSON.stringify(errs1)} when checkDepth(${JSON.stringify(rows1)})`, function() {
        let r = checkDepth(rows1)
        let rr = errs1
        assert.strict.deepStrictEqual(r, rr)
    })

    let rows2 = [
        {
            depth: 0,
        },
        {
            depth: 10,
        },
    ]
    // let errs2 = checkDepth(rows2)
    let errs2 = []
    it(`should return ${JSON.stringify(errs2)} when checkDepth(${JSON.stringify(rows2)})`, function() {
        let r = checkDepth(rows2)
        let rr = errs2
        assert.strict.deepStrictEqual(r, rr)
    })

    let rows3 = [
        {
            depth: '0',
        },
        {
            depth: '5',
        },
    ]
    // let errs3 = checkDepth(rows3)
    let errs3 = []
    it(`should return ${JSON.stringify(errs3)} when checkDepth(${JSON.stringify(rows3)})`, function() {
        let r = checkDepth(rows3)
        let rr = errs3
        assert.strict.deepStrictEqual(r, rr)
    })

    let rows4 = [
        {
            depth: '0',
        },
        {
            depth: 'abc',
        },
    ]
    // let errs4 = checkDepth(rows4)
    let errs4 = ['第 1 樣本中點深度depth[abc]非有效數字']
    it(`should return ${JSON.stringify(errs4)} when checkDepth(${JSON.stringify(rows4)})`, function() {
        let r = checkDepth(rows4)
        let rr = errs4
        assert.strict.deepStrictEqual(r, rr)
    })

    let rows5 = [
        {
            center_depth: 0,
        },
        {
            center_depth: 5,
        },
    ]
    // let errs5 = checkDepth(rows5, { keyDepth: 'center_depth' })
    let errs5 = []
    it(`should return ${JSON.stringify(errs5)} when checkDepth(${JSON.stringify(rows5)}, { keyDepth: 'center_depth' })`, function() {
        let r = checkDepth(rows5, { keyDepth: 'center_depth' })
        let rr = errs5
        assert.strict.deepStrictEqual(r, rr)
    })

})
