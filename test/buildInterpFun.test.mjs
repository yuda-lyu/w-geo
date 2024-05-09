import assert from 'assert'
import _ from 'lodash-es'
import w from 'wsemi'
import buildInterpFun from '../src/buildInterpFun.mjs'


describe(`buildInterpFun`, function() {

    let rows = [
        {
            depth: 0,
            value: 1,
        },
        {
            depth: 1,
            value: 2,
        },
        {
            depth: 3,
            value: 3,
        },
        {
            depth: 10,
            value: 4,
        },
    ]

    let fun1 = buildInterpFun(rows, 'depth', 'value')

    let x1 = 0.5
    // let y1 = fun1(x1)
    // console.log(y1)
    let y1 = 1

    let xs1 = [0.5, 1, 1.9, 2, 2.1]
    // let ys1 = fun1(xs1)
    // console.log(ys1)
    let ys1 = [1, 2, 2, 2, 3]

    let fun2 = buildInterpFun(rows, 'depth', 'value', { mode: 'linear' })

    let xs2 = [0.5, 1, 1.9, 2, 2.1]
    // let ys2 = fun2(xs2)
    // console.log(ys2)
    let ys2 = [1.5, 2, 2.45, 2.5, 2.55]

    it(`should return ${y1} when fun1(${x1}) by buildInterpFun(rows, 'depth', 'value')`, function() {
        let r = fun1(x1)
        let rr = y1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${ys1} when fun1(${xs1}) by buildInterpFun(rows, 'depth', 'value')`, function() {
        let r = fun1(xs1)
        let rr = ys1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${ys2} when fun1(${xs2}) by buildInterpFun(rows, 'depth', 'value', { mode: 'linear' })`, function() {
        let r = fun2(xs2)
        let rr = ys2
        assert.strict.deepStrictEqual(r, rr)
    })

})
