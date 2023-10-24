import checkDepth from './src/checkDepth.mjs'


let rows
let errs

rows = [
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
errs = checkDepth(rows)
console.log(errs)
// => []

rows = [
    {
        depth: 0,
    },
    {
        depth: 10,
    },
]
errs = checkDepth(rows)
console.log(errs)
// => []

rows = [
    {
        depth: '0',
    },
    {
        depth: '5',
    },
]
errs = checkDepth(rows)
console.log(errs)
// => []

rows = [
    {
        depth: '0',
    },
    {
        depth: 'abc',
    },
]
errs = checkDepth(rows)
console.log(errs)
// => [ '第 1 樣本中點深度depth[abc]非有效數字' ]

rows = [
    {
        center_depth: 0,
    },
    {
        center_depth: 5,
    },
]
errs = checkDepth(rows, { keyDepth: 'center_depth' })
console.log(errs)
// => []

//node --experimental-modules --es-module-specifier-resolution=node g_0_1-checkDepth.mjs

