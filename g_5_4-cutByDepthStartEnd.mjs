import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import cutByDepthStartEnd from './src/cutByDepthStartEnd.mjs'


let rowsIn = [
    {
        depth: 1,
    },
    {
        depth: 3,
    },
    {
        depth: 10,
    },
]

let rowsOut = cutByDepthStartEnd(rowsIn, 0, 9)
console.log(rowsOut)
// => [ { depth: 1 }, { depth: 3 } ]

//node --experimental-modules g_5_4-cutByDepthStartEnd.mjs
