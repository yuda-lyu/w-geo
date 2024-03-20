import get from 'lodash-es/get'
import map from 'lodash-es/map'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function calcLiquefactionSptAddPropsBasic(ltdt) {

    //add
    ltdt = map(ltdt, (v) => {

        //FC
        let FC = null
        if (isnum(get(v, 'FC'))) {
            FC = cdbl(v.FC)
        }
        else if (isnum(get(v, 'ctFine'))) {
            FC = cdbl(v.ctFine)
        }
        else if (isnum(get(v, 'ctSilt')) && isnum(get(v, 'ctClay'))) {
            FC = cdbl(v.ctSilt) + cdbl(v.ctClay)
        }
        v.FC = FC

        //rd, 乾單位重rd(kN/m3)
        let rd = null
        if (isnum(get(v, 'rd'))) {
            rd = cdbl(v.rd)
        }
        else if (isnum(get(v, 'Gt_dry'))) {
            rd = cdbl(v.Gt_dry)
        }
        v.rd = rd

        //rsat, 飽和單位重rsat(kN/m3)
        let rsat = null
        if (isnum(get(v, 'rsat'))) {
            rsat = cdbl(v.rsat)
        }
        else if (isnum(get(v, 'Gt_sat'))) {
            rsat = cdbl(v.Gt_sat)
        }
        v.rsat = rsat

        //N60
        let N60 = null
        if (isnum(get(v, 'N60'))) {
            N60 = cdbl(v.N60)
        }
        else if (isnum(get(v, 'SPTN'))) {
            N60 = cdbl(v.SPTN)
        }
        v.N60 = N60

        //soilClassification
        let soilClassification = ''
        if (isestr(get(v, 'soilClassification'))) {
            soilClassification = v.soilClassification
        }
        else if (isestr(get(v, 'USCS'))) {
            soilClassification = v.USCS
        }
        v.soilClassification = soilClassification

        return v
    })

    return ltdt
}


export default calcLiquefactionSptAddPropsBasic
