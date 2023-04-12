import cstr from 'wsemi/src/cstr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import getFontfamily from 'w-highcharts/src/getFontfamily.mjs'


function genHtText(c, size = 11) {
    //預設使用中英文混合, 但複製網頁html至word會失效
    let fontFamily = getFontfamily()
    return `<span style="font-family:${fontFamily}; font-size:${size}pt;">${cstr(c)}</span>`
}


function genHtTextSub(c, size = 11) {
    //預設使用中英文混合, 但複製網頁html至word會失效
    let fontFamily = getFontfamily()
    return `<br><span style="font-family:${fontFamily}; font-size:${size}pt;">${cstr(c)}</span>`
}


function genTextParentheses(c) {
    if (isestr(c)) {
        return ` (${c})`
    }
    return ''
}


export {
    genHtText,
    genHtTextSub,
    genTextParentheses,
    getFontfamily
}
export default { //整合輸出預設得要有default
    genHtText,
    genHtTextSub,
    genTextParentheses,
    getFontfamily
}
