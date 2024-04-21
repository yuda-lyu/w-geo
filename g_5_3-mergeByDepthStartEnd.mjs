import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import mergeByDepthStartEnd from './src/mergeByDepthStartEnd.mjs'


let rows
let rs

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        value: 'a',
        ext: 12.3,
    },
    {
        depthStart: 5,
        depthEnd: 7,
        value: 'b',
        ext: 12.4,
    },
    {
        depthStart: 7,
        depthEnd: 11,
        value: 'b',
        ext: 2.5,
    },
    {
        depthStart: 11,
        depthEnd: 15,
        value: 'a',
        ext: 2.3,
    },
]
rs = mergeByDepthStartEnd(rows)
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "depthStart": 0,
//     "depthEnd": 5,
//     "value": "a",
//     "ext": 12.3
//   },
//   {
//     "depthStart": 5,
//     "depthEnd": 11,
//     "value": "b",
//     "ext": 2.5
//   },
//   {
//     "depthStart": 11,
//     "depthEnd": 15,
//     "value": "a",
//     "ext": 2.3
//   }
// ]

rows = [
    {
        ds: 0,
        de: 5,
        value: 'a',
        ext: 12.3,
    },
    {
        ds: 5,
        de: 7,
        value: 'b',
        ext: 12.4,
    },
    {
        ds: 7,
        de: 11,
        value: 'b',
        ext: 2.5,
    },
    {
        ds: 11,
        de: 15,
        value: 'a',
        ext: 2.3,
    },
]
rs = mergeByDepthStartEnd(rows, { keyDepthStart: 'ds', keyDepthEnd: 'de' })
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "ds": 0,
//     "de": 5,
//     "value": "a",
//     "ext": 12.3
//   },
//   {
//     "ds": 5,
//     "de": 11,
//     "value": "b",
//     "ext": 2.5
//   },
//   {
//     "ds": 11,
//     "de": 15,
//     "value": "a",
//     "ext": 2.3
//   }
// ]

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        data: 'a',
        ext: 12.3,
    },
    {
        depthStart: 5,
        depthEnd: 7,
        data: 'b',
        ext: 12.4,
    },
    {
        depthStart: 7,
        depthEnd: 11,
        data: 'b',
        ext: 2.5,
    },
    {
        depthStart: 11,
        depthEnd: 15,
        data: 'a',
        ext: 2.3,
    },
]
rs = mergeByDepthStartEnd(rows, { keyValue: 'data' })
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "depthStart": 0,
//     "depthEnd": 5,
//     "data": "a",
//     "ext": 12.3
//   },
//   {
//     "depthStart": 5,
//     "depthEnd": 11,
//     "data": "b",
//     "ext": 2.5
//   },
//   {
//     "depthStart": 11,
//     "depthEnd": 15,
//     "data": "a",
//     "ext": 2.3
//   }
// ]

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        value: 'a',
        ext: 12.3,
    },
    {
        depthStart: 5,
        depthEnd: 7,
        value: 'b',
        ext: 12.4,
    },
    {
        depthStart: 7,
        depthEnd: 11,
        value: 'b',
        ext: 2.5,
    },
    {
        depthStart: 11,
        depthEnd: 15,
        value: 'b',
        ext: 2.3,
    },
    {
        depthStart: 15,
        depthEnd: 18,
        value: 'a',
        ext: 7.9,
    },
]
rs = mergeByDepthStartEnd(rows, {
    funMerge: (v0, v1) => {
        return {
            // depthStart: null,
            // depthEnd: null,
            value: v1.value,
            ext: v1.ext,
            _v0: v0,
            _v1: v1,
        }
    }
})
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "depthStart": 0,
//     "depthEnd": 5,
//     "value": "a",
//     "ext": 12.3
//   },
//   {
//     "value": "b",
//     "ext": 2.3,
//     "_v0": {
//       "value": "b",
//       "ext": 2.5,
//       "_v0": {
//         "depthStart": 5,
//         "depthEnd": 7,
//         "value": "b",
//         "ext": 12.4
//       },
//       "_v1": {
//         "depthStart": 7,
//         "depthEnd": 11,
//         "value": "b",
//         "ext": 2.5
//       },
//       "depthStart": 5,
//       "depthEnd": 11
//     },
//     "_v1": {
//       "depthStart": 11,
//       "depthEnd": 15,
//       "value": "b",
//       "ext": 2.3
//     },
//     "depthStart": 5,
//     "depthEnd": 15
//   },
//   {
//     "depthStart": 15,
//     "depthEnd": 18,
//     "value": "a",
//     "ext": 7.9
//   }
// ]

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        value: 'a',
        ext: 12.3,
    },
    {
        depthStart: 5,
        depthEnd: 7,
        value: 'b',
        ext: 12.4,
    },
    {
        depthStart: 7,
        depthEnd: 11,
        value: 'b',
        ext: 2.5,
    },
    {
        depthStart: 11,
        depthEnd: 15,
        value: 'b',
        ext: 2.3,
    },
    {
        depthStart: 15,
        depthEnd: 18,
        value: 'a',
        ext: 7.9,
    },
]
rs = mergeByDepthStartEnd(rows, { typeMerge: 'up' })
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "depthStart": 0,
//     "depthEnd": 5,
//     "value": "a",
//     "ext": 12.3
//   },
//   {
//     "depthStart": 5,
//     "depthEnd": 15,
//     "value": "b",
//     "ext": 12.4
//   },
//   {
//     "depthStart": 15,
//     "depthEnd": 18,
//     "value": "a",
//     "ext": 7.9
//   }
// ]

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        value: 'a',
        ext: 12.3,
    },
    {
        depthStart: 5,
        depthEnd: 7,
        value: 'b',
        ext: 12.4,
    },
    {
        depthStart: 7,
        depthEnd: 11,
        value: 'b',
        ext: 2.5,
    },
    {
        depthStart: 11,
        depthEnd: 15,
        value: 'a',
        ext: 2.3,
    },
]
rs = mergeByDepthStartEnd(rows, { saveFromInds: true, keyInd: '_ind', keyFromInds: '_fromInds' })
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "depthStart": 0,
//     "depthEnd": 5,
//     "value": "a",
//     "ext": 12.3,
//     "_ind": 0
//   },
//   {
//     "depthStart": 5,
//     "depthEnd": 11,
//     "value": "b",
//     "ext": 2.5,
//     "_ind": 2,
//     "_fromInds": [
//       1,
//       2
//     ]
//   },
//   {
//     "depthStart": 11,
//     "depthEnd": 15,
//     "value": "a",
//     "ext": 2.3,
//     "_ind": 3
//   }
// ]

rows = [
    {
        depthStart: 0,
        depthEnd: 5,
        value: 'a',
        ext: 12.3,
    },
    {
        depthStart: 5,
        depthEnd: 7,
        value: 'b',
        ext: 12.4,
    },
    {
        depthStart: 7,
        depthEnd: 11,
        value: 'b',
        ext: 2.5,
    },
    {
        depthStart: 11,
        depthEnd: 15,
        value: 'a',
        ext: 2.3,
    },
]
rs = mergeByDepthStartEnd(rows, { typeDetect: 'iterate' })
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "depthStart": 0,
//     "depthEnd": 5,
//     "value": "a",
//     "ext": 12.3
//   },
//   {
//     "depthStart": 5,
//     "depthEnd": 11,
//     "value": "b",
//     "ext": 2.5
//   },
//   {
//     "depthStart": 11,
//     "depthEnd": 15,
//     "value": "a",
//     "ext": 2.3
//   }
// ]


//node --experimental-modules g_5_3-mergeByDepthStartEnd.mjs
