import fs from 'fs'
import w from 'wsemi'
// import relaPorousParams from './src/relaPorousParams.mjs'
// import checkDepthStartEnd from './src/checkDepthStartEnd.mjs'
// import calcVerticalStress from './src/calcVerticalStress.mjs'
import calcLiquefaction from './src/calcLiquefaction.mjs'


function getRows(k) {
    let rowsIn1 = `[
        {"depthStart":"0","depthEnd":"2.025","depth":"1.0125","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"ML","N60":"9.6","gravel":"","sand":"","silt":"","clay":"","FC":"83","w":"","Gs":"","e":"","rd":"","rsat":"19.52","sv":"","svp":"","LL":"","PI":"5","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"2.025","depthEnd":"3.525","depth":"2.775","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"CL","N60":"10.8","gravel":"","sand":"","silt":"","clay":"","FC":"91","w":"","Gs":"","e":"","rd":"","rsat":"18.64","sv":"","svp":"","LL":"","PI":"20","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"3.525","depthEnd":"5.025","depth":"4.275","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"SM","N60":"24","gravel":"","sand":"","silt":"","clay":"","FC":"14","w":"","Gs":"","e":"","rd":"","rsat":"19.03","sv":"","svp":"","LL":"","PI":"","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"5.025","depthEnd":"6.525","depth":"5.775","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"SM","N60":"27.6","gravel":"","sand":"","silt":"","clay":"","FC":"12","w":"","Gs":"","e":"","rd":"","rsat":"18.54","sv":"","svp":"","LL":"","PI":"","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"6.525","depthEnd":"8.025","depth":"7.275","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"SM","N60":"19.2","gravel":"","sand":"","silt":"","clay":"","FC":"15","w":"","Gs":"","e":"","rd":"","rsat":"19.18","sv":"","svp":"","LL":"","PI":"","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"8.025","depthEnd":"9.525","depth":"8.775","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"SM","N60":"18","gravel":"","sand":"","silt":"","clay":"","FC":"13","w":"","Gs":"","e":"","rd":"","rsat":"18.84","sv":"","svp":"","LL":"","PI":"","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"9.525","depthEnd":"11.025","depth":"10.275","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"ML","N60":"8.4","gravel":"","sand":"","silt":"","clay":"","FC":"52","w":"","Gs":"","e":"","rd":"","rsat":"18.39","sv":"","svp":"","LL":"","PI":"","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"11.025","depthEnd":"12.525","depth":"11.775","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"ML","N60":"9.6","gravel":"","sand":"","silt":"","clay":"","FC":"54","w":"","Gs":"","e":"","rd":"","rsat":"19.28","sv":"","svp":"","LL":"","PI":"","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"12.525","depthEnd":"14.025","depth":"13.275","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"ML","N60":"10.8","gravel":"","sand":"","silt":"","clay":"","FC":"57","w":"","Gs":"","e":"","rd":"","rsat":"17.85","sv":"","svp":"","LL":"","PI":"","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"14.025","depthEnd":"15.525","depth":"14.775","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"SM","N60":"9.6","gravel":"","sand":"","silt":"","clay":"","FC":"45","w":"","Gs":"","e":"","rd":"","rsat":"19.42","sv":"","svp":"","LL":"","PI":"","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"15.525","depthEnd":"17.025","depth":"16.275","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"CL","N60":"7.2","gravel":"","sand":"","silt":"","clay":"","FC":"97","w":"","Gs":"","e":"","rd":"","rsat":"18.64","sv":"","svp":"","LL":"","PI":"11","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"17.025","depthEnd":"18.525","depth":"17.775","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"CL","N60":"7.2","gravel":"","sand":"","silt":"","clay":"","FC":"95","w":"","Gs":"","e":"","rd":"","rsat":"19.03","sv":"","svp":"","LL":"","PI":"15","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""},{"depthStart":"18.525","depthEnd":"20","depth":"19.2625","longitude":"","latitude":"","legendCode":"","description":"","waterLevel":"","soilClassification":"CL","N60":"8.4","gravel":"","sand":"","silt":"","clay":"","FC":"94","w":"","Gs":"","e":"","rd":"","rsat":"18.34","sv":"","svp":"","LL":"","PI":"13","D50":"","D10":"","PGA":"0.32","Mw":"7.5","vibrationType":""}
    ]`
    let rowsIn2 = `[
        {"sampleId":"S-1","depthStart":"0","depthEnd":"3.5","depth":"1.75","N60":"8","w":"20.8","GS":"2.7","e":"0.86","LL":"32.5","PI":"11.4","soilClassification":"CL","D50":"","D10":"","FC":"76.09999847","rd":"14.21150662","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-2","depthStart":"3.5","depthEnd":"5.5","depth":"4.5","N60":"8","w":"19.5","GS":"2.7","e":"0.53","LL":"27.1","PI":"7.8","soilClassification":"CL","D50":"","D10":"","FC":"20.9","rd":"17.32142259","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-3","depthStart":"5.5","depthEnd":"7.5","depth":"6.5","N60":"8","w":"20.2","GS":"2.7","e":"0.58","LL":"29.4","PI":"9.1","soilClassification":"CL","D50":"","D10":"","FC":"23","rd":"16.8124792","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-4","depthStart":"7.5","depthEnd":"9.2","depth":"8.35","N60":"8","w":"35.5","GS":"2.72","e":"1.03","LL":"37.2","PI":"13.7","soilClassification":"CL","D50":"","D10":"","FC":"30.7","rd":"13.10413284","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-5","depthStart":"9.2","depthEnd":"10.6","depth":"9.9","N60":"3","w":"36.2","GS":"2.72","e":"1.01","LL":"40.2","PI":"16.4","soilClassification":"CL","D50":"","D10":"","FC":"97.3999939","rd":"13.25286344","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-6","depthStart":"10.6","depthEnd":"12.7","depth":"11.65","N60":"5","w":"34.1","GS":"2.72","e":"1.15","LL":"37.2","PI":"14","soilClassification":"CL","D50":"","D10":"","FC":"96.3999939","rd":"12.43624161","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-7","depthStart":"12.7","depthEnd":"15.3","depth":"14","N60":"10","w":"31.1","GS":"2.66","e":"0.76","LL":"","PI":"NP","soilClassification":"ML","D50":"","D10":"","FC":"56.39999771","rd":"14.96567506","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-8","depthStart":"15.3","depthEnd":"17.5","depth":"16.4","N60":"4","w":"31.4","GS":"2.72","e":"0.85","LL":"35.1","PI":"12.8","soilClassification":"CL","D50":"","D10":"","FC":"93.19999695","rd":"14.40890411","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-9","depthStart":"17.5","depthEnd":"19.5","depth":"18.5","N60":"10","w":"33","GS":"2.72","e":"1.01","LL":"34.3","PI":"11.9","soilClassification":"CL","D50":"","D10":"","FC":"92.59999847","rd":"13.27669173","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-10","depthStart":"19.5","depthEnd":"21.5","depth":"20.5","N60":"4","w":"31.7","GS":"2.72","e":"0.87","LL":"32.1","PI":"10.7","soilClassification":"CL","D50":"","D10":"","FC":"90.5","rd":"14.22710706","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-11","depthStart":"21.5","depthEnd":"23.5","depth":"22.5","N60":"5","w":"30.1","GS":"2.72","e":"0.84","LL":"31.2","PI":"9.7","soilClassification":"CL","D50":"","D10":"","FC":"0","rd":"14.5528824","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-12","depthStart":"23.5","depthEnd":"25","depth":"24.25","N60":"7","w":"32.3","GS":"2.72","e":"0.91","LL":"32.9","PI":"10.6","soilClassification":"CL","D50":"","D10":"","FC":"29.4","rd":"13.94013605","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},
        {"sampleId":"S-13","depthStart":"25","depthEnd":"25.5","depth":"25.25","N60":"7","w":"33","GS":"2.71","e":"1.14","LL":"27.3","PI":"7.7","soilClassification":"CL","D50":"","D10":"","FC":"0","rd":"12.39157895","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"}
    ]`
    let rowsIn
    if (k === 1) {
        rowsIn = rowsIn1
    }
    else if (k === 2) {
        rowsIn = rowsIn2
    }
    else {
        throw new Error(`invalid k[${k}]`)
    }
    rowsIn = JSON.parse(rowsIn)
    return rowsIn
}

function calc(k) {

    let rowsIn = getRows(k)
    // console.log('rowsIn',rowsIn)

    let rowsOut = calcLiquefaction.calc('SPT', rowsIn)
    // console.log('rowsOut',rowsOut)

    fs.writeFileSync(`./calcLiquefaction-rowsIn${k}.json`, JSON.stringify(rowsIn), 'utf8')
    fs.writeFileSync(`./calcLiquefaction-rowsOut${k}.json`, JSON.stringify(rowsOut), 'utf8')

    let mat = w.ltdtkeysheads2mat(rowsOut)
    w.downloadExcelFileFromData(`./mat${k}.xlsx`, 'mat', mat)

}

calc(1)
calc(2)

//node --experimental-modules --es-module-specifier-resolution=node g3-calcLiquefaction.mjs
