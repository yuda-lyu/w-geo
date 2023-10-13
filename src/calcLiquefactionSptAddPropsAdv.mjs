import map from 'lodash/map'


function calcLiquefactionSptAddPropsAdv(ltdt, PGA, Mw, waterLevelUsual, waterLevelDesign) {

    //add
    ltdt = map(ltdt, (v) => {
        v.PGA = PGA
        v.Mw = Mw
        v.waterLevelUsual = waterLevelUsual
        v.waterLevelDesign = waterLevelDesign
        return v
    })

    return ltdt
}


export default calcLiquefactionSptAddPropsAdv
