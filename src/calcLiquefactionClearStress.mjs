import map from 'lodash/map'


function calcLiquefactionClearStress(ltdt) {

    //因現在calcLiquefaction會有沿用垂直應力與有效應力之機制, 故得先清除才分析
    ltdt = map(ltdt, (v) => {
        v.sv = ''
        v.svp = ''
        v.svpUsual = ''
        v.svpDesign = ''
        return v
    })

    return ltdt
}


export default calcLiquefactionClearStress
