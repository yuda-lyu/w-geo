import fs from 'fs'
import _ from 'lodash'
import w from 'wsemi'
import groupByDepthStartEnd from './src/groupByDepthStartEnd.mjs'


let rows
let ranges
let rs

rows = [
    {
        depth: 0,
    },
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
ranges = [
    {
        depthStart: 0,
        depthEnd: 1,
    },
    {
        depthStart: 1,
        depthEnd: 4,
    },
]
rs = groupByDepthStartEnd(rows, ranges)
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "depthStart": 0,
//     "depthEnd": 1,
//     "rows": [
//       {
//         "depth": 0
//       },
//       {
//         "depth": 1
//       }
//     ]
//   },
//   {
//     "depthStart": 1,
//     "depthEnd": 4,
//     "rows": [
//       {
//         "depth": 3
//       }
//     ]
//   }
// ]

rows = [
    {
        depth: 0,
    },
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
ranges = [
    {
        depthStart: 0,
        depthEnd: 3,
    },
    {
        depthStart: 1,
        depthEnd: 5,
    },
]
try {
    rs = groupByDepthStartEnd(rows, ranges)
}
catch (err) {
    rs = err.toString()
}
console.log(rs)
// => Error: 第 1 樣本結束深度depthEnd[3]大於第 2 個樣本起始深度depthStart[1]

rows = [
    {
        depth: 0,
    },
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
ranges = [
    {
        depthStart: 0,
        depthEnd: 2,
    },
    {
        depthStart: 5,
        depthEnd: 10,
    },
]
rs = groupByDepthStartEnd(rows, ranges)
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "depthStart": 0,
//     "depthEnd": 2,
//     "rows": [
//       {
//         "depth": 0
//       },
//       {
//         "depth": 1
//       }
//     ]
//   },
//   {
//     "depthStart": 5,
//     "depthEnd": 10,
//     "rows": [
//       {
//         "depth": 10
//       }
//     ]
//   }
// ]

rows = [
    {
        depth: 0,
    },
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
ranges = [
    {
        depthStart: 0,
        depthEnd: 10,
    },
]
rs = groupByDepthStartEnd(rows, ranges)
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "depthStart": 0,
//     "depthEnd": 10,
//     "rows": [
//       {
//         "depth": 0
//       },
//       {
//         "depth": 1
//       },
//       {
//         "depth": 3
//       },
//       {
//         "depth": 10
//       }
//     ]
//   }
// ]

rows = [
    {
        dc: 0,
    },
    {
        dc: 1,
    },
    {
        dc: 3,
    },
    {
        dc: 10,
    },
]
ranges = [
    {
        ds: 0,
        de: 1,
    },
    {
        ds: 1,
        de: 4,
    },
]
rs = groupByDepthStartEnd(rows, ranges, { keyDepth: 'dc', keyDepthStart: 'ds', keyDepthEnd: 'de' })
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "ds": 0,
//     "de": 1,
//     "rows": [
//       {
//         "dc": 0
//       },
//       {
//         "dc": 1
//       }
//     ]
//   },
//   {
//     "ds": 1,
//     "de": 4,
//     "rows": [
//       {
//         "dc": 3
//       }
//     ]
//   }
// ]

//node --experimental-modules --es-module-specifier-resolution=node g6-groupByDepthStartEnd.mjs
