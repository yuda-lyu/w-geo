import trimParams from './src/trimParams.mjs'


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
let rowsOut = trimParams(rowsIn)
console.log(rowsOut)
// => [
//   { i1: 'abc', i2: 'def', i3: 'ghi', i4: 'jkl' },
//   { i1: '12.3', i2: '45.6', i3: '78.9', i4: '0.01' }
// ]

//node --experimental-modules g_1_4-trimParams.mjs
