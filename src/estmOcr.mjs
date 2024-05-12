import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function estmOcr(compressiveStrength, svp, opt = {}) {
    //compressiveStrength, 壓縮強度(kPa)
    //svp, 垂直有效應力(kPa)
    //嚴格來說compressiveStrength與svp同單位即可

    //check compressiveStrength
    if (!isnum(compressiveStrength)) {
        throw new Error(`compressiveStrength[${compressiveStrength}] is not a number`)
    }
    compressiveStrength = cdbl(compressiveStrength)

    //check svp
    if (!isnum(svp)) {
        throw new Error(`svp[${svp}] is not a number`)
    }
    svp = cdbl(svp)

    //ocr, 依照報告(cu/svp)nc採0.35修正, 而(cu/svp)nc值介於0.25~0.35間, 並提到UU的cu有經過CIU的cu校正, 但CAU與CIU都是用0.35繪圖, (cu/svp)=0.35*OCR**0.85, pp171
    let t = (compressiveStrength / svp) / 0.35
    let ocr = t ** (1 / 0.85)

    //r
    let r = {
        compressiveStrength,
        svp,
        ocr,
    }

    return r
}


export default estmOcr
