import assert from 'assert'
import trimParams from '../src/trimParams.mjs'


describe(`trimParams`, function() {

    let rowsIn = [
        {
            i1: 'abc',
            i2: ' def',
            i3: 'ghi ',
            i4: ' jkl ',
        },
        {
            i1: '12.3',
            i2: ' 45.6',
            i3: '78.9 ',
            i4: ' 0.01 ',
        },
    ]
    // let rowsOut = trimParams(rowsIn)
    // console.log(rowsOut)
    let rowsOut = [
        { i1: 'abc', i2: 'def', i3: 'ghi', i4: 'jkl' },
        { i1: '12.3', i2: '45.6', i3: '78.9', i4: '0.01' }
    ]

    it(`should return ${JSON.stringify(rowsOut)} when trimParams(${JSON.stringify(rowsIn)})`, function() {
        let r = trimParams(rowsIn)
        let rr = rowsOut
        assert.strict.deepStrictEqual(r, rr)
    })

})
