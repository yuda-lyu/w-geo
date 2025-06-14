import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import calcDepthStartEndByGroup from './src/calcDepthStartEndByGroup.mjs'
// import t from './kpLtdt.json'
// console.log(_.keys(t))


// let rows = t['id-for-CPT-1']
// let rs = calcDepthStartEndByGroup(rows)
// rs = _.map(rs, (v) => {
//     return {
//         group: v.group,
//         depthStart: v.depthStart,
//         depthEnd: v.depthEnd,
//     }
// })
// console.log(rs)


let rows
let rs


rows = [
    {
        depth: 2,
        group: 'a',
    },
    {
        depth: 6,
        group: 'b',
    },
    {
        depth: 20,
        group: 'c',
    },
]
rs = calcDepthStartEndByGroup(rows)
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "group": "a",
//     "depthStart": 0,
//     "depthEnd": 3,
//     "rows": [
//       {
//         "depth": 0,
//         "group": "a",
//         "depthStart": 0,
//         "depthEnd": 3
//       }
//     ]
//   },
//   {
//     "group": "b",
//     "depthStart": 3,
//     "depthEnd": 13,
//     "rows": [
//       {
//         "depth": 6,
//         "group": "b",
//         "depthStart": 3,
//         "depthEnd": 13
//       }
//     ]
//   },
//   {
//     "group": "c",
//     "depthStart": 13,
//     "depthEnd": 20,
//     "rows": [
//       {
//         "depth": 20,
//         "group": "c",
//         "depthStart": 13,
//         "depthEnd": 20
//       }
//     ]
//   }
// ]

rows = [
    {
        depth: 2,
        group: 'a',
    },
    {
        depth: 6,
        group: 'b',
    },
    {
        depth: 20,
        group: 'c',
    },
]
rs = calcDepthStartEndByGroup(rows, { depthEndMax: 25 })
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "group": "a",
//     "depthStart": 0,
//     "depthEnd": 4,
//     "rows": [
//       {
//         "depth": 2,
//         "group": "a",
//         "depthStart": 0,
//         "depthEnd": 4
//       }
//     ]
//   },
//   {
//     "group": "b",
//     "depthStart": 4,
//     "depthEnd": 13,
//     "rows": [
//       {
//         "depth": 6,
//         "group": "b",
//         "depthStart": 4,
//         "depthEnd": 13
//       }
//     ]
//   },
//   {
//     "group": "c",
//     "depthStart": 13,
//     "depthEnd": 25,
//     "rows": [
//       {
//         "depth": 20,
//         "group": "c",
//         "depthStart": 13,
//         "depthEnd": 25
//       }
//     ]
//   }
// ]

rows = [
    {
        dc: 0,
        g: 'a',
    },
    {
        dc: 6,
        g: 'b',
    },
    {
        dc: 20,
        g: 'c',
    },
]
rs = calcDepthStartEndByGroup(rows, { keyDepth: 'dc', keyGroup: 'g', keyDepthStart: 'ds', keyDepthEnd: 'de' })
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "g": "a",
//     "ds": 0,
//     "de": 3,
//     "rows": [
//       {
//         "dc": 0,
//         "g": "a",
//         "ds": 0,
//         "de": 3
//       }
//     ]
//   },
//   {
//     "g": "b",
//     "ds": 3,
//     "de": 13,
//     "rows": [
//       {
//         "dc": 6,
//         "g": "b",
//         "ds": 3,
//         "de": 13
//       }
//     ]
//   },
//   {
//     "g": "c",
//     "ds": 13,
//     "de": 20,
//     "rows": [
//       {
//         "dc": 20,
//         "g": "c",
//         "ds": 13,
//         "de": 20
//       }
//     ]
//   }
// ]

rows = [
    {
        depth: 0,
        group: 'a',
    },
    {
        depth: 2,
        group: 'a',
    },
    {
        depth: 4,
        group: 'b',
    },
    {
        depth: 6,
        group: 'b',
    },
    {
        depth: 8,
        group: 'b',
    },
    {
        depth: 10,
        group: 'c',
    },
    {
        depth: 12,
        group: 'b',
    },
    {
        depth: 14,
        group: 'c',
    },
    {
        depth: 16,
        group: 'b',
    },
    {
        depth: 18,
        group: 'b',
    },
    {
        depth: 30,
        group: 'd',
    },
]
rs = calcDepthStartEndByGroup(rows)
console.log(JSON.stringify(rs, null, 2))
// => [
//   {
//     "group": "a",
//     "depthStart": 0,
//     "depthEnd": 3,
//     "rows": [
//       {
//         "depth": 0,
//         "group": "a",
//         "depthStart": 0,
//         "depthEnd": 1
//       },
//       {
//         "depth": 2,
//         "group": "a",
//         "depthStart": 1,
//         "depthEnd": 3
//       }
//     ]
//   },
//   {
//     "group": "b",
//     "depthStart": 3,
//     "depthEnd": 9,
//     "rows": [
//       {
//         "depth": 4,
//         "group": "b",
//         "depthStart": 3,
//         "depthEnd": 5
//       },
//       {
//         "depth": 6,
//         "group": "b",
//         "depthStart": 5,
//         "depthEnd": 7
//       },
//       {
//         "depth": 8,
//         "group": "b",
//         "depthStart": 7,
//         "depthEnd": 9
//       }
//     ]
//   },
//   {
//     "group": "c",
//     "depthStart": 9,
//     "depthEnd": 11,
//     "rows": [
//       {
//         "depth": 10,
//         "group": "c",
//         "depthStart": 9,
//         "depthEnd": 11
//       }
//     ]
//   },
//   {
//     "group": "b",
//     "depthStart": 11,
//     "depthEnd": 13,
//     "rows": [
//       {
//         "depth": 12,
//         "group": "b",
//         "depthStart": 11,
//         "depthEnd": 13
//       }
//     ]
//   },
//   {
//     "group": "c",
//     "depthStart": 13,
//     "depthEnd": 15,
//     "rows": [
//       {
//         "depth": 14,
//         "group": "c",
//         "depthStart": 13,
//         "depthEnd": 15
//       }
//     ]
//   },
//   {
//     "group": "b",
//     "depthStart": 15,
//     "depthEnd": 24,
//     "rows": [
//       {
//         "depth": 16,
//         "group": "b",
//         "depthStart": 15,
//         "depthEnd": 17
//       },
//       {
//         "depth": 18,
//         "group": "b",
//         "depthStart": 17,
//         "depthEnd": 24
//       }
//     ]
//   },
//   {
//     "group": "d",
//     "depthStart": 24,
//     "depthEnd": 30,
//     "rows": [
//       {
//         "depth": 30,
//         "group": "d",
//         "depthStart": 24,
//         "depthEnd": 30
//       }
//     ]
//   }
// ]


//node g_4_3-calcDepthStartEndByGroup.mjs
