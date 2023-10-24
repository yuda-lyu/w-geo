import sepDepthStartEndByDepth from './src/sepDepthStartEndByDepth.mjs'


let rows
let points
let r

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        data: 'abc',
    },
    {
        depthStart: 5,
        depthEnd: 10,
        data: 'def',
    },
]
points = [{ depth: 2.5 }]
r = sepDepthStartEndByDepth(rows, points)
console.log(r)
// => [
//  { depthStart: 0, depthEnd: 2.5, data: 'abc' },
//  { depthStart: 2.5, depthEnd: 5, data: 'abc' },
//  { depthStart: 5, depthEnd: 10, data: 'def' }
//]

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        data: 'abc',
    },
    {
        depthStart: 5,
        depthEnd: 10,
        data: 'def',
    },
]
points = [{ depth: 0 }]
r = sepDepthStartEndByDepth(rows, points)
console.log(r)
// => [
//  { depthStart: 0, depthEnd: 5, data: 'abc' },
//  { depthStart: 5, depthEnd: 10, data: 'def' }
//]

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        data: 'abc',
    },
    {
        depthStart: 5,
        depthEnd: 10,
        data: 'def',
    },
]
points = [{ depth: 5 }]
r = sepDepthStartEndByDepth(rows, points)
console.log(r)
// => [
//  { depthStart: 0, depthEnd: 5, data: 'abc' },
//  { depthStart: 5, depthEnd: 10, data: 'def' }
//]

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        data: 'abc',
    },
    {
        depthStart: 5,
        depthEnd: 10,
        data: 'def',
    },
]
points = [{ depth: -1 }]
r = sepDepthStartEndByDepth(rows, points)
console.log(r)
// => [
//  { depthStart: 0, depthEnd: 5, data: 'abc' },
//  { depthStart: 5, depthEnd: 10, data: 'def' }
//]

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        data: 'abc',
    },
    {
        depthStart: 5,
        depthEnd: 10,
        data: 'def',
    },
]
points = [{ depth: 11 }]
r = sepDepthStartEndByDepth(rows, points)
console.log(r)
// => [
//  { depthStart: 0, depthEnd: 5, data: 'abc' },
//  { depthStart: 5, depthEnd: 10, data: 'def' }
//]

rows = [
    {
        top_depth: 0,
        bottom_depth: 5,
        data: 'abc',
    },
    {
        top_depth: 5,
        bottom_depth: 10,
        data: 'def',
    },
]
points = [{ center_depth: 5.5 }]
r = sepDepthStartEndByDepth(rows, points, { keyDepthStart: 'top_depth', keyDepthEnd: 'bottom_depth', keyDepth: 'center_depth' })
console.log(r)
// => [
//  { top_depth: 0, bottom_depth: 5, data: 'abc' },
//  { top_depth: 5, bottom_depth: 5.5, data: 'def' },
//  { top_depth: 5.5, bottom_depth: 10, data: 'def' }
//]

//node --experimental-modules --es-module-specifier-resolution=node g_5_2-sepDepthStartEndByDepth.mjs

