import fs from 'fs'
import _ from 'lodash'
import w from 'wsemi'
import calcDepthFromStartEnd from './src/calcDepthFromStartEnd.mjs'


let rows
let rs

rows = [
    {
        depthStart: 0,
        depthEnd: 3,
    },
    {
        depthStart: 3,
        depthEnd: 13,
    },
    {
        depthStart: 13,
        depthEnd: 20,
    },
]
rs = calcDepthFromStartEnd(rows)
console.log(rs)
// => [
//   { depthStart: 0, depthEnd: 3, depth: 1.5 },
//   { depthStart: 3, depthEnd: 13, depth: 8 },
//   { depthStart: 13, depthEnd: 20, depth: 16.5 }
// ]

rows = [
    {
        depthStart: 0,
        depthEnd: 3,
    },
    {
        depthStart: 13,
        depthEnd: 20,
    },
]
rs = calcDepthFromStartEnd(rows)
console.log(rs)
// => [
//   { depthStart: 0, depthEnd: 3, depth: 1.5 },
//   { depthStart: 13, depthEnd: 20, depth: 16.5 }
// ]

rows = [
    {
        ds: 0,
        de: 3,
    },
    {
        ds: 3,
        de: 13,
    },
    {
        ds: 13,
        de: 20,
    },
]
rs = calcDepthFromStartEnd(rows, { keyDepthStart: 'ds', keyDepthEnd: 'de', keyDepth: 'dc' })
console.log(rs)
// => [
//   { ds: 0, de: 3, dc: 1.5 },
//   { ds: 3, de: 13, dc: 8 },
//   { ds: 13, de: 20, dc: 16.5 }
// ]


//node --experimental-modules --es-module-specifier-resolution=node g4b-calcDepthFromStartEnd.mjs
