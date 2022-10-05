import fs from 'fs'
import w from 'wsemi'
import { calcCpt } from './src/calcCpt.mjs'


let rowsIn = [

]

//rsatIni
let rsatIni = 19.5

//calcCpt
let rowsOut = calcCpt(rowsIn, rsatIni)
// console.log(rowsOut[0])

let k = 1
fs.writeFileSync(`./calcCpt-cpt-rowsIn${k}.json`, JSON.stringify(rowsIn), 'utf8')
fs.writeFileSync(`./calcCpt-cpt-rowsOut${k}.json`, JSON.stringify(rowsOut), 'utf8')
w.downloadExcelFileFromData(`./calcCpt-cpt-mat.xlsx`, 'mat', rowsOut)

//node --experimental-modules --es-module-specifier-resolution=node g11-calcCpt.mjs
