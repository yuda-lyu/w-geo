import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import calcDepthStartEndByDepth from './src/calcDepthStartEndByDepth.mjs'


let rows
let rs

rows = [
    {
        depth: 0,
    },
    {
        depth: 6,
    },
    {
        depth: 20,
    },
]
rs = calcDepthStartEndByDepth(rows)
console.log(rs)
// => [
//   { depth: 0, depthStart: 0, depthEnd: 3 },
//   { depth: 6, depthStart: 3, depthEnd: 13 },
//   { depth: 20, depthStart: 13, depthEnd: 20 }
// ]

rows = [
    {
        depth: 4,
    },
    {
        depth: 6,
    },
    {
        depth: 20,
    },
]
rs = calcDepthStartEndByDepth(rows)
console.log(rs)
// => [
//   { depth: 4, depthStart: 0, depthEnd: 5 },
//   { depth: 6, depthStart: 5, depthEnd: 13 },
//   { depth: 20, depthStart: 13, depthEnd: 20 }
// ]

rows = [
    {
        depth: 4,
    },
    {
        depth: 6,
    },
    {
        depth: 20,
    },
]
rs = calcDepthStartEndByDepth(rows, { depthEndMax: 25 })
console.log(rs)
// => [
//   { depth: 4, depthStart: 0, depthEnd: 5 },
//   { depth: 6, depthStart: 5, depthEnd: 13 },
//   { depth: 20, depthStart: 13, depthEnd: 25 }
// ]

rows = [
    {
        depth: 4,
    },
    {
        depth: 6,
    },
    {
        depth: 20,
    },
]
rs = calcDepthStartEndByDepth(rows, { depthEndMax: 15 })
console.log(rs)
// => [
//   { depth: 4, depthStart: 0, depthEnd: 5 },
//   { depth: 6, depthStart: 5, depthEnd: 13 },
//   { depth: 20, depthStart: 13, depthEnd: 20 }
// ]

rows = [
    {
        dc: 4,
    },
    {
        dc: 6,
    },
    {
        dc: 20,
    },
]
rs = calcDepthStartEndByDepth(rows, { keyDepth: 'dc', keyDepthStart: 'ds', keyDepthEnd: 'de' })
console.log(rs)
// => [
//   { dc: 4, ds: 0, de: 5 },
//   { dc: 6, ds: 5, de: 13 },
//   { dc: 20, ds: 13, de: 20 }
// ]


//node g_4_1-calcDepthStartEndByDepth.mjs
