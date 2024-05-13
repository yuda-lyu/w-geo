import get from 'lodash-es/get.js'
import find from 'lodash-es/find.js'
import round from 'lodash-es/round.js'
import size from 'lodash-es/size.js'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import dtIntrpPsdBySize from './dtIntrpPsdBySize.mjs'


function dtIntrpPsdContentIso(dt, opt = {}) {

    //keySize
    let keySize = get(opt, 'keySize', '')
    if (!isestr(keySize)) {
        keySize = 'size'
    }

    //keyFraction
    let keyFraction = get(opt, 'keyFraction', '')
    if (!isestr(keyFraction)) {
        keyFraction = 'fraction'
    }

    //dtIntrpPsdBySize
    let psizes = [
        630,
        200,
        63,
        20,
        6.3,
        2,
        0.63,
        0.2,
        0.063,
        0.02,
        0.0063,
        0.002,
    ]
    let psds = dtIntrpPsdBySize(dt, psizes, { keySize, keyFraction })
    // console.log('psds', psds)

    //check
    if (size(psds) === 0) {
        console.log('dt', dt)
        console.log('psizes', psizes)
        console.log('keySize', keySize)
        console.log('keyFraction', keyFraction)
        throw new Error('invalid PSD')
    }

    //1e20->2: 礫石
    //2->0.063: 砂
    //0.063->0.02: 粉土
    //0.02->0: 黏土
    let p2 = find(psds, { size: 2 })
    let p0063 = find(psds, { size: 0.063 })
    // let p0005 = find(psds, { size: 0.005 })
    let p0002 = find(psds, { size: 0.002 })
    let f2 = get(p2, 'fraction')
    let f0063 = get(p0063, 'fraction')
    // let f0005 = get(p0005, 'fraction')
    let f0002 = get(p0002, 'fraction')
    // console.log('p2', p2, 'p0063', p0063, 'p0002', p0002)
    // console.log('f2', f2, 'f0063', f0063, 'f0002', f0002)

    //check
    if (!isnum(f2)) {
        throw new Error('invalid PSD in 2mm')
    }
    if (!isnum(f0063)) {
        throw new Error('invalid PSD in 0.063mm')
    }
    if (!isnum(f0002)) {
        throw new Error('invalid PSD in 0.002mm')
    }
    f2 = cdbl(f2)
    f0063 = cdbl(f0063)
    f0002 = cdbl(f0002)
    // console.log('f2', f2, 'f0063', f0063, 'f0002', f0002)

    //ctGravelISO, ctSandISO, ctFineISO, ctClayISO, 四捨五入可能會導致4項總和非100%
    let ctGravelISO = 100 - f2
    ctGravelISO = round(ctGravelISO)
    let ctSandISO = f2 - f0063
    ctSandISO = round(ctSandISO)
    let ctSiltISO = f0063 - f0002
    ctSiltISO = round(ctSiltISO)
    let ctClayISO = f0002
    ctClayISO = round(ctClayISO)
    // console.log('ctGravelISO', ctGravelISO, 'ctSandISO', ctSandISO, 'ctSiltISO', ctSiltISO, 'ctClayISO', ctClayISO)

    //add ctCoarseISO, ctGravelISO, ctSandISO, ctFineISO, ctSiltISO, ctClayISO
    dt.ctCoarseISO = ctGravelISO + ctSandISO
    dt.ctGravelISO = ctGravelISO
    dt.ctSandISO = ctSandISO
    dt.ctFineISO = ctSiltISO + ctClayISO
    dt.ctSiltISO = ctSiltISO
    dt.ctClayISO = ctClayISO
    // console.log('ctGravel Ori', dt.ctGravel, 'New', ctGravelISO)
    // console.log('ctSand Ori', dt.ctSand, 'New', ctSandISO)
    // console.log('ctFine Ori', (cdbl(dt.ctSilt) + cdbl(dt.ctClay)), 'New', ctFineISO)
    // console.log('ctClay Ori', dt.ctClay, 'New', ctClayISO)

    return dt
}


export default dtIntrpPsdContentIso
