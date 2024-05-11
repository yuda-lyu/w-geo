import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function relaPsdContent(ctGravel, ctSand, ctSilt, ctClay, opt = {}) {

    //ctCoarse
    let ctCoarse = null
    if (isnum(ctGravel) && isnum(ctSand)) {
        ctGravel = cdbl(ctGravel)
        ctSand = cdbl(ctSand)
        ctCoarse = ctGravel + ctSand
    }

    //ctFine
    let ctFine = null
    if (isnum(ctSilt) && isnum(ctClay)) {
        ctSilt = cdbl(ctSilt)
        ctClay = cdbl(ctClay)
        ctFine = ctSilt + ctClay
    }

    return {
        ctGravel,
        ctSand,
        ctSilt,
        ctClay,
        ctCoarse,
        ctFine,
    }
}


export default relaPsdContent
