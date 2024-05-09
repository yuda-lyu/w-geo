import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import buildInterpFun from './src/buildInterpFun.mjs'


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
let y1 = fun1(x1)
console.log(y1)
// => 1

let xs1 = [0.5, 1, 1.9, 2, 2.1]
let ys1 = fun1(xs1)
console.log(ys1)
// => [ 1, 2, 2, 2, 3 ]

let fun2 = buildInterpFun(rows, 'depth', 'value', { mode: 'linear' })

let xs2 = [0.5, 1, 1.9, 2, 2.1]
let ys2 = fun2(xs2)
console.log(ys2)
// => [ 1.5, 2, 2.45, 2.5, 2.55 ]

//node --experimental-modules g_5_4-buildInterpFun.mjs
