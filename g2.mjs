import checkDepthStartEnd from './src/checkDepthStartEnd.mjs'


let rows
let errs

rows = [
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
errs = checkDepthStartEnd(rows)
console.log(errs)
// => []

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
    },
    {
        depthStart: 10,
        depthEnd: 20,
    },
]
errs = checkDepthStartEnd(rows)
console.log(errs)
// => [ '第 1 樣本結束深度depthEnd[5]不等於第 2 個樣本起始深度depthStart[10]' ]

rows = [
    {
        depthStart: '0',
        depthEnd: '5',
    },
    {
        depthStart: '5',
        depthEnd: '10',
    },
]
errs = checkDepthStartEnd(rows)
console.log(errs)
// => []

rows = [
    {
        depthStart: '0',
        depthEnd: 'abc',
    },
    {
        depthStart: 'abc',
        depthEnd: '10',
    },
]
errs = checkDepthStartEnd(rows)
console.log(errs)
// => [
//     '第 0 樣本起始深度非有效數字: depthStart[0], depthEnd[abc]',
//     '第 1 樣本起始深度非有效數字: depthStart[abc], depthEnd[10]'
// ]

rows = [
    {
        top_depth: 0,
        bottom_depth: 5,
    },
    {
        top_depth: 5,
        bottom_depth: 10,
    },
]
errs = checkDepthStartEnd(rows, { keyDepthStart: 'top_depth', keyDepthEnd: 'bottom_depth' })
console.log(errs)
// => []

