import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import calcDepthStartEndByConnect from './src/calcDepthStartEndByConnect.mjs'


let rows
let rs

rows = [
    {
        depthStart: 0,
        depthEnd: 4,
    },
    {
        depthStart: 6,
        depthEnd: 10,
    },
    {
        depthStart: 11,
        depthEnd: 15,
    },
]
rs = calcDepthStartEndByConnect(rows)
console.log(rs)
// => [
//   { depthStart: 0, depthEnd: 5 },
//   { depthStart: 5, depthEnd: 10.5 },
//   { depthStart: 10.5, depthEnd: 15 }
// ]

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
    },
    {
        depthStart: 4,
        depthEnd: 15,
    },
]
try {
    rs = calcDepthStartEndByConnect(rows)
}
catch (err) {
    rs = err.toString()
}
console.log(rs)
// => Error: 第 0 樣本之結束深度depthEnd[5]大於第 1 樣本之起點深度depthStart[4]

rows = [
    {
        depthStart: '0',
        depthEnd: '4',
    },
    {
        depthStart: '6',
        depthEnd: '10',
    },
]
rs = calcDepthStartEndByConnect(rows)
console.log(rs)
// => [ { depthStart: '0', depthEnd: 5 }, { depthStart: 5, depthEnd: '10' } ]

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
try {
    rs = calcDepthStartEndByConnect(rows)
}
catch (err) {
    rs = err.toString()
}
console.log(rs)
// => Error: 第 0 樣本結束深度depthEnd[abc]非有效數字, 第 1 樣本起始深度depthStart[abc]非有效數字

rows = [
    {
        top_depth: 0,
        bottom_depth: 4,
    },
    {
        top_depth: 6,
        bottom_depth: 10,
    },
]
rs = calcDepthStartEndByConnect(rows, { keyDepthStart: 'top_depth', keyDepthEnd: 'bottom_depth' })
console.log(rs)
// => [
//   { top_depth: 0, bottom_depth: 5 },
//   { top_depth: 5, bottom_depth: 10 }
// ]

rows = [
    {
        depthStart: 0,
        depthEnd: 4,
    },
    {
        depthStart: 6,
        depthEnd: 10,
    },
    {
        depthStart: 11,
        depthEnd: 15,
    },
]
rs = calcDepthStartEndByConnect(rows, { depthEndMax: 20 })
console.log(rs)
// => [
//   { depthStart: 0, depthEnd: 5 },
//   { depthStart: 5, depthEnd: 10.5 },
//   { depthStart: 10.5, depthEnd: 20 }
// ]

//node g_4_4-calcDepthStartEndByConnect.mjs

