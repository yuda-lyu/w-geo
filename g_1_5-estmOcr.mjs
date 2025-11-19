import estmOcr from './src/estmOcr.mjs'


let compressiveStrength = 3.6 //kN/m2
let svp = 10 //kN/m2
let r

r = estmOcr(compressiveStrength, svp)
console.log(r)
// => { compressiveStrength: 3.6, svp: 10, ocr: 1.0336975290504131 }


//node g_1_5-estmOcr.mjs
