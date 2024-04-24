import fs from 'fs'
import w from 'wsemi'
import { cptClassify } from './src/calcCptClassify.mjs'

let r = { 'depth': '0.02', 'qc': '0.417438462', 'fs': '0.002153846', 'u2': '-0.005923077', 'depthStart': '0.01', 'depthEnd': '0.03', 'rsat': '19', 'u0': '0.0001962', 'rd': '16', 'sv': '0.00038', 'svp': '0.0001838', 'qt': '0.415957693', 'qnet': '0.415577693', 'Bq': '-0.014724748', 'Qt': '2261.032061', 'Qtn': '105.8960737', 'Rf': '0.517804103', 'Fr': '0.518277578', 'Ic': '0.941696263', 'Icn': '1.720982028', 'n': '0.515104315', 'Cn': '25.83741963' }

let clsIc = cptClassify.csfIc(w.cdbl(r.Ic))
let clsIcn = cptClassify.csfIc(w.cdbl(r.Icn))
let clsRobBqqt = cptClassify.csfRobBqqt(w.cdbl(r.Bq), w.cdbl(r.qt))
let clsRobRfqt = cptClassify.csfRobRfqt(w.cdbl(r.Rf), w.cdbl(r.qt))
let clsRobBqQt = cptClassify.csfRobBqQt(w.cdbl(r.Bq), w.cdbl(r.Qt))
let clsRobFrQt = cptClassify.csfRobFrQt(w.cdbl(r.Fr), w.cdbl(r.Qt))
let clsRobBqQtn = cptClassify.csfRobBqQt(w.cdbl(r.Bq), w.cdbl(r.Qtn))
let clsRobFrQtn = cptClassify.csfRobFrQt(w.cdbl(r.Fr), w.cdbl(r.Qtn))
let clsRamBqQt = cptClassify.csfRamBqQt(w.cdbl(r.Bq), w.cdbl(r.Qt))
let clsRamFrQt = cptClassify.csfRamFrQt(w.cdbl(r.Fr), w.cdbl(r.Qt))

console.log('clsIc', clsIc)
// => clsIc {
//   success: { int: 1, rang: '0~1.31', cht: '礫質砂土', eng: 'Gravelly sand' }
// }

console.log('clsIcn', clsIcn)
// => clsIcn {
//   success: {
//     int: 2,
//     rang: '1.31~2.05',
//     cht: '砂土-純砂至粉質砂土',
//     eng: 'Sands-clean sand to silty sand'
//   }
// }

console.log('clsRobBqqt', clsRobBqqt)
// => clsRobBqqt { success: { int: 4, msg: '4: Silty clay to clay' } }

console.log('clsRobRfqt', clsRobRfqt)
// => clsRobRfqt { success: { int: 1, msg: '1: Sensitive fine grained' } }

console.log('clsRobBqQt', clsRobBqQt)
// => clsRobBqQt { error: 'Qt < 1 or Qt > 1000' }

console.log('clsRobFrQt', clsRobFrQt)
// => clsRobFrQt { error: 'Qt < 1 or Qt > 1000' }

console.log('clsRobBqQtn', clsRobBqQtn)
// => clsRobBqQtn { success: { int: 6, msg: '6: Sands - clean sand to silty sand' } }

console.log('clsRobFrQtn', clsRobFrQtn)
// => clsRobFrQtn { success: { int: 6, msg: '6: Sands - clean sand to silty sand' } }

console.log('clsRamBqQt', clsRamBqQt)
// => clsRamBqQt { success: { int: 9, msg: '9: Clean to slightly silty sand' } }

console.log('clsRamFrQt', clsRamFrQt)
// => clsRamFrQt { success: { int: 9, msg: '9: Clean to slightly silty sand' } }


//node --experimental-modules g_3_3-calcCptClassify.mjs
