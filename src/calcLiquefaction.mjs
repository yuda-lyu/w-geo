import map from 'lodash/map'
import each from 'lodash/each'
import min from 'lodash/min'
import max from 'lodash/max'
import size from 'lodash/size'
import join from 'lodash/join'
import trim from 'lodash/trim'
import sortBy from 'lodash/sortBy'
import toLower from 'lodash/toLower'
import isNumber from 'lodash/isNumber'
import get from 'lodash/get'
import split from 'lodash/split'
import keys from 'lodash/keys'
import cloneDeep from 'lodash/cloneDeep'
import cdbl from 'wsemi/src/cdbl.mjs'
import cint from 'wsemi/src/cint.mjs'
import strleft from 'wsemi/src/strleft.mjs'
import strright from 'wsemi/src/strright.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import interp1 from 'wsemi/src/interp1.mjs'
import cnst from './cnst.mjs'
import { intrpDefPp } from './intrpDefParam.mjs'
import checkDepthStartEnd from './checkDepthStartEnd.mjs'
import relaPorousParams from './relaPorousParams.mjs'
import { checkVerticalStress, calcVerticalStress } from './calcVerticalStress.mjs'
import { calcCptCore } from './calcCpt.mjs'


//g, 重力加速度(m/s2)
let g = cnst.g

//cvru, kN/m2 -> kg/cm2
let cvru = 1 / g * 1000 / 10000


//參數單位
// waterLevelDesign(m)
// soilClassification(none)
// vibrationType(none)
// depth(m)
// N60(none)
// FC(%)
// PI(%)
// D50(mm)
// D10(mm)
// svp(kN/m2)
// svpUsual(kN/m2)
// svpDesign(kN/m2)
// sv(kN/m2)
// PGA(none)
// Mw(none)
// qc(MPa)
// fs(MPa)
// u2(MPa)


function brk(c) {
    let cc = trim(cstr(c))
    if (cc !== '') {
        return `[${cc}]`
    }
    return ''
}


function isNoLiqueByUSCS(soilClassification, mode = 'new') {
    let r1 = strleft(soilClassification, 1)
    let r2 = strleft(soilClassification, 2)
    if (mode === 'new') {
        //開頭C,O,P,M(除了ML)視為非液化條件 (2020/07/30)
        //開頭C,O,P,M(除了ML與MH)視為非液化條件 (2021/02/04)
        if (r1 === 'C' || r1 === 'O' || r1 === 'P') {
            return true
        }
        return r1 === 'M' && (r2 !== 'ML' && r2 !== 'MH')
    }
    else if (mode === 'classic') {
        //開頭非S,G視為非液化條件
        return r1 !== 'S' && r1 !== 'G'
    }
    else {
        throw new Error(`invalid mode[${mode}]`)
    }
}


function isGravelByUSCS(soilClassification) {
    let r = strleft(soilClassification, 1)
    return r === 'G'
}


function isSandByUSCS(soilClassification) {
    let r1 = strleft(soilClassification, 1)
    let r2 = strleft(soilClassification, 2)
    //配合非液化條件, 開頭S(與ML與MH)視為可液化砂 (2021/02/04)
    if (r1 === 'S') {
        return true
    }
    return r2 === 'ML' || r2 === 'MH'
}


// function isClayA(soilClassification) {
//     let r = strleft(soilClassification, 1)
//     return r === 'C'
// }


function interp(vx, vy, x) {

    //check
    if (size(vx) <= 0) {
        return { err: 'invalid vx' }
    }
    if (size(vy) <= 0) {
        return { err: 'invalid vy' }
    }
    if (size(vx) !== size(vy)) {
        return { err: 'size of vx is not equal to size of vy' }
    }

    //ps
    let ps = map(vx, (v, k) => {
        let x = vx[k]
        let y = vy[k]
        return { x, y }
    })

    //interp1
    let y = interp1(ps, x)

    //check
    if (y.err) {
        // console.log('y', y)
        if (y.err === 'ps is not effective array') {
            y.err = '無有效數據'
        }
    }

    return y
}


function interExtraPolate(p1, p2, x) {
    //主要使用線性外插, 供沉陷大體積應變計算之用
    return ((x - p1.x) * p2.y + (p2.x - x) * p1.y) / (p2.x - p1.x)
}


function sptVolumetricStrainTokimatsuAndSeed(N160, CSR) {
    let err = []
    //TS沉陷需使用N160

    //ps
    let ps = [
        {
            volumetricStrain: 10,
            data: [
                [1.15304, 0.6],
                [1.10234, 0.0413661],
                [1.10234, 0.0348459],
                [1.04383, 0.0253621],
                [0.956072, 0.0161746],
                [0.722041, 0.0093581],
                [0, 0]
            ],
        },
        {
            volumetricStrain: 5,
            data: [
                [3.00384, 0.6],
                [2.97459, 0.0591482],
                [2.94533, 0.0523317],
                [2.82832, 0.0431443],
                [2.56503, 0.0348459],
                [2.12623, 0.0253621],
                [1.21936, 0.0126182],
                [0, 0]
            ],
        },
        {
            volumetricStrain: 4,
            data: [
                [5.11012, 0.6],
                [5.11012, 0.111606],
                [5.05161, 0.103604],
                [5.02236, 0.0947126],
                [4.87609, 0.0849324],
                [4.72982, 0.0754486],
                [4.52504, 0.0656684],
                [4.20325, 0.0579628],
                [3.82295, 0.0499608],
                [3.32563, 0.0407733],
                [2.53578, 0.0286221],
                [1.5704, 0.0161746],
                [0, 0]
            ],
        },
        {
            volumetricStrain: 3,
            data: [
                [7.68446, 0.6],
                [7.53819, 0.234896],
                [7.53819, 0.212964],
                [7.50893, 0.191033],
                [7.39192, 0.165249],
                [7.33341, 0.142428],
                [7.24565, 0.125831],
                [7.07012, 0.111013],
                [6.8946, 0.09738],
                [6.66057, 0.0887852],
                [6.45579, 0.0804869],
                [6.07549, 0.0730776],
                [5.66594, 0.0665575],
                [5.28564, 0.0606301],
                [4.75907, 0.0523317],
                [4.08623, 0.043737],
                [0, 0]
            ],
        },
        {
            volumetricStrain: 2,
            data: [
                [14.1203, 0.6],
                [14.091, 0.248529],
                [13.974, 0.231043],
                [13.7985, 0.216521],
                [13.6815, 0.201702],
                [13.3597, 0.184513],
                [13.2134, 0.173843],
                [13.0087, 0.16347],
                [12.7161, 0.152208],
                [12.131, 0.139168],
                [11.546, 0.12761],
                [10.8439, 0.116644],
                [0, 0]
            ],
        },
        {
            volumetricStrain: 1,
            data: [
                [27.5771, 0.6],
                [27.5771, 0.541935],
                [27.6063, 0.507852],
                [27.5478, 0.485625],
                [27.5186, 0.465471],
                [27.5186, 0.445022],
                [27.4893, 0.424869],
                [27.3723, 0.41005],
                [27.1675, 0.392268],
                [26.9335, 0.376264],
                [26.5532, 0.357889],
                [26.2021, 0.339514],
                [25.7048, 0.324399],
                [25.1783, 0.311655],
                [24.6224, 0.298022],
                [23.9496, 0.282908],
                [23.2182, 0.269571],
                [22.4576, 0.256531],
                [21.7556, 0.244676],
                [20.8779, 0.232525],
                [19.9126, 0.218892],
                [0, 0]
            ],
        },
        {
            volumetricStrain: 0.5,
            data: [
                [33.0183, 0.6],
                [33.0183, 0.570979],
                [32.9598, 0.554086],
                [32.9013, 0.536007],
                [32.6965, 0.516743],
                [32.5502, 0.500147],
                [32.3747, 0.482068],
                [32.0529, 0.464582],
                [31.6726, 0.445022],
                [31.3216, 0.425461],
                [30.9998, 0.410939],
                [30.5025, 0.394935],
                [29.9466, 0.376264],
                [29.3908, 0.356704],
                [28.3962, 0.335958],
                [27.1383, 0.313137],
                [25.5586, 0.287057],
                [23.7156, 0.261865],
                [21.8141, 0.238452],
                [19.7078, 0.212964],
                [0, 0]
            ],
        },
        {
            volumetricStrain: 0.2,
            data: [
                [35.4, 0.6],
                [35.3, 0.574535],
                [35.1, 0.555864],
                [34.9, 0.539267],
                [34.6, 0.515558],
                [34.3, 0.497183],
                [34, 0.477919],
                [33.4544, 0.455691],
                [33, 0.434353],
                [32.6087, 0.415385],
                [31.8774, 0.397306],
                [30.8242, 0.369151],
                [30.0051, 0.348998],
                [29.069, 0.327067],
                [28.1329, 0.308099],
                [27.1383, 0.291799],
                [25.8218, 0.271349],
                [24.3884, 0.252974],
                [23.2768, 0.237859],
                [21.8726, 0.220373],
                [19.9711, 0.200517],
                [18.5961, 0.186291],
                [17.1627, 0.170583],
                [15.583, 0.154876],
                [14.3543, 0.14065],
                [12.8331, 0.124942],
                [10.7269, 0.103307],
                [8.59132, 0.081376],
                [6.39729, 0.0612228],
                [4.17399, 0.0389951],
                [2.15548, 0.0188419],
                [0, 0]
            ],
        },
        {
            volumetricStrain: 0.1,
            data: [
                [36.7, 0.6],
                [36.5, 0.571572],
                [36.2, 0.544602],
                [35.8, 0.520596],
                [35.4, 0.490366],
                [35, 0.466657],
                [34.6, 0.446207],
                [34.2, 0.424869],
                [33.5, 0.404419],
                [32.7, 0.379228],
                [32, 0.358482],
                [30.9998, 0.331809],
                [29.5956, 0.305432],
                [28.0159, 0.278758],
                [26.9335, 0.262162],
                [25.266, 0.238156],
                [23.2768, 0.214446],
                [21.2875, 0.192515],
                [19.0642, 0.170583],
                [16.8117, 0.149541],
                [14.5006, 0.129684],
                [12.2481, 0.108938],
                [10.0248, 0.0881925],
                [7.77222, 0.0671502],
                [5.63669, 0.0472934],
                [4.70056, 0.038106],
                [3.23787, 0.0259548],
                [2.38951, 0.0194347],
                [0.926818, 0.00669077],
                [0, 0]
            ],
        },
    ]

    //data to xy
    ps = map(ps, (v) => {
        let vx = map(v.data, (vv) => {
            return vv[1] //CSR
        })
        let vy = map(v.data, (vv) => {
            return vv[0] //N160
        })
        v.vx = vx
        v.vy = vy
        return v
    })
    // console.log('TS: ps', ps)

    //volumetricStrains
    let volumetricStrains = map(ps, 'volumetricStrain')
    // console.log('TS: volumetricStrains', volumetricStrains)

    //N160s
    let N160s = map(ps, (v) => {
        let r = interp(v.vx, v.vy, CSR)
        // console.log('TS: interp', 'v.vx', v.vx, 'v.vy', v.vy, 'CSR', CSR)
        // console.log('TS: interp', 'r', r)
        if (get(r, 'err')) {
            return r.err
        }
        return r
    })
    // console.log('TS: N160s', N160s)

    //因數化時體積應變之線段貼太近(例如1%,0.5%), 可能會在小CSR時計算當前N160對體積應變曲線時出現非遞減問題, 並導致無法內插, 故得先剔除非遞減數據
    let N160sNewMax = N160s[0] //使用第1點
    let N160sNew = [N160s[0]]
    let volumetricStrainsNew = [volumetricStrains[0]]
    each(N160s, (v, k) => {
        if (k > 0) {
            if (N160s[k] >= N160sNewMax) { //N160比上個儲存值還大或等於就push, N變大volumetricStrain變小
                N160sNewMax = N160s[k]
                N160sNew.push(N160s[k])
                volumetricStrainsNew.push(volumetricStrains[k])
            }
        }
    })
    N160s = N160sNew
    volumetricStrains = volumetricStrainsNew

    //volumetricStrain
    let volumetricStrain = interp(N160s, volumetricStrains, N160)
    if (get(volumetricStrain, 'err')) {
        // console.log('TS: r', volumetricStrain)

        if (volumetricStrain.err === 'out of x-range') {

            //ps, interp1內部會排序x必定為遞增, 且為有效數據(至少2點)
            let ps = volumetricStrain.data.ps
            // console.log('ps', ps)

            let N160Max = max(N160s)
            let N160Min = min(N160s)
            // console.log('TS: N160Max', N160Max)
            // console.log('TS: N160Min', N160Min)
            if (N160 > N160Max) {
                let vstr = ps[size(ps) - 1].y //x為遞增, 故最後1點y為最小體積應變
                err.push(`出現外插情形 N160=${N160} > N160Max=${N160Max}，依照CSR=${CSR}並給予最小體積應變vstr=${vstr}%`)
                volumetricStrain = vstr
            }
            else if (N160 < N160Min) {
                let vstr = interExtraPolate(ps[0], ps[1], N160)
                err.push(`出現外插情形 N160=${N160} < N160Min=${N160Min}，依照CSR=${CSR}並依據最近2點外插體積應變vstr=${vstr}%`)
                volumetricStrain = vstr
            }
            else {
                err.push(`非預期外插情形，請洽開發者修復問題`)
                volumetricStrain = ''
            }

        }
        else {
            err.push(volumetricStrain.err)
            volumetricStrain = ''
        }

    }

    return {
        err,
        vstr: volumetricStrain,
    }
}


function sptVolumetricStrainIshiharaAndYoshimine(N172, FS) {
    let err = []
    //IY法之N1係指名要用TY法的 N1 = 1.7 * N / (svp + 0.7), 現N1值就是基於各液化分析方法所得, 液化沉陷就另計算 (2021/03/11)
    //TY法的N值的鑽桿能量修正原本為80%, 現基於日系方法皆統一為72%, 故IY法的鑽桿能量也採用72% (2021/03/11)

    //ps
    let ps = [
        {
            N172: 3,
            data: [
                [0, 5.48516],
                [0.791714, 5.48516],
                [0.889946, 5.48274],
                [0.957602, 5.47549],
                [0.972564, 5.43681],
                [0.981021, 5.37154],
                [0.982973, 4.71396],
                [0.984274, 4.17243],
                [0.985575, 3.45201],
                [0.988177, 2.61312],
                [0.992081, 2.25532],
                [0.996634, 1.94104],
                [1.00379, 1.68961],
                [1.01095, 1.54214],
                [1.02981, 1.32698],
                [1.04347, 1.16501],
                [1.06624, 1.00303],
                [1.09096, 0.879735],
                [1.11503, 0.773363],
                [1.1391, 0.703254],
                [1.17944, 0.616222],
                [1.23018, 0.529191],
                [1.28873, 0.444576],
                [1.35378, 0.384138],
                [1.41558, 0.333369],
                [1.48064, 0.275348],
                [1.5548, 0.231832],
                [2, 0],
            ],
        },
        {
            N172: 6,
            data: [
                [0, 4.51524],
                [0.789554, 4.51524],
                [0.890726, 4.51176],
                [0.938502, 4.49784],
                [0.957238, 4.45954],
                [0.960985, 4.31681],
                [0.962858, 3.76677],
                [0.964732, 3.36294],
                [0.966605, 2.92778],
                [0.971289, 2.57618],
                [0.97691, 2.27679],
                [0.980657, 2.07487],
                [0.990962, 1.85903],
                [1.00314, 1.57705],
                [1.01813, 1.35773],
                [1.03686, 1.18367],
                [1.05935, 1.02005],
                [1.08089, 0.88428],
                [1.09401, 0.818136],
                [1.13148, 0.696291],
                [1.17082, 0.60926],
                [1.22367, 0.517103],
                [1.28287, 0.437324],
                [1.34597, 0.376885],
                [1.40778, 0.323699],
                [1.47673, 0.268096],
                [1.55154, 0.222162],
                [2, 0],
            ],
        },
        {
            N172: 10,
            data: [
                [0, 3.50567],
                [0.738969, 3.50567],
                [0.841077, 3.50219],
                [0.896347, 3.49523],
                [0.912272, 3.43953],
                [0.919767, 3.34206],
                [0.928198, 3.02874],
                [0.938502, 2.64928],
                [0.94787, 2.29419],
                [0.961922, 1.9774],
                [0.972226, 1.74763],
                [0.989088, 1.50743],
                [1.00876, 1.28811],
                [1.03031, 1.11404],
                [1.05466, 0.953905],
                [1.08745, 0.807692],
                [1.12398, 0.682366],
                [1.16333, 0.584891],
                [1.21673, 0.50134],
                [1.27762, 0.421271],
                [1.33757, 0.358608],
                [1.39752, 0.306389],
                [1.46966, 0.25417],
                [1.54366, 0.205433],
                [2, 0],
            ],
        },
        {
            N172: 14,
            data: [
                [0, 2.77461],
                [0.693066, 2.77461],
                [0.763325, 2.77113],
                [0.797049, 2.73283],
                [0.815784, 2.68061],
                [0.831709, 2.57966],
                [0.867307, 2.26634],
                [0.88979, 2.01221],
                [0.915083, 1.74763],
                [0.936629, 1.54224],
                [0.960985, 1.34729],
                [0.991898, 1.12797],
                [1.01532, 0.978274],
                [1.04248, 0.852949],
                [1.0734, 0.731104],
                [1.10712, 0.623185],
                [1.14834, 0.539634],
                [1.18206, 0.480453],
                [1.22797, 0.414309],
                [1.28417, 0.36209],
                [1.34975, 0.299427],
                [1.4275, 0.240245],
                [1.51368, 0.184545],
                [2, 0],
            ],
        },
        {
            N172: 20,
            data: [
                [0, 2.17235],
                [0.511332, 2.17235],
                [0.605009, 2.16539],
                [0.660279, 2.13406],
                [0.69213, 2.1062],
                [0.722107, 2.0505],
                [0.751147, 1.95999],
                [0.794238, 1.75808],
                [0.825152, 1.6049],
                [0.865433, 1.40299],
                [0.901968, 1.24285],
                [0.939439, 1.06182],
                [0.994709, 0.859911],
                [1.04717, 0.689329],
                [1.09869, 0.550078],
                [1.15021, 0.459565],
                [1.20267, 0.386459],
                [1.25888, 0.327277],
                [1.31228, 0.271577],
                [1.38441, 0.22632],
                [1.46403, 0.177583],
                [2, 0],
            ],
        },
        {
            N172: 25,
            data: [
                [0, 1.73371],
                [0.396108, 1.73371],
                [0.49447, 1.71978],
                [0.544119, 1.69542],
                [0.579716, 1.65712],
                [0.619998, 1.58053],
                [0.660279, 1.48306],
                [0.703371, 1.37862],
                [0.734285, 1.28463],
                [0.775503, 1.17671],
                [0.816721, 1.06182],
                [0.865433, 0.93998],
                [0.910399, 0.82858],
                [0.956301, 0.724142],
                [1.00595, 0.602297],
                [1.0556, 0.508303],
                [1.11743, 0.403865],
                [1.16989, 0.337721],
                [1.22703, 0.285502],
                [1.27855, 0.247208],
                [1.33663, 0.208914],
                [1.4172, 0.167139],
                [1.49963, 0.132326],
                [2, 0],
            ],
        },
        {
            N172: 30,
            data: [
                [0, 1.30203],
                [0.264959, 1.30203],
                [0.388614, 1.29159],
                [0.476671, 1.26026],
                [0.527257, 1.20108],
                [0.588147, 1.11056],
                [0.647164, 1.01657],
                [0.694003, 0.919093],
                [0.759578, 0.804211],
                [0.821405, 0.689329],
                [0.884169, 0.591853],
                [0.964732, 0.47349],
                [1.02469, 0.386459],
                [1.09963, 0.309871],
                [1.16895, 0.25417],
                [1.24764, 0.19847],
                [1.32726, 0.156695],
                [1.40876, 0.125364],
                [1.48558, 0.100995],
                [1.55303, 0.0870696],
                [1.63453, 0.0627007],
                [2, 0],
            ],
        },
    ]

    //data to xy
    ps = map(ps, (v) => {
        let vx = map(v.data, (vv) => {
            return vv[0] //FS
        })
        let vy = map(v.data, (vv) => {
            return vv[1] //volumetricStrain
        })
        v.vx = vx
        v.vy = vy
        return v
    })
    // console.log('IY: ps', ps)

    //N172s
    let N172s = map(ps, 'N172')
    // console.log('IY: N172s', N172s)

    //volumetricStrains
    let volumetricStrains = map(ps, (v) => {
        let r = interp(v.vx, v.vy, FS)
        // console.log('IY: interp', 'v.vx', v.vx, 'v.vy', v.vy, 'FS', FS)
        // console.log('IY: interp', 'r', r)
        if (get(r, 'err')) {
            return r.err
        }
        return r
    })
    // console.log('IY: volumetricStrains', volumetricStrains)

    //因數化時較大FS之線段貼太近, 可能會在較大FS計算當前N172對體積應變曲線時出現非遞減問題, 並導致無法內插, 故得先剔除非遞減數據
    let volumetricStrainsNewMax = volumetricStrains[0] //使用第1點
    let volumetricStrainsNew = [volumetricStrains[0]]
    let N172sNew = [N172s[0]]
    each(volumetricStrains, (v, k) => {
        if (k > 0) {
            if (volumetricStrains[k] <= volumetricStrainsNewMax) { //volumetricStrains比上個儲存值還小或等於就push, N變大volumetricStrain變小
                volumetricStrainsNewMax = volumetricStrains[k]
                volumetricStrainsNew.push(volumetricStrains[k])
                N172sNew.push(N172s[k])
            }
        }
    })
    volumetricStrains = volumetricStrainsNew
    N172s = N172sNew

    //volumetricStrain
    let volumetricStrain = interp(N172s, volumetricStrains, N172)
    if (get(volumetricStrain, 'err')) {
        // console.log('IY: r', volumetricStrain)

        if (volumetricStrain.err === 'out of x-range') {

            //ps, interp1內部會排序x必定為遞增, 且為有效數據(至少2點)
            let ps = volumetricStrain.data.ps
            // console.log('ps', ps)

            let N172Max = max(N172s)
            let N172Min = min(N172s)
            // console.log('IY: N172Max', N172Max)
            // console.log('IY: N172Min', N172Min)
            if (N172 > N172Max) {
                let vstr = ps[size(ps) - 1].y //x為遞增, 故最後1點y為最小體積應變
                err.push(`出現外插情形 N172=${N172} > N172Max=${N172Max}，依照FS=${FS}並給予最小體積應變vstr=${vstr}%`)
                volumetricStrain = vstr
            }
            else if (N172 < N172Min) {
                let vstr = interExtraPolate(ps[0], ps[1], N172)
                err.push(`出現外插情形 N172=${N172} < N172Min=${N172Min}，依照FS=${FS}並依據最近2點外插體積應變vstr=${vstr}%`)
                volumetricStrain = vstr
            }
            else {
                err.push(`非預期外插情形，請洽開發者修復問題`)
                volumetricStrain = ''
            }

        }
        else {
            err.push(volumetricStrain.err)
            volumetricStrain = ''
        }

    }

    return {
        err,
        vstr: volumetricStrain,
    }
}


function sptSettlement(N160, N172, CSR, FS) {
    let err = []
    //原本已考慮FS<1的沉陷，另考慮FS>=1的沉陷，此會包括了液化過程中因為超額孔隙抬升(但未達液化)期間之排水變形，代表完整考慮液化過程沉陷(不強調液化後沉陷) (2020/02/04)

    //sptVolumetricStrainTokimatsuAndSeed
    let vstrTS = 0
    function TS() {

        //check
        if (CSR < 0) {
            err.push(`Volumetric Strain(Tokimatsu And Seed): CSR${brk(CSR)}<0`)
            vstrTS = ''
            return //清空vstr並強制跳出
        }

        //CSR最高0.6
        if (CSR > 0.6) {
            err.push(`Volumetric Strain(Tokimatsu And Seed): CSR大於0.6超過原研究範疇，強制改為0.6`)
            CSR = 0.6
        }

        //vstrTS
        vstrTS = sptVolumetricStrainTokimatsuAndSeed(N160, CSR)

        //add err, 有可能算出值但提示錯誤, 故不能清空vstr
        if (size(vstrTS.err) > 0) {
            each(vstrTS.err, (v) => {
                err.push(`Volumetric Strain(Tokimatsu And Seed): ${v}`)
            })
        }

        //save vstr
        vstrTS = vstrTS.vstr

    }
    TS()

    //sptVolumetricStrainIshiharaAndYoshimine
    let vstrIY = 0
    function IY() {

        //check
        if (FS < 0) {
            err.push(`Volumetric Strain(Ishihara And Yoshimine): FS${brk(FS)}<0`)
            vstrIY = ''
            return //清空vstr並強制跳出
        }

        //FS最高2
        if (FS >= 2) {
            //不提示超過原研究範疇訊息
            FS = 2
        }

        //vstrIY
        vstrIY = sptVolumetricStrainIshiharaAndYoshimine(N172, FS)

        //add err, 有可能算出值但提示錯誤, 故不能清空vstr
        if (size(vstrIY.err) > 0) {
            each(vstrIY.err, (v) => {
                err.push(`Volumetric Strain(Ishihara And Yoshimine): ${v}`)
            })
        }

        //save vstr
        vstrIY = vstrIY.vstr

    }
    IY()

    return {
        err,
        vstrTS,
        vstrIY,
    }
}


/**
 * Seed液化分析
 *
 * @memberOf w-geo
 * @param {Object} row 輸入數據物件
 * @param {String} [row.noLiqueMode='new'] 輸入判斷非液化之土壤分類模式字串，預設'new'
 * @param {Number} [row.waterLevelDesign=0] 輸入設計地下水位數字，單位m，預設0
 * @param {String} [row.soilClassification='SW'] 輸入USCS土壤分類字串，預設'SW'
 * @param {Number} row[keyDepth] 輸入樣本所在中點深度數字，單位m
 * @param {Number} row.N60 輸入樣本N60數字
 * @param {Number} row.FC 輸入樣本細粒料含量數字，單位%
 * @param {Number} row.sv 輸入樣本中點深度之垂直總應力數字，單位(kN/m2)
 * @param {Number} row.svpUsual 輸入樣本中點深度之常時垂直有效應力數字，單位(kN/m2)
 * @param {Number} row.svpDesign 輸入樣本中點深度之設計垂直有效應力數字，係考慮waterLevelDesign計算而得，單位(kN/m2)
 * @param {Number} row.PGA 輸入設計地表最大水平加速度數字，單位(g)
 * @param {Number} row.Mw 輸入設計地震矩規模數字
 * @returns {Object} 回傳計算後數據物件
 * @example
 */
function sptSeed({ noLiqueMode = 'new', waterLevelDesign, soilClassification, depth, N60, FC, sv, svpUsual, svpDesign, PGA, Mw }) {
    //Seed et al.(1985)
    let err = []
    let MSF = ''
    let rrd = ''
    // let dN160 = ''
    let CN = ''
    let N160 = ''
    let N172 = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    let vstrTS = ''
    let vstrIY = ''

    function ret() {
        let r = { rrd, CN, N160, N172, CRR75, CRR, CSR, FS, vstrTS, vstrIY, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check noLiqueMode
        if (noLiqueMode !== 'new' && noLiqueMode !== 'classic') {
            err.push(`noLiqueMode${brk(noLiqueMode)}非'new'或'classic'，強制預設為'new'`)
            noLiqueMode = 'new'
        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //check soilClassification, 暫時用統一土壤分類區分 2021/05/07
        if (!isestr(soilClassification)) {
            err.push(`soilClassification${brk(soilClassification)}非有效字串，強制預設為SW`) //可在配合N60一併檢查才強制給SW
            soilClassification = 'SW'
        }
        //soilClassification = cstr(soilClassification)

        //非液化: 地下水位以上, 統一土壤分類屬黏土
        if (depth < waterLevelDesign || isNoLiqueByUSCS(soilClassification, noLiqueMode)) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check N60
        if (!isnum(N60)) {
            err.push(`N60${brk(N60)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            N60 = cdbl(N60)

            //check
            if (N60 < 0) {
                err.push(`N60${brk(N60)}<0`)
                delayErr = true
            }

            //非液化: N值>=50
            if (N60 >= 50) {
                noLique = true
            }

        }

        //check FC
        if (!isnum(FC)) {
            err.push(`FC${brk(FC)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            FC = cdbl(FC)

            //check
            if (FC < 0) {
                err.push(`FC${brk(FC)}<0`)
                delayErr = true
            }

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //MSF, 規模修正因子
    MSF = (Mw / 7.5) ** (-1.11) //投影片資料

    //rrd, 應力折減係數, 公式出自土壤液化條文修訂
    rrd = (1 - 0.4113 * depth ** 0.5 + 0.04052 * depth + 0.001753 * depth ** 1.5) / (1 - 0.4177 * depth ** 0.5 + 0.05729 * depth - 0.006205 * depth ** 1.5 + 0.00121 * depth ** 2)

    let Pa = cnst.Pa * 1000 //大氣壓(kPa), MPa -> kPa
    CN = Math.min(Math.sqrt(Pa / svpUsual), 1.7)
    N160 = CN * N60 //N60通過有效覆土應力修正為N160

    // function coe(i) {
    //     let d = [
    //         NaN,
    //         0.000000020444444,
    //         -0.000001733333333,
    //         0.000056777777778,
    //         -0.000890000000000,
    //         0.006667777777777,
    //         -0.008166666666665,
    //         -0.000000000000004
    //     ]
    //     return d[i]
    // }

    // if (FC <= 10) {
    //     dN160 = 0
    // }
    // else {
    //     dN160 = 0.224 * FC - 2.24
    // }

    // let sN160 = N160 + dN160
    // sN160 = Math.min(sN160, 30) //由修正(含FC)可算得CRR75, 曲線待改重新回歸
    // CRR75 = coe(1) * sN160 ** 6 + coe(2) * sN160 ** 5 + coe(3) * sN160 ** 4 + coe(4) * sN160 ** 3 + coe(5) * sN160 ** 2 + coe(6) * sN160 + coe(7)

    //ps
    let ps = [
        {
            FC: 5,
            data: [ //0為N160, 1為CRR75
                [0, 0.0496622],
                [2.65306, 0.0547297],
                [4.38776, 0.0628378],
                [6.02041, 0.0719595],
                [7.55102, 0.0831081],
                [8.97959, 0.100338],
                [10.5102, 0.114527],
                [12.2449, 0.131757],
                [13.5714, 0.146959],
                [14.7959, 0.161149],
                [16.1224, 0.177365],
                [17.7551, 0.193581],
                [19.1837, 0.211824],
                [20.7143, 0.232095],
                [22.0408, 0.248311],
                [23.2653, 0.265541],
                [24.5918, 0.285811],
                [25.6122, 0.307095],
                [26.4286, 0.327365],
                [27.2449, 0.347635],
                [27.9592, 0.372973],
                [28.3673, 0.398311],
                [28.7755, 0.423649],
                [28.9796, 0.444932],
                [29.2857, 0.473311],
                [29.3, 0.6],
                [100, 100],
            ],
        },
        {
            FC: 15,
            data: [ //0為N160, 1為CRR75
                [0, 0.065],
                [1.63265, 0.068],
                [2.85714, 0.074],
                [3.87755, 0.082],
                [5.10204, 0.0932432],
                [6.22449, 0.110473],
                [7.44898, 0.123649],
                [8.57143, 0.136824],
                [9.69388, 0.151014],
                [10.9184, 0.164189],
                [11.9388, 0.178378],
                [13.0612, 0.192568],
                [13.8776, 0.203716],
                [14.6939, 0.214865],
                [16.1224, 0.232095],
                [17.551, 0.251351],
                [18.5714, 0.270608],
                [19.898, 0.288851],
                [20.7143, 0.308108],
                [21.4286, 0.327365],
                [22.0408, 0.347635],
                [22.449, 0.370946],
                [22.8571, 0.393243],
                [23.2653, 0.417568],
                [23.6735, 0.439865],
                [23.9796, 0.460135],
                [24.05, 0.483446],
                [24.0816, 0.515878],
                [24.1, 0.6],
                [100, 101],
            ],
        },
        {
            FC: 35,
            data: [ //0為N160, 1為CRR75
                [0, 0.075],
                [1.32653, 0.082],
                [2.44898, 0.09],
                [3.26531, 0.0962838],
                [4.79592, 0.116554],
                [6.22449, 0.134797],
                [7.34694, 0.152027],
                [8.87755, 0.171284],
                [10.102, 0.185473],
                [11.4286, 0.20777],
                [13.2653, 0.228041],
                [14.5918, 0.247297],
                [15.7143, 0.267568],
                [16.7347, 0.287838],
                [17.7551, 0.313176],
                [18.6735, 0.343581],
                [19.1837, 0.364865],
                [19.6939, 0.382095],
                [20.102, 0.410473],
                [20.4082, 0.433784],
                [20.5102, 0.464189],
                [20.7143, 0.490541],
                [20.9184, 0.519932],
                [20.92, 0.6],
                [100, 102],
            ],
        },
    ]

    //FCs
    let FCs = map(ps, 'FC')

    //data to xy
    ps = map(ps, (v) => {
        let vx = map(v.data, (vv) => {
            return vv[0] //N160
        })
        let vy = map(v.data, (vv) => {
            return vv[1] //CRR75
        })
        v.vx = vx
        v.vy = vy
        return v
    })
    // console.log('Seed: ps', ps)

    let CRR75s = map(ps, (v) => {
        let r = interp(v.vx, v.vy, N160)
        // console.log('Seed: interp', 'v.vx', v.vx, 'v.vy', v.vy, 'N160', N160)
        // console.log('Seed: interp', 'r', r)
        if (get(r, 'err')) {
            return r.err
        }
        return r
    })

    //CRR75
    CRR75 = interp(FCs, CRR75s, FC)

    //check
    if (get(CRR75, 'err')) {
        // throw new Error(`內插CRR75出現錯誤: ${CRR75.err}`)

        if (CRR75.err === 'out of x-range') {

            //ps, interp1內部會排序x必定為遞增, 且為有效數據(至少2點)
            let ps = CRR75.data.ps
            // console.log('ps', ps)

            let FCMax = max(FCs)
            let FCMin = min(FCs)
            // console.log('Seed: FCMax', FCMax)
            // console.log('Seed: FCMin', FCMin)
            if (FC > FCMax) {
                CRR75 = interExtraPolate(ps[size(ps) - 2], ps[size(ps) - 1], FC)
                // console.log('FC > FCMax: interExtraPolate','ps[size(ps) - 2]',ps[size(ps) - 2], 'ps[size(ps) - 1]',ps[size(ps) - 1], 'FC',FC,'CRR75',CRR75)
                err.push(`出現外插情形 FC=${FC} > FCMax=${FCMax}，依據最近2點外插CRR75=${CRR75}`)
            }
            else if (FC < FCMin) {
                CRR75 = interExtraPolate(ps[0], ps[1], FC)
                // console.log('FC < FCMin: interExtraPolate','ps[0]',ps[0], 'ps[1]',ps[1], 'FC',FC,'CRR75',CRR75)
                CRR75 = Math.max(CRR75, 0) //若FC往小方向外插有可能出現負CRR75, 故需取最小值0
                err.push(`出現外插情形 FC=${FC} < FCMin=${FCMin}，依據最近2點外插CRR75=${CRR75}`)
            }
            else {
                err.push(`非預期外插情形，請洽開發者修復問題`)
                CRR75 = ''
                return ret() //重大錯誤直接報錯結束
            }

        }
        else {
            err.push(CRR75.err)
            CRR75 = ''
            return ret() //重大錯誤直接報錯結束
        }

    }

    //check
    if (!isNumber(CRR75)) {
        err.push(`CRR75${brk(CRR75)}非數字`)
        return ret() //重大錯誤直接報錯結束
    }
    if (CRR75 > 0.6) {
        err.push(`CRR75${brk(CRR75)}大於0.6超過原研究範疇，強制改為0.6`)
        CRR75 = 0.6
    }

    //CRR
    CRR = CRR75 * MSF
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * (sv / svpDesign) * PGA * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    //N172
    N172 = N160 / (72 / 60) //修正鑽桿能量(打擊能量比ER)至72%

    //sptSettlement
    let slt = sptSettlement(N160, N172, CSR, FS)
    err = [...err, ...slt.err]
    vstrTS = slt.vstrTS
    vstrIY = slt.vstrIY

    return ret()
}


/**
 * HBF液化分析
 *
 * @memberOf w-geo
 * @param {Object} row 輸入數據物件
 * @param {String} [row.ver='2012'] 輸入版本字串，預設'2012'
 * @param {String} [row.noLiqueMode='new'] 輸入判斷非液化之土壤分類模式字串，預設'new'
 * @param {Number} [row.waterLevelDesign=0] 輸入設計地下水位數字，單位m，預設0
 * @param {String} [row.soilClassification='SW'] 輸入USCS土壤分類字串，預設'SW'
 * @param {Number} row[keyDepth] 輸入樣本所在中點深度數字，單位m
 * @param {Number} row.N60 輸入樣本N60數字
 * @param {Number} row.FC 輸入樣本細粒料含量數字，單位%
 * @param {Number} row.PI 輸入塑性指數數字，單位%
 * @param {Number} row.sv 輸入樣本中點深度之垂直總應力數字，單位(kN/m2)
 * @param {Number} row.svpUsual 輸入樣本中點深度之常時垂直有效應力數字，單位(kN/m2)
 * @param {Number} row.svpDesign 輸入樣本中點深度之設計垂直有效應力數字，係考慮waterLevelDesign計算而得，單位(kN/m2)
 * @param {Number} row.PGA 輸入設計地表最大水平加速度數字，單位(g)
 * @param {Number} row.Mw 輸入設計地震矩規模數字
 * @returns {Object} 回傳計算後數據物件
 * @example
 */
function sptHBF({ ver = '2012', noLiqueMode = 'new', waterLevelDesign, soilClassification, depth, N60, FC, PI, sv, svpUsual, svpDesign, PGA, Mw }) {
    //HBF(ver=2012,2017)
    let err = []
    let MSF = ''
    let rrd = ''
    let ks = ''
    let CN = ''
    let N160 = ''
    let N160cs = ''
    let N172 = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    let vstrTS = ''
    let vstrIY = ''

    function ret() {
        let r = { rrd, ks, CN, N160, N160cs, N172, CRR75, CRR, CSR, FS, vstrTS, vstrIY, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check ver
        if (ver !== '2012' && ver !== '2017') {
            err.push(`ver${brk(ver)}非2012或2017`)
            return ret() //重大錯誤直接報錯結束
        }

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check noLiqueMode
        if (noLiqueMode !== 'new' && noLiqueMode !== 'classic') {
            err.push(`noLiqueMode${brk(noLiqueMode)}非'new'或'classic'，強制預設為'new'`)
            noLiqueMode = 'new'
        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //check soilClassification, 暫時用統一土壤分類區分 2021/05/07
        if (!isestr(soilClassification)) {
            err.push(`soilClassification${brk(soilClassification)}非有效字串，強制預設為SW`) //可在配合N60一併檢查才強制給SW
            soilClassification = 'SW'
        }
        //soilClassification = cstr(soilClassification)

        //非液化: 地下水位以上, 統一土壤分類屬黏土, (N160cs>=39, 於後面檢查)
        if (depth < waterLevelDesign || isNoLiqueByUSCS(soilClassification, noLiqueMode)) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check PI為NP, 不需阿太堡時，預設樣品PI、LL位於塑性圖Aline以下，並隸屬於ML(LL<50)，此時使用PI=0、LL=40
        if (trim(cstr(PI)) === 'NP') {
            PI = 0
        }

        //非液化: 新規範「第十一章_耐震設計規範之土壤液化修訂條文」中訂立PI值>7為非液化 2021/02/04
        if (!isnum(PI)) {
            err.push(`PI${brk(PI)}非數字與非NP，強制略過部份非液化條件檢核`) //經與所方的討論，傾向不管排除條件，能算的都算還是照算，不然孔數會不符合密度需求 2021/05/21
        }
        else {
            if (cdbl(PI) > 7) { //PI單位(%)
                noLique = true
            }
        }

        //check N60
        if (!isnum(N60)) {
            err.push(`N60${brk(N60)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            N60 = cdbl(N60)

            //check
            if (N60 < 0) {
                err.push(`N60${brk(N60)}<0`)
                delayErr = true
            }

            //非液化: N值>=50
            if (N60 >= 50) {
                noLique = true
            }

        }

        //check FC
        if (!isnum(FC)) {
            err.push(`FC${brk(FC)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            FC = cdbl(FC)

            //check
            if (FC < 0) {
                err.push(`FC${brk(FC)}<0`)
                delayErr = true
            }

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //MSFPow, 原莊長賢excel內MSFPow=-1.11
    let MSFPow = null
    if (ver === '2012') {
        MSFPow = -3.3 //國震提供投影片HBF(2012)為-3.3
    }
    else if (ver === '2017') {
        MSFPow = -1.8 //-1.8為「依據2016土壤液化評估方法研討會結論後修正」, 依照「楊智堯_臺中市中級土壤液化潛勢地圖製作與系統說明.pdf」標注此為2017版
    }

    //MSF, 規模修正因子
    MSF = (Mw / 7.5) ** (MSFPow)

    //rrd, 應力折減係數
    if (depth <= 10) {
        rrd = 1 - 0.01 * depth
    }
    else {
        rrd = 1.2 - 0.03 * depth
    }

    if (FC <= 10) {
        ks = 1.0
    }
    else {
        //ks = -0.00009 * FC ** 2 + 0.0168 * FC + 0.841 //HBF早期版
        ks = 1 + 0.07 * Math.sqrt(FC - 10) //投影片公式
    }
    let Pa = cnst.Pa * 1000 //大氣壓(kPa), MPa -> kPa
    CN = Math.min(Math.sqrt(Pa / svpUsual), 1.7)
    N160 = CN * N60 //N60通過有效覆土應力修正為N160
    N160cs = ks * N160

    //非液化: (地下水位以上, 統一土壤分類屬黏土, 已於前面檢查), N160cs>=39
    if (N160cs >= 39) {
        // err = [] //第二階段不清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //已於while區塊外, 無錯誤並結束
    }

    //CRR75
    CRR75 = 0.08 + 0.0035 * N160cs / (1 - N160cs / 39)

    //CRR
    CRR = CRR75 * MSF
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * (sv / svpDesign) * PGA * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    //N172
    N172 = N160 / (72 / 60) //修正鑽桿能量(打擊能量比ER)至72%

    //sptSettlement
    let slt = sptSettlement(N160, N172, CSR, FS)
    err = [...err, ...slt.err]
    vstrTS = slt.vstrTS
    vstrIY = slt.vstrIY

    return ret()
}


/**
 * NCEER液化分析
 *
 * @memberOf w-geo
 * @param {Object} row 輸入數據物件
 * @param {String} [row.noLiqueMode='new'] 輸入判斷非液化之土壤分類模式字串，預設'new'
 * @param {Number} [row.waterLevelDesign=0] 輸入設計地下水位數字，單位m，預設0
 * @param {String} [row.soilClassification='SW'] 輸入USCS土壤分類字串，預設'SW'
 * @param {Number} row[keyDepth] 輸入樣本所在中點深度數字，單位m
 * @param {Number} row.N60 輸入樣本N60數字
 * @param {Number} row.FC 輸入樣本細粒料含量數字，單位%
 * @param {Number} row.PI 輸入塑性指數數字，單位%
 * @param {Number} row.sv 輸入樣本中點深度之垂直總應力數字，單位(kN/m2)
 * @param {Number} row.svpUsual 輸入樣本中點深度之常時垂直有效應力數字，單位(kN/m2)
 * @param {Number} row.svpDesign 輸入樣本中點深度之設計垂直有效應力數字，係考慮waterLevelDesign計算而得，單位(kN/m2)
 * @param {Number} row.PGA 輸入設計地表最大水平加速度數字，單位(g)
 * @param {Number} row.Mw 輸入設計地震矩規模數字
 * @returns {Object} 回傳計算後數據物件
 * @example
 */
function sptNCEER({ noLiqueMode = 'new', waterLevelDesign, soilClassification, depth, N60, FC, sv, svpUsual, svpDesign, PGA, Mw }) {
    //NCEER(1997)
    let err = []
    let MSF = ''
    let rrd = ''
    let alpha = ''
    let beta = ''
    let CN = ''
    let N160 = ''
    let N160cs = ''
    let N172 = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    let vstrTS = ''
    let vstrIY = ''

    function ret() {
        let r = { rrd, alpha, beta, CN, N160, N160cs, N172, CRR75, CRR, CSR, FS, vstrTS, vstrIY, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check noLiqueMode
        if (noLiqueMode !== 'new' && noLiqueMode !== 'classic') {
            err.push(`noLiqueMode${brk(noLiqueMode)}非'new'或'classic'，強制預設為'new'`)
            noLiqueMode = 'new'
        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //check soilClassification, 暫時用統一土壤分類區分 2021/05/07
        if (!isestr(soilClassification)) {
            err.push(`soilClassification${brk(soilClassification)}非有效字串，強制預設為SW`) //可在配合N60一併檢查才強制給SW
            soilClassification = 'SW'
        }
        //soilClassification = cstr(soilClassification)

        //非液化: 地下水位以上, 統一土壤分類屬黏土, (N160cs>=30, 於後面處理)
        if (depth < waterLevelDesign || isNoLiqueByUSCS(soilClassification, noLiqueMode)) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check N60
        if (!isnum(N60)) {
            err.push(`N60${brk(N60)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            N60 = cdbl(N60)

            //check
            if (N60 < 0) {
                err.push(`N60${brk(N60)}<0`)
                delayErr = true
            }

            //非液化: N值>=50
            if (N60 >= 50) {
                noLique = true
            }

        }

        //check FC
        if (!isnum(FC)) {
            err.push(`FC${brk(FC)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            FC = cdbl(FC)

            //check
            if (FC < 0) {
                err.push(`FC${brk(FC)}<0`)
                delayErr = true
            }

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //MSF, 規模修正因子
    MSF = (Mw / 7.5) ** (-2.56)

    //rrd, 應力折減係數
    rrd = (1 - 0.4113 * depth ** 0.5 + 0.04052 * depth + 0.001753 * depth ** 1.5) / (1 - 0.4177 * depth ** 0.5 + 0.05729 * depth - 0.006205 * depth ** 1.5 + 0.00121 * depth ** 2)

    if (FC <= 5) {
        alpha = 0
    }
    else if (FC <= 35) {
        alpha = Math.exp(1.76 - 190 / FC ** 2)
    }
    else {
        alpha = 5
    }
    if (FC <= 5) {
        beta = 1
    }
    else if (FC <= 35) {
        beta = 0.99 + (FC ** 1.5) / 1000
    }
    else {
        beta = 1.2
    }

    let Pa = cnst.Pa * 1000 //大氣壓(kPa), MPa -> kPa
    CN = Math.min(Math.sqrt(Pa / svpUsual), 1.7)
    N160 = CN * N60 //N60通過有效覆土應力修正為N160
    N160cs = alpha + beta * N160

    //非液化: (地下水位以上, 統一土壤分類屬黏土, 已於前面處理), N160cs>=30
    if (N160cs >= 30) {
        // err = [] //第二階段不清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //已於while區塊外, 無錯誤並結束
    }

    //CRR75
    let a = 4.844e-2
    let b = -1.248e-1
    let c = -4.721e-3
    let d = 9.578e-3
    let e = 6.136e-4
    let f = -3.285e-4
    let g = -1.673e-5
    let h = 3.714e-6
    CRR75 = (a + c * N160cs + e * N160cs ** 2 + g * N160cs ** 3) / (1 + b * N160cs + d * N160cs ** 2 + f * N160cs ** 3 + h * N160cs ** 4)

    //CRR
    CRR = CRR75 * MSF
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * (sv / svpDesign) * PGA * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    //N172
    N172 = N160 / (72 / 60) //修正鑽桿能量(打擊能量比ER)至72%

    //sptSettlement
    let slt = sptSettlement(N160, N172, CSR, FS)
    err = [...err, ...slt.err]
    vstrTS = slt.vstrTS
    vstrIY = slt.vstrIY

    return ret()
}


/**
 * JRA液化分析
 *
 * @memberOf w-geo
 * @param {Object} row 輸入數據物件
 * @param {String} [row.ver='1996'] 輸入版本字串，預設'1996'
 * @param {String} [row.noLiqueMode='new'] 輸入判斷非液化之土壤分類模式字串，預設'new'
 * @param {Number} [row.waterLevelDesign=0] 輸入設計地下水位數字，單位m，預設0
 * @param {String} [row.soilClassification='SW'] 輸入USCS土壤分類字串，預設'SW'
 * @param {Number} [row.vibrationType=1] 輸入震動形式數字，1為第一型震動[板塊邊界地震(遠震)]，2為第二型震動[內陸直下型地震(近震)]，預設1
 * @param {Number} row[keyDepth] 輸入樣本所在中點深度數字，單位m
 * @param {Number} row.N60 輸入樣本N60數字
 * @param {Number} row.FC 輸入樣本細粒料含量數字，單位%
 * @param {Number} row.PI 輸入塑性指數數字，單位%
 * @param {Number} row.D50 輸入累計50%通過粒徑數字，單位mm
 * @param {Number} row.D10 輸入累計10%通過粒徑數字，單位mm
 * @param {Number} row.sv 輸入樣本中點深度之垂直總應力數字，單位(kN/m2)
 * @param {Number} row.svpUsual 輸入樣本中點深度之常時垂直有效應力數字，單位(kN/m2)
 * @param {Number} row.svpDesign 輸入樣本中點深度之設計垂直有效應力數字，係考慮waterLevelDesign計算而得，單位(kN/m2)
 * @param {Number} row.PGA 輸入設計地表最大水平加速度數字，單位(g)
 * @returns {Object} 回傳計算後數據物件
 * @example
 */
function sptNJRA({ ver = '1996', noLiqueMode = 'new', waterLevelDesign, soilClassification, vibrationType, depth, N60, FC, PI, D50, D10, sv, svpUsual, svpDesign, PGA }) {
    //NJRA(ver=1996,2017)
    let err = []
    let rrd = ''
    let N72 = ''
    let N172 = ''
    let c1 = ''
    let c2 = ''
    let cFC = ''
    let Na = ''
    let RL = ''
    let cw = ''
    let CN = ''
    let N160 = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    let vstrTS = ''
    let vstrIY = ''

    function ret() {
        let r = { rrd, N160, N172, c1, c2, cFC, Na, RL, cw, CN, CRR75, CRR, CSR, FS, vstrTS, vstrIY, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check ver
        if (ver !== '1996' && ver !== '2017') {
            err.push(`ver${brk(ver)} 非1996或2017`)
            return ret() //重大錯誤直接報錯結束
        }

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check noLiqueMode
        if (noLiqueMode !== 'new' && noLiqueMode !== 'classic') {
            err.push(`noLiqueMode${brk(noLiqueMode)}非'new'或'classic'，強制預設為'new'`)
            noLiqueMode = 'new'
        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //check soilClassification, 暫時用統一土壤分類區分 2021/05/07
        if (!isestr(soilClassification)) {
            err.push(`soilClassification${brk(soilClassification)}非有效字串，強制預設為SW`) //可在配合N60一併檢查才強制給SW
            soilClassification = 'SW'
        }
        //soilClassification = cstr(soilClassification)

        //非液化: 非砂或礫質土, 強制視為非液化, 暫時用統一土壤分類區分 2021/05/07
        if (isNoLiqueByUSCS(soilClassification, noLiqueMode)) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check N60
        if (!isnum(N60)) {
            err.push(`N60${brk(N60)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            N60 = cdbl(N60)

            //check
            if (N60 < 0) {
                err.push(`N60${brk(N60)}<0`)
                delayErr = true
            }

            //非液化: N值>=50
            if (N60 >= 50) {
                noLique = true
            }

        }

        //沖積層の土層で、以下の３つの条件のすべてに該当する場合には、地震時に橋に影響を与える液状化が生じる可能性があるため、液状化の判定を行わなければならない。
        //如果在沖積土層中滿足以下所有三個條件，則在地震期間可能會發生影響橋樑的液化，因此必須確定液化。

        //1.地下水位が地表面から10ｍ以内にあり、かつ地表面から20ｍ以内のさに存在する飽和土層
        //1.地下水位距地面10m以內，距地面20m以內的飽和土層

        //2.細粒分含有率FCが35％以下の土層またはFCが35％を超えても塑性指数IPが15以下の土層
        //2.細顆粒含量FC為35％以下的土層，或者FC超過35％但塑性指數IP小於15的土層

        //3.50％粒径Ｄ50が10㎜以下で、かつ10％粒径Ｄ10が１㎜以下である土層
        //3.50％粒徑D50為10mm以下的土層，和10％粒徑D10為1mm以下的土層

        //非液化: 地下水位以上, 地下水低於地表下10m以下, 細料含量>35%且PI值>=15, D50>10mm或D10>1mm
        if (depth < waterLevelDesign || waterLevelDesign > 10) {
            noLique = true
        }

        //check FC
        if (!isnum(FC)) {
            err.push(`FC${brk(FC)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            FC = cdbl(FC)

            //check
            if (FC < 0) {
                err.push(`FC${brk(FC)}<0`)
                delayErr = true
            }
            else if (FC <= 35) { //可能液化
            }
            else { //FC > 35
                //非液化: 地下水位以上, 地下水低於地表下10m以下, 細料含量>35%且PI值>=15, D50>10mm或D10>1mm

                //check PI為NP, 不需阿太堡時，預設樣品PI、LL位於塑性圖Aline以下，並隸屬於ML(LL<50)，此時使用PI=0、LL=40
                if (trim(cstr(PI)) === 'NP') {
                    PI = 0
                }

                //check PI
                if (!isnum(PI)) {
                    err.push(`PI${brk(PI)}非數字與非NP，強制略過部份非液化條件檢核`) //經與所方的討論，傾向不管排除條件，能算的都算還是照算，不然孔數會不符合密度需求 2021/05/21
                }
                else {

                    //cdbl
                    PI = cdbl(PI) //PI單位(%)

                    //check
                    if (PI < 15) {
                        //可能液化, FC超過35％但塑性指數IP小於15的土層
                    }
                    else {
                        noLique = true
                    }

                }

            }

        }

        //check D50
        if (!isnum(D50)) {
            err.push(`D50${brk(D50)}非數字，強制略過部份非液化條件檢核`) //經與所方的討論，傾向不管排除條件，能算的都算還是照算，不然孔數會不符合密度需求 2021/05/21
        }

        //check D10
        if (!isnum(D10)) {
            err.push(`D10${brk(D10)}非數字，強制略過部份非液化條件檢核`) //經與所方的討論，傾向不管排除條件，能算的都算還是照算，不然孔數會不符合密度需求 2021/05/21
        }

        //非液化: 地下水位以上, 地下水低於地表下10m以下, 細料含量>35%且PI值>=15, D50>10mm或D10>1mm
        if (isnum(D50) && isnum(D10)) {

            //cdbl
            D50 = cdbl(D50) //D50單位(mm)
            D10 = cdbl(D10) //D10單位(mm)

            //check
            if (D50 > 10) {
                noLique = true
            }

            //check
            if (D10 > 1) {
                noLique = true
            }

        }

        //check vibrationType
        if (!isnum(vibrationType)) {
            err.push(`vibrationType${brk(vibrationType)}非數字，更改為預設值1`)
            vibrationType = 1
        }
        else {

            //cint
            vibrationType = cint(vibrationType)

            //check
            if (vibrationType !== 1 && vibrationType !== 2) {
                err.push(`vibrationType${brk(vibrationType)}不等於1或2，更改為預設值1`)
                vibrationType = 1
            }

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //rrd, 應力折減係數
    rrd = 1 - 0.015 * depth

    N72 = N60 / (72 / 60) //修正鑽桿能量(打擊能量比ER)至72%
    //let N172 = N72 * 1.7 / (svp + 0.7) //原莊長賢excel使用, 其g值使用10而非9.81
    // let r = 98.134256 //1 kg/cm2 to kPa = 98.134256
    // CN = 170 / (svp * r + 70) //svp需由kg/cm2轉kPa
    CN = 170 / (svpUsual + 70) //svp為kPa故不用轉
    N172 = CN * N72

    //getNaForSand1996
    let getNaForSand1996 = () => {
        let _Na = 0
        if (FC < 10) {
            c1 = 1
        }
        else if (FC < 60) {
            c1 = (FC + 40) / 50
        }
        else {
            c1 = FC / 20 - 1
        }
        if (FC < 10) {
            c2 = 0
        }
        else {
            c2 = (FC - 10) / 18
        }
        _Na = c1 * N172 + c2
        return _Na
    }

    //getNaForSand2017
    let getNaForSand2017 = () => {
        let _Na = 0
        if (FC < 10) {
            cFC = 1
        }
        else if (FC < 40) {
            cFC = (FC + 20) / 30
        }
        else {
            cFC = (FC - 16) / 12
        }
        _Na = cFC * (N172 + 2.47) - 2.47
        return _Na
    }

    //getNa
    let getNa = () => {
        let _Na = 0
        let cty = ''

        //cty
        if (isnum(D50)) {
            if (cdbl(D50) < 2) { //D50單位(mm)
                cty = 'sand'
            }
            else {
                cty = 'gravel'
            }
        }
        else {
            if (isSandByUSCS(soilClassification)) {
                cty = 'sand'
            }
            else if (isGravelByUSCS(soilClassification)) {
                cty = 'gravel'
            }
            else {
                //不是砂或礫質土
            }
        }

        //check
        if (cty !== 'sand' && cty !== 'gravel') {
            err.push(`無法由D50${brk(D50)}或土壤分類${brk(soilClassification)}區分砂或礫石，強制視為砂土`)
            cty = 'sand'
        }

        if (cty === 'sand') {
            if (ver === '1996') {
                _Na = getNaForSand1996()
            }
            else if (ver === '2017') {
                _Na = getNaForSand2017()
            }
        }
        else if (cty === 'gravel') {

            //check
            if (!isnum(D50)) {
                err.push(`因D50${brk(D50)}未給予或非數字，故改使用土壤分類來區分砂或礫質土，卻又被分為礫質土仍需要用D50，故強制設定D50為10(mm)`)
                D50 = 10
            }

            D50 = cdbl(D50)
            _Na = (1 - 0.361 * Math.log10(D50 / 2)) * N172 //D50單位(mm)

        }

        return _Na
    }

    //Na
    Na = getNa()

    //RL
    if (Na < 14) {
        if (ver === '1996') {
            RL = 0.0882 * Math.sqrt(Na / 1.7)
        }
        else if (ver === '2017') {
            RL = 0.0882 * Math.sqrt((0.85 * Na + 2.1) / 1.7)
        }
    }
    else {
        RL = 0.0882 * Math.sqrt(Na / 1.7) + 1.6 * 1e-6 * (Na - 14) ** 4.5
    }

    //cw
    //等級2(レベル2)才會考慮第一、二型震動
    if (vibrationType === 2) { //第二型震動, 內陸直下型地震(近震)
        if (RL <= 0.1) {
            cw = 1
        }
        else if (RL <= 0.4) {
            cw = 3.3 * RL + 0.67
        }
        else {
            cw = 2
        }
    }
    else { //預設第一型震動, 板塊邊界地震(遠震)
        cw = 1
    }

    //CRR
    CRR = cw * RL
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //khc
    let khc = PGA //暫時依照國震建議khc=PGA (2021/02/03)

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = rrd * khc * sv / svpDesign
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    //N160
    N160 = N172 / (60 / 72) //修正鑽桿能量(打擊能量比ER)至60%

    //sptSettlement
    let slt = sptSettlement(N160, N172, CSR, FS)
    err = [...err, ...slt.err]
    vstrTS = slt.vstrTS
    vstrIY = slt.vstrIY

    return ret()
}


/**
 * TY液化分析
 *
 * @memberOf w-geo
 * @param {Object} row 輸入數據物件
 * @param {String} [row.ver='1996'] 輸入版本字串，預設'1996'
 * @param {String} [row.noLiqueMode='new'] 輸入判斷非液化之土壤分類模式字串，預設'new'
 * @param {Number} [row.waterLevelDesign=0] 輸入設計地下水位數字，單位m，預設0
 * @param {String} [row.soilClassification='SW'] 輸入USCS土壤分類字串，預設'SW'
 * @param {Number} [row.vibrationType=1] 輸入震動形式數字，1為第一型震動[板塊邊界地震(遠震)]，2為第二型震動[內陸直下型地震(近震)]，預設1
 * @param {Number} row[keyDepth] 輸入樣本所在中點深度數字，單位m
 * @param {Number} [row.a=0.45] 輸入分析設定參數a數字，預設0.45
 * @param {Number} [row.n=0.45] 輸入分析設定參數n數字，預設14
 * @param {Number} [row.Cr=0.57] 輸入分析設定參數Cr數字，預設0.57
 * @param {Number} [row.Cs=85] 輸入分析設定參數Cs數字，預設85
 * @param {Number} row.N60 輸入樣本N60數字
 * @param {Number} row.FC 輸入樣本細粒料含量數字，單位%
 * @param {Number} row.sv 輸入樣本中點深度之垂直總應力數字，單位(kN/m2)
 * @param {Number} row.svpUsual 輸入樣本中點深度之常時垂直有效應力數字，單位(kN/m2)
 * @param {Number} row.svpDesign 輸入樣本中點深度之設計垂直有效應力數字，係考慮waterLevelDesign計算而得，單位(kN/m2)
 * @param {Number} row.PGA 輸入設計地表最大水平加速度數字，單位(g)
 * @param {Number} row.Mw 輸入設計地震矩規模數字
 * @returns {Object} 回傳計算後數據物件
 * @example
 */
function sptTY({ noLiqueMode = 'new', waterLevelDesign, soilClassification, depth, a, n, Cr, Cs, N60, FC, sv, svpUsual, svpDesign, PGA, Mw }) {
    //TY(1983), N值的鑽桿能量修正原本為80%, 現統一為72% (2021/03/11)
    let err = []
    let rrd = ''
    let N72 = ''
    let N172 = ''
    let dNf = ''
    let Na = ''
    let CN = ''
    let N160 = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    let vstrTS = ''
    let vstrIY = ''

    function ret() {
        let r = { rrd, N160, N172, dNf, Na, CN, CRR75, CRR, CSR, FS, vstrTS, vstrIY, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check noLiqueMode
        if (noLiqueMode !== 'new' && noLiqueMode !== 'classic') {
            err.push(`noLiqueMode${brk(noLiqueMode)}非'new'或'classic'，強制預設為'new'`)
            noLiqueMode = 'new'
        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //check soilClassification, 暫時用統一土壤分類區分 2021/05/07
        if (!isestr(soilClassification)) {
            err.push(`soilClassification${brk(soilClassification)}非有效字串，強制預設為SW`) //可在配合N60一併檢查才強制給SW
            soilClassification = 'SW'
        }
        //soilClassification = cstr(soilClassification)

        //尚無資料, 比照Seed法提供
        //非液化: 地下水位以上, 統一土壤分類屬黏土
        if (depth < waterLevelDesign || isNoLiqueByUSCS(soilClassification, noLiqueMode)) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check N60
        if (!isnum(N60)) {
            err.push(`N60${brk(N60)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            N60 = cdbl(N60)

            //check
            if (N60 < 0) {
                err.push(`N60${brk(N60)}<0`)
                delayErr = true
            }

            //非液化: N值>=50
            if (N60 >= 50) {
                noLique = true
            }

        }

        //check FC
        if (!isnum(FC)) {
            err.push(`FC${brk(FC)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            FC = cdbl(FC)

            //check
            if (FC < 0) {
                err.push(`FC${brk(FC)}<0`)
                delayErr = true
            }

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //a
    if (!isnum(a)) {
        a = 0.45
    }
    a = cdbl(a)

    //n
    if (!isnum(n)) {
        n = 14
    }
    n = cdbl(n)

    //Cr
    if (!isnum(Cr)) {
        Cr = 0.57
    }
    Cr = cdbl(Cr)

    //Cs
    if (!isnum(Cs)) {
        Cs = 85
    }
    Cs = cdbl(Cs)

    //rrd, 應力折減係數
    rrd = 1 - 0.015 * depth

    N72 = N60 / (72 / 60) //修正鑽桿能量(打擊能量比ER)至72%
    // let r = 98.134256 //1 kg/cm2 to kPa = 98.134256
    // CN = 170 / (svp * r + 70) //svp需由kg/cm2轉kPa
    CN = 170 / (svpUsual + 70) //svp為kPa故不用轉
    N172 = CN * N72
    if (FC <= 5) {
        dNf = 0
    }
    else if (FC <= 10) {
        dNf = FC - 5
    }
    else {
        dNf = 0.1 * FC + 4
    }
    Na = N172 + dNf

    //CRR
    CRR = a * Cr * (16 * Math.sqrt(Na) / 100 + (16 * Math.sqrt(Na) / Cs) ** n)
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.1 * (Mw - 1) * PGA * (sv / svpDesign) * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    //N160
    N160 = N172 / (60 / 72) //修正鑽桿能量(打擊能量比ER)至60%

    //sptSettlement
    let slt = sptSettlement(N160, N172, CSR, FS)
    err = [...err, ...slt.err]
    vstrTS = slt.vstrTS
    vstrIY = slt.vstrIY

    return ret()
}


function cptCommon(depth, coe_a, qc, fs, u2, sv, svpUsual, useCnLeq) {

    //u0(MPa), 現地孔隙壓力
    let u0 = intrpDefPp(depth, 'MPa') //u0(MPa)

    //CPT分析
    let rc = null
    if (true) {

        //轉換單位成為MPa
        let _sv = sv / 1000 //kPa -> MPa
        let _svpUsual = svpUsual / 1000 //kPa -> MPa
        // let _svpDesign = svpDesign / 1000 //kPa -> MPa
        let _qc = qc //MPa
        let _fs = fs //MPa
        let _u2 = u2 //MPa
        let _u0 = u0 //MPa

        //dt
        let dt = {
            depth,
            sv: _sv,
            svp: _svpUsual, //使用常時垂直有效應力
            qc: _qc,
            fs: _fs,
            u0: _u0,
            u2: _u2,
        }

        //calcCptCore, 此處限制輸入與輸出皆使用MPa
        rc = calcCptCore(dt, coe_a, { useCnLeq, unitSvSvp: 'MPa' })
        // Ic = get(rc, 'Ic', null)
        // Icn = get(rc, 'Icn', null)

    }

    return rc
}


function cptHBF({ ver = '2012', waterLevelDesign, depth, coe_a, qc, fs, u2, svp, svpUsual, svpDesign, sv, PGA, Mw }) {
    //HBF(ver=2012,2017,2021)
    //若有使用Robertson(1986)之後版本, qc皆視為使用qt(校正後qc)
    let err = []
    let msg = ''
    let rc = {}
    let MSF = ''
    let rrd = ''
    let Ic = ''
    let Icn = ''
    let qt = ''
    let qc1N = ''
    let qc1Ncs = ''
    let Rf = ''
    let Kc = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    // let vstrTS = ''
    // let vstrIY = ''

    function ret() {
        //因經驗公式是與單位有關, 但無法確切定義其單位, 故避免轉換減少爭議
        // if (isnum(qc1N)) {
        //     qc1N = qc1N / 1000 / cvru //kg/cm2 -> MPa
        // }
        // if (isnum(qc1Ncs)) {
        //     qc1Ncs = qc1Ncs / 1000 / cvru //kg/cm2 -> MPa
        // }
        let r = { ...rc, rrd, Ic, Icn, qc1N, Kc, qc1Ncs, CRR75, CRR, CSR, FS, msg, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check ver
        if (ver !== '2012' && ver !== '2017' && ver !== '2021') {
            err.push(`ver${brk(ver)}非2012或2017或2021`)
            return ret() //重大錯誤直接報錯結束
        }

        //check coe_a
        if (!isnum(coe_a)) {
            err.push(`coe_a${brk(coe_a)}非數字，強制預設為0.8`)
            coe_a = 0.8
        }
        else {

            //cdbl
            coe_a = cdbl(coe_a)

        }

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //非液化: 地下水位以上
        if (depth < waterLevelDesign) {
            msg = `判定非液化: 樣本深度[${depth}]位於地下水位[${waterLevelDesign}]之上`
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            msg = `判定非液化: 樣本深度[${depth}]大於20m`
            noLique = true
        }

        //check qc
        if (!isnum(qc)) {
            err.push(`qc${brk(qc)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            qc = cdbl(qc)

            //check
            if (qc < 0) {
                err.push(`qc${brk(qc)}<0`)
                delayErr = true
            }

        }

        //check fs
        if (!isnum(fs)) {
            err.push(`fs${brk(fs)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            fs = cdbl(fs)

            //check
            if (fs < 0) {
                err.push(`fs${brk(fs)}<0`)
                delayErr = true
            }

        }

        //check u2
        if (!isnum(u2)) {
            err.push(`u2${brk(u2)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            u2 = cdbl(u2)

            // //check, 須允許水壓負值
            // if (u2 < 0) {
            //     err.push(`u2${brk(u2)}<0`)
            //     delayErr = true
            // }

        }

        //check svp, 若有svp則直接複寫svpUsual與svpDesign
        if (isnum(svp)) {

            //cdbl
            svp = cdbl(svp)

            //save
            svpUsual = svp
            svpDesign = svp

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //CPT分析
    let useCnLeq = true //HBF法有限制Cn要小於等於1.7, 故得使用useCnLeq=true
    rc = cptCommon(depth, coe_a, qc, fs, u2, sv, svpUsual, useCnLeq)
    // Fr = get(rc, 'Fr', null)
    Ic = get(rc, 'Ic', null)
    Icn = get(rc, 'Icn', null)
    qt = get(rc, 'qt', null)
    // Qt = get(rc, 'Qt', null)
    // Qtn = get(rc, 'Qtn', null)
    Rf = get(rc, 'Rf', null)

    //check
    if (!isnum(qt)) {
        err.push(`qt${brk(qt)}非數字`)
        return ret() //重大錯誤直接報錯結束
    }

    //轉換單位成為kg/cm2
    sv = sv * cvru //kPa -> kg/cm2
    svpUsual = svpUsual * cvru //kPa -> kg/cm2
    svpDesign = svpDesign * cvru //kPa -> kg/cm2
    qt = qt * 1000 * cvru //MPa -> kg/cm2

    //2021版使用Icn檢查砂黏性土
    if (ver === '2021') {

        //useIc
        let useIc = null
        if (useIc === null && isNumber(Icn)) {
            useIc = Icn
        }
        if (useIc === null && isNumber(Ic)) {
            err.push(`無法計算Icn，強制降轉使用Ic`)
            useIc = Ic
        }

        //非液化: 若是useIc大於2.6則判定為非液化, 國震簡訊120期(2021)
        if (useIc > 2.6) {
            // err = [] //第二階段不清除錯誤
            msg = `判定非液化: 判定用Ic[${useIc}]>2.6`
            CRR = '-'
            CSR = '-'
            FS = 10
            return ret() //已於while區塊外, 無錯誤並結束
        }

    }

    //MSFPow, 原莊長賢excel內MSFPow=-1.11
    let MSFPow = null
    if (ver === '2012') {
        MSFPow = -3.3
    }
    else if (ver === '2017' || ver === '2021') {
        MSFPow = -1.8 //-1.8為「依據2016土壤液化評估方法研討會結論後修正」, 依照「楊智堯_臺中市中級土壤液化潛勢地圖製作與系統說明.pdf」標注此為2017版
    }

    //MSF, 規模修正因子
    MSF = (Mw / 7.5) ** (MSFPow)

    //rrd, 應力折減係數
    if (depth <= 10) {
        rrd = 1 - 0.01 * depth
    }
    else {
        rrd = 1.2 - 0.03 * depth
    }

    //qc1N, 單位基於kg/cm2但無法確切定義其單位, 故不給予
    qc1N = 1.7 / (svpUsual + 0.7) * qt //kg/cm2
    // qc1N = 170 / (svpUsual + 70) * qt //kN/m2

    //Kc, 管壁摩擦量對錐尖阻抗qc值之影響係數
    if (Rf <= 0.1) {
        Kc = 1.0
    }
    else {
        Kc = 0.4 * Rf ** 2 - 0.08 * Rf + 1.004
    }

    //qc1Ncs, 單位基於kg/cm2但無法確切定義其單位, 故不給予
    qc1Ncs = Kc * qc1N

    //非液化: 若是qc1Ncs大於180則直接判定為非液化
    if (qc1Ncs >= 180) {
        // err = [] //第二階段不清除錯誤
        msg = `判定非液化: qc1Ncs[${qc1Ncs}]>=180`
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //已於while區塊外, 無錯誤並結束
    }

    //CRR75
    CRR75 = 0.09 + (0.00028 * qc1Ncs) / (1 - qc1Ncs / 180) //基於kg/cm2 //前面檢查qc1Ncs>=180故不會除0

    //CRR
    CRR = CRR75 * MSF
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * PGA * (sv / svpDesign) * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }
    if (FS >= 1) {
        msg = `判定非液化: FS[${FS}]>=1`
    }

    return ret()
}


function cptNCEER({ ver = '1997', waterLevelDesign, depth, coe_a, qc, fs, u2, svp, svpUsual, svpDesign, sv, PGA, Mw }) {
    //NCEER液化研討會(1996)中Robertson利用Robertson(1990)所建立之CPT試驗土壤分類圖表，直接以錐尖阻抗qc及袖管摩擦比Rf為參數，
    //建立土壤行為類型指數Ic(Soil Behavior Type Index)，取代以往以平均粒徑D50來表示細粒料對土壤抗液化能力的影響，
    //建立全CPT法之土壤臨界液化強度曲線，即NCEER(1997)所選用之方法。詳細流程圖可見Robertson and Wride(1998)。
    //若有使用Robertson(1986)之後版本, qc皆視為使用qt(校正後qc)
    let err = []
    let rc = {}
    let MSF = ''
    let rrd = ''
    let Ic = ''
    let Fr = ''
    let qt = ''
    let Qt = ''
    let Qt1n = ''
    let Kc = ''
    let Qt1ncs = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    // let vstrTS = ''
    // let vstrIY = ''

    function ret() {
        if (isnum(Qt1n)) {
            Qt1n = Qt1n / cvru
        }
        if (isnum(Qt1ncs)) {
            Qt1ncs = Qt1ncs / cvru
        }
        let r = { ...rc, rrd, Qt1n, Ic, Kc, Qt1ncs, CRR75, CRR, CSR, FS, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check ver
        if (ver !== '1997') {
            err.push(`ver${brk(ver)}非1997`)
            return ret() //重大錯誤直接報錯結束
        }

        //check coe_a
        if (!isnum(coe_a)) {
            err.push(`coe_a${brk(coe_a)}非數字，強制預設為0.8`)
            coe_a = 0.8
        }
        else {

            //cdbl
            coe_a = cdbl(coe_a)

        }

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //非液化: 地下水位以上
        if (depth < waterLevelDesign) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check qc
        if (!isnum(qc)) {
            err.push(`qc${brk(qc)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            qc = cdbl(qc)

            //check
            if (qc < 0) {
                err.push(`qc${brk(qc)}<0`)
                delayErr = true
            }

        }

        //check fs
        if (!isnum(fs)) {
            err.push(`fs${brk(fs)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            fs = cdbl(fs)

            //check
            if (fs < 0) {
                err.push(`fs${brk(fs)}<0`)
                delayErr = true
            }

        }

        //check u2
        if (!isnum(u2)) {
            err.push(`u2${brk(u2)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            u2 = cdbl(u2)

            // //check, 須允許水壓負值
            // if (u2 < 0) {
            //     err.push(`u2${brk(u2)}<0`)
            //     delayErr = true
            // }

        }

        //check svp, 若有svp則直接複寫svpUsual與svpDesign
        if (isnum(svp)) {

            //cdbl
            svp = cdbl(svp)

            //save
            svpUsual = svp
            svpDesign = svp

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //CPT分析
    let useCnLeq = false //未使用迭代法之Icn或Qtn, 故使用無限制之useCnLeq=false
    rc = cptCommon(depth, coe_a, qc, fs, u2, sv, svpUsual, useCnLeq)
    Fr = get(rc, 'Fr', null)
    Ic = get(rc, 'Ic', null)
    // Icn = get(rc, 'Icn', null)
    qt = get(rc, 'qt', null)
    Qt = get(rc, 'Qt', null)
    // Qtn = get(rc, 'Qtn', null)

    //check
    if (!isnum(qt)) {
        err.push(`qt${brk(qt)}非數字`)
        return ret() //重大錯誤直接報錯結束
    }

    //轉換單位成為kg/cm2
    sv = sv * cvru //kPa -> kg/cm2
    svpUsual = svpUsual * cvru //kPa -> kg/cm2
    svpDesign = svpDesign * cvru //kPa -> kg/cm2
    qt = qt * 1000 * cvru //MPa -> kg/cm2

    //MSF, 規模修正因子
    MSF = (Mw / 7.5) ** (-2.56)

    //rrd, 應力折減係數
    rrd = (1 - 0.4113 * depth ** 0.5 + 0.04052 * depth + 0.001753 * depth ** 1.5) / (1 - 0.4177 * depth ** 0.5 + 0.05729 * depth - 0.006205 * depth ** 1.5 + 0.00121 * depth ** 2)

    //Q(none)
    // let Q = null
    // if (svpUsual > 0) {
    //     Q = (qt - sv) / svpUsual
    // }
    // else {
    //     Q = 1e20
    // }
    let Q = Qt

    //F(%)
    // let F = (fs / (qt - sv)) * 100
    let F = Fr

    //Qt1n(none), Ic(none), 有另外計算Ic
    let Ict = Math.sqrt((3.47 - Math.log10(Q)) ** 2 + (Math.log10(F) + 1.22) ** 2)
    if (Ict <= 2.6) {
        let Pa = cnst.Pa * 1000 //大氣壓(kPa), MPa -> kPa
        Pa = Pa * cvru //kPa -> kg/cm2
        if (svpUsual > 0) {
            Qt1n = (qt / Pa) * (Pa / svpUsual) ** 0.5
        }
        else {
            Qt1n = 1e20
        }
        let _Ict = Math.sqrt((3.47 - Math.log10(Qt1n)) ** 2 + (Math.log10(F) + 1.22) ** 2)
        if (_Ict <= 2.6) {
            Ic = _Ict
        }
        else {
            if (svpUsual > 0) {
                Qt1n = (qt / Pa) * (Pa / svpUsual) ** 0.75
            }
            else {
                Qt1n = 1e20
            }
            Ic = Math.sqrt((3.47 - Math.log10(Qt1n)) ** 2 + (Math.log10(F) + 1.22) ** 2)
        }
    }
    else {
        Qt1n = Q
        Ic = Ict
    }

    //非液化: 若是Ic大於等於2.6則須使用其他判斷準則, 或判定為非液化
    if (Ic >= 2.6) {
        // err = [] //第二階段不清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //已於while區塊外, 無錯誤並結束
    }

    //Kc
    if (Ic <= 1.64) {
        Kc = 1.0
    }
    else { //1.64<Ic<2.6
        Kc = -0.403 * Ic ** 4 + 5.581 * Ic ** 3 - 21.63 * Ic ** 2 + 33.75 * Ic - 17.88
        if (Ic < 2.36 && F < 0.5) {
            Kc = 1.0
        }
    }

    //Qt1ncs(none)
    Qt1ncs = Kc * Qt1n

    //非液化: 若Qt1ncs大於160(none)則直接判定為非液化
    if (Qt1ncs >= 160) {
        // err = [] //第二階段不清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //已於while區塊外, 無錯誤並結束
    }

    //CRR75
    CRR75 = null
    if (Qt1ncs < 50) {
        CRR75 = 0.833 * (Qt1ncs / 1000) + 0.05
    }
    else { //50<=Qt1ncs<160
        CRR75 = 93 * (Qt1ncs / 1000) ** 3 + 0.08
    }

    //CRR
    CRR = CRR75 * MSF
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * PGA * (sv / svpDesign) * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    return ret()
}


function cptRobertson({ ver = '2009', waterLevelDesign, depth, coe_a, qc, fs, u2, svp, svpUsual, svpDesign, sv, tou_s, su, PGA, Mw }) {
    //若有使用Robertson(1986)之後版本, qc皆視為使用qt(校正後qc)
    let err = []
    let rc = {}
    let MSF = ''
    let rrd = ''
    let Kc = ''
    let Kalpha = ''
    let Fr = ''
    let Ic = ''
    let Icn = ''
    let qt = ''
    let Qt = ''
    let Qtn = ''
    let Qtncs = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    // let vstrTS = ''
    // let vstrIY = ''

    function ret() {
        let r = { ...rc, rrd, Kc, Kalpha, Fr, Ic, Icn, Qt, Qtn, Qtncs, CRR75, CRR, CSR, FS, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check ver
        if (ver !== '2009') {
            err.push(`ver${brk(ver)}非2009`)
            return ret() //重大錯誤直接報錯結束
        }

        //check coe_a
        if (!isnum(coe_a)) {
            err.push(`coe_a${brk(coe_a)}非數字，強制預設為0.8`)
            coe_a = 0.8
        }
        else {

            //cdbl
            coe_a = cdbl(coe_a)

        }

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //非液化: 地下水位以上
        if (depth < waterLevelDesign) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check qc
        if (!isnum(qc)) {
            err.push(`qc${brk(qc)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            qc = cdbl(qc)

            //check
            if (qc < 0) {
                err.push(`qc${brk(qc)}<0`)
                delayErr = true
            }

        }

        //check fs
        if (!isnum(fs)) {
            err.push(`fs${brk(fs)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            fs = cdbl(fs)

            //check
            if (fs < 0) {
                err.push(`fs${brk(fs)}<0`)
                delayErr = true
            }

        }

        //check u2
        if (!isnum(u2)) {
            err.push(`u2${brk(u2)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            u2 = cdbl(u2)

            // //check, 須允許水壓負值
            // if (u2 < 0) {
            //     err.push(`u2${brk(u2)}<0`)
            //     delayErr = true
            // }

        }

        //check svp, 若有svp則直接複寫svpUsual與svpDesign
        if (isnum(svp)) {

            //cdbl
            svp = cdbl(svp)

            //save
            svpUsual = svp
            svpDesign = svp

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check tou_s
        if (!isnum(tou_s)) {
            err.push(`tou_s${brk(tou_s)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            tou_s = cdbl(tou_s)

            //check
            if (tou_s < 0) {
                err.push(`tou_s${brk(tou_s)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check su
        if (!isnum(su)) {
            err.push(`su${brk(su)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            su = cdbl(su)

            //check
            if (su < 0) {
                err.push(`su${brk(su)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //CPT分析
    let useCnLeq = false //Robertson法是沒有限制Cn要小於等於1.7, 故得使用useCnLeq=false
    rc = cptCommon(depth, coe_a, qc, fs, u2, sv, svpUsual, useCnLeq)
    Fr = get(rc, 'Fr', null)
    Ic = get(rc, 'Ic', null)
    Icn = get(rc, 'Icn', null)
    qt = get(rc, 'qt', null)
    Qt = get(rc, 'Qt', null)
    Qtn = get(rc, 'Qtn', null)

    //check
    if (!isnum(qt)) {
        err.push(`qt${brk(qt)}非數字`)
        return ret() //重大錯誤直接報錯結束
    }

    //轉換單位成為kg/cm2
    sv = sv * cvru //kPa -> kg/cm2
    svpUsual = svpUsual * cvru //kPa -> kg/cm2
    svpDesign = svpDesign * cvru //kPa -> kg/cm2
    qt = qt * 1000 * cvru //MPa -> kg/cm2

    //useIc
    let useIc = null
    if (useIc === null && isNumber(Icn)) {
        useIc = Icn
    }
    if (useIc === null && isNumber(Ic)) {
        err.push(`無法計算Icn，強制降轉使用Ic`)
        useIc = Ic
    }

    //useQt
    let useQt = null
    if (useQt === null && isNumber(Qtn)) {
        useQt = Qtn
    }
    if (useQt === null && isNumber(Qt)) {
        err.push(`無法計算Qtn，強制降轉使用Qt`)
        useQt = Qt
    }

    //MSF, 規模修正因子
    MSF = (Mw / 7.5) ** (-2.56)

    //rrd, 應力折減係數
    rrd = (1 - 0.4113 * depth ** 0.5 + 0.04052 * depth + 0.001753 * depth ** 1.5) / (1 - 0.4177 * depth ** 0.5 + 0.05729 * depth - 0.006205 * depth ** 1.5 + 0.00121 * depth ** 2)

    //Qtncs, CRR75
    Qtncs = null
    CRR75 = null
    if (useIc <= 2.5) {

        //Kc
        if (useIc <= 1.64) {
            Kc = 1.0
        }
        else { //1.64<Ic<2.5
            Kc = -0.403 * useIc ** 4 + 5.581 * useIc ** 3 - 21.63 * useIc ** 2 + 33.75 * useIc - 17.88
            if (useIc < 2.36 && Fr < 0.5) {
                Kc = 1.0
            }
        }

        //Qtncs(none)
        Qtncs = Kc * useQt

        //CRR75
        if (Qtncs < 50) {
            CRR75 = 0.833 * (Qtncs / 1000) + 0.05
        }
        else { //50<=Qtncs<160
            CRR75 = 93 * (Qtncs / 1000) ** 3 + 0.08
        }

    }
    else if (useIc < 2.7) { //2.5<Ic<2.7
        //關於2.5<Ic<2.7過度區:
        //古志生(0-A1050829-CPT液化評估法, pp.21)提及是基於Robertson迭代法
        //但其學生張佩雯(2012)(莊氏CPTu, pp.45)是寫基於Ic(RW)計算
        //此處使用古志生投影片資料進行計算

        //Kc
        Kc = 6 * (1e-7) * useIc ** 16.76

        //Qtncs(none)
        Qtncs = Kc * useQt

        //CRR75
        if (Qtncs < 50) {
            CRR75 = 0.833 * (Qtncs / 1000) + 0.05
        }
        else { //50<=Qtncs<160
            CRR75 = 93 * (Qtncs / 1000) ** 3 + 0.08
        }

    }
    else { //Ic>=2.7
        //tou_s: horizontal static shear stress
        //su: undrained shear strength

        //Kalpha
        Kalpha = 1.344 - (0.344 / (1 - tou_s / su) ** 0.638)

        //Qtncs
        Qtncs = Kalpha * useQt

        //CRR75
        CRR75 = 0.053 * Qtncs

    }

    //CRR
    CRR = CRR75 * MSF
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * PGA * (sv / svpDesign) * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    return ret()
}


function cptJuang({ ver = '2002', waterLevelDesign, depth, coe_a, qc, fs, u2, svp, svpUsual, svpDesign, sv, PGA, Mw }) {
    //若有使用Robertson(1986)之後版本, qc皆視為使用qt(校正後qc)
    let err = []
    let rc = {}
    let MSF = ''
    let rrd = ''
    let Ic = ''
    let Fr = ''
    let qt = ''
    let qc1N = ''
    let qc1Ncs = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    // let vstrTS = ''
    // let vstrIY = ''

    function ret() {
        //因經驗公式是與單位有關, 但無法確切定義其單位, 故避免轉換減少爭議
        // if (isnum(qc1N)) {
        //     qc1N = qc1N / 1000 / cvru //kg/cm2 -> MPa
        // }
        // if (isnum(qc1Ncs)) {
        //     qc1Ncs = qc1Ncs / 1000 / cvru //kg/cm2 -> MPa
        // }
        let r = { ...rc, rrd, qc1N, Ic, qc1Ncs, CRR75, CRR, CSR, FS, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check ver
        if (ver !== '2002') {
            err.push(`ver${brk(ver)}非2002`)
            return ret() //重大錯誤直接報錯結束
        }

        //check coe_a
        if (!isnum(coe_a)) {
            err.push(`coe_a${brk(coe_a)}非數字，強制預設為0.8`)
            coe_a = 0.8
        }
        else {

            //cdbl
            coe_a = cdbl(coe_a)

        }

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //非液化: 地下水位以上
        if (depth < waterLevelDesign) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check qc
        if (!isnum(qc)) {
            err.push(`qc${brk(qc)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            qc = cdbl(qc)

            //check
            if (qc < 0) {
                err.push(`qc${brk(qc)}<0`)
                delayErr = true
            }

        }

        //check fs
        if (!isnum(fs)) {
            err.push(`fs${brk(fs)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            fs = cdbl(fs)

            //check
            if (fs < 0) {
                err.push(`fs${brk(fs)}<0`)
                delayErr = true
            }

        }

        //check u2
        if (!isnum(u2)) {
            err.push(`u2${brk(u2)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            u2 = cdbl(u2)

            // //check, 須允許水壓負值
            // if (u2 < 0) {
            //     err.push(`u2${brk(u2)}<0`)
            //     delayErr = true
            // }

        }

        //check svp, 若有svp則直接複寫svpUsual與svpDesign
        if (isnum(svp)) {

            //cdbl
            svp = cdbl(svp)

            //save
            svpUsual = svp
            svpDesign = svp

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //CPT分析
    let useCnLeq = false //未使用迭代法之Icn或Qtn, 故使用無限制之useCnLeq=false
    rc = cptCommon(depth, coe_a, qc, fs, u2, sv, svpUsual, useCnLeq)
    Fr = get(rc, 'Fr', null)
    // Ic = get(rc, 'Ic', null)
    // Icn = get(rc, 'Icn', null)
    qt = get(rc, 'qt', null)
    // Qt = get(rc, 'Qt', null)
    // Qtn = get(rc, 'Qtn', null)

    //check
    if (!isnum(qt)) {
        err.push(`qt${brk(qt)}非數字`)
        return ret() //重大錯誤直接報錯結束
    }

    //轉換單位成為kg/cm2
    sv = sv * cvru //kPa -> kg/cm2
    svpUsual = svpUsual * cvru //kPa -> kg/cm2
    svpDesign = svpDesign * cvru //kPa -> kg/cm2
    qt = qt * 1000 * cvru //MPa -> kg/cm2

    //MSF, 規模修正因子
    MSF = (Mw / 7.5) ** (-2.56)

    //rrd, 應力折減係數
    rrd = (1 - 0.4113 * depth ** 0.5 + 0.04052 * depth + 0.001753 * depth ** 1.5) / (1 - 0.4177 * depth ** 0.5 + 0.05729 * depth - 0.006205 * depth ** 1.5 + 0.00121 * depth ** 2)

    //F(%)
    // let F = null
    // if ((qt - sv) > 0) {
    //     F = (fs / (qt - sv)) * 100 //基於kg/cm2
    // }
    // // else {
    // //     F = 1e20 //除0就不要硬算
    // // }
    let F = Fr

    //qc1N, 單位基於kg/cm2但無法確切定義其單位, 故不給予
    qc1N = null
    if (svpUsual > 0) {
        qc1N = qt / Math.sqrt(svpUsual) //基於kg/cm2
    }
    // else {
    //     qc1N = 1e20 //除0就不要硬算
    // }

    //Ic, 另外計算
    Ic = null
    if (isNumber(qc1N) && isNumber(F)) {
        Ic = Math.sqrt((3.47 - Math.log10(qc1N)) ** 2 + (Math.log10(F) + 1.22) ** 2)
    }

    //qc1Ncs, 單位基於kg/cm2但無法確切定義其單位, 故不給予
    qc1Ncs = null
    if (isNumber(qc1N) && isNumber(Ic)) {
        qc1Ncs = qc1N * (2.429 * Ic ** 4 - 16.943 * Ic ** 3 + 44.551 * Ic ** 2 - 51.497 * Ic + 22.802)
    }

    //Calpha
    let Calpha = -0.016 * (svpUsual / 100) ** 3 + 0.178 * (svpUsual / 100) ** 2 - 0.063 * (svpUsual / 100) + 0.903

    //CRR75
    CRR75 = null
    if (isNumber(Calpha) && isNumber(qc1Ncs)) {
        CRR75 = Calpha * Math.exp(-2.957 + 1.264 * (qc1Ncs / 100) ** 1.25)
    }

    //CRR
    CRR = null
    if (isNumber(CRR75) && isNumber(MSF)) {
        CRR = CRR75 * MSF
    }
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * PGA * (sv / svpDesign) * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    return ret()
}


function cptKuAndJuang({ ver = '2012', waterLevelDesign, depth, coe_a, qc, fs, u2, svp, svpUsual, svpDesign, sv, PGA, Mw }) {
    //若有使用Robertson(1986)之後版本, qc皆視為使用qt(校正後qc)
    let err = []
    let rc = {}
    let MSF = ''
    let rrd = ''
    let Fr = ''
    let Bq = ''
    let Ic = ''
    let Icn = ''
    let qt = ''
    let Qt = ''
    let Qtn = ''
    let Icbj = ''
    let Csigma = ''
    let Ksigma = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    // let vstrTS = ''
    // let vstrIY = ''

    function ret() {
        let r = { ...rc, rrd, Fr, Bq, Ic, Icn, Qt, Qtn, Icbj, Csigma, Ksigma, CRR75, CRR, CSR, FS, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check ver
        if (ver !== '2012') {
            err.push(`ver${brk(ver)}非2012`)
            return ret() //重大錯誤直接報錯結束
        }

        //check coe_a
        if (!isnum(coe_a)) {
            err.push(`coe_a${brk(coe_a)}非數字，強制預設為0.8`)
            coe_a = 0.8
        }
        else {

            //cdbl
            coe_a = cdbl(coe_a)

        }

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //非液化: 地下水位以上
        if (depth < waterLevelDesign) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check qc
        if (!isnum(qc)) {
            err.push(`qc${brk(qc)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            qc = cdbl(qc)

            //check
            if (qc < 0) {
                err.push(`qc${brk(qc)}<0`)
                delayErr = true
            }

        }

        //check fs
        if (!isnum(fs)) {
            err.push(`fs${brk(fs)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            fs = cdbl(fs)

            //check
            if (fs < 0) {
                err.push(`fs${brk(fs)}<0`)
                delayErr = true
            }

        }

        //check u2
        if (!isnum(u2)) {
            err.push(`u2${brk(u2)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            u2 = cdbl(u2)

            // //check, 須允許水壓負值
            // if (u2 < 0) {
            //     err.push(`u2${brk(u2)}<0`)
            //     delayErr = true
            // }

        }

        //check svp, 若有svp則直接複寫svpUsual與svpDesign
        if (isnum(svp)) {

            //cdbl
            svp = cdbl(svp)

            //save
            svpUsual = svp
            svpDesign = svp

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //CPT分析
    let useCnLeq = true //基於Idriss and Boulanger(2006)故有限制Cn要小於等於1.7, 得使用useCnLeq=true
    rc = cptCommon(depth, coe_a, qc, fs, u2, sv, svpUsual, useCnLeq)
    qt = get(rc, 'qt', null)
    Fr = get(rc, 'Fr', null)
    Bq = get(rc, 'Bq', null)
    Ic = get(rc, 'Ic', null)
    Icn = get(rc, 'Icn', null)
    Qt = get(rc, 'Qt', null)
    Qtn = get(rc, 'Qtn', null) //通過迭代算得, 基於Idriss and Boulanger(2006)中的qc(1N), 等同Ku and Juang (2012)中的qt(1N)

    //check
    if (!isnum(qt)) {
        err.push(`qt${brk(qt)}非數字`)
        return ret() //重大錯誤直接報錯結束
    }

    //轉換單位成為kg/cm2
    sv = sv * cvru //kPa -> kg/cm2
    svpUsual = svpUsual * cvru //kPa -> kg/cm2
    svpDesign = svpDesign * cvru //kPa -> kg/cm2
    // qt = qt * 1000 * cvru //MPa -> kg/cm2

    //useIc
    let useIc = null
    if (useIc === null && isNumber(Icn)) {
        useIc = Icn
    }
    if (useIc === null && isNumber(Ic)) {
        err.push(`無法計算Icn，強制降轉使用Ic`)
        useIc = Ic
    }

    //useQt
    let useQt = null
    if (useQt === null && isNumber(Qtn)) {
        useQt = Qtn
    }
    if (useQt === null && isNumber(Qt)) {
        err.push(`無法計算Qtn，強制降轉使用Qt`)
        useQt = Qt
    }

    // //轉換單位成為kg/cm2
    // sv = sv * cvru //kPa -> kg/cm2
    // svpUsual = svpUsual * cvru //kPa -> kg/cm2
    // svpDesign = svpDesign * cvru //kPa -> kg/cm2
    // qt = qt * 1000 * cvru //MPa -> kg/cm2
    // fs = fs * 1000 * cvru //MPa -> kg/cm2
    // u2 = u2 * 1000 * cvru //MPa -> kg/cm2

    //MSF, 規模修正因子, Idriss and Boulanger(2006) for sand
    MSF = 6.9 * Math.exp(-Mw / 4) - 0.058
    MSF = Math.min(MSF, 1.8)

    //rrd, 應力折減係數, Idriss and Boulanger(2006)
    let rd_alpha = -1.012 - 1.126 * Math.sin(depth / 11.73 + 5.133)
    let rd_beta = 0.106 + 0.118 * Math.sin(depth / 11.28 + 5.142)
    rrd = Math.exp(rd_alpha + rd_beta * Mw)
    rrd = Math.min(rrd, 1)
    // console.log('rrd',rrd,'rd_alpha',rd_alpha,'rd_beta',rd_beta,'Mw',Mw)

    //Icbj
    Icbj = null
    if (isNumber(Qt) && isNumber(Bq) && isNumber(Fr)) {
        Icbj = Math.sqrt((3 - Math.log10(Qt * (1 - Bq) + 1)) ** 2 + (Math.log10(Fr) + 1.22) ** 2)
    }
    else {
        err.push(`無法計算Ic(BJ)`)
        return ret() //重大錯誤直接報錯結束
    }

    //CRR75
    let A = Icbj * (useQt / 100) - 14.7
    let B = 0.909 * Icbj ** 3 - 7.47 * Icbj + 19.28
    let C = 0.059 + 0.015 * Icbj ** 2
    CRR75 = 0.05 + Math.exp(A + B * (useQt / 100) ** C)
    if (isNumber(CRR75)) {
        CRR75 = Math.min(CRR75, 1e20) //CRR75可能超大Infinity, 為避免後續FS也變成Infinity故修改至1e20
    }
    // console.log('depth',depth,'CRR75',CRR75,'A',A,'B',B,'C',C,'Icbj',Icbj,'useQt',useQt)

    //Csigma
    Csigma = null
    if (Qtn <= 37) {
        Csigma = 0.063
    }
    else if (Qtn < 211) { //37<Qtn<211
        Csigma = 1 / (37.3 - 8.27 * (Qtn) ** 0.264)
    }
    else { //Qtn>=211
        Csigma = 0.3
    }
    Csigma = Math.min(Csigma, 0.3)

    //Pa
    let Pa = cnst.Pa * 1000 //大氣壓(kPa), MPa -> kPa
    Pa = Pa * cvru //kPa -> kg/cm2

    //Ksigma
    Ksigma = 1 - Csigma * Math.log(svpUsual / Pa) //使用常時垂直有效應力
    Ksigma = Math.min(Ksigma, 1)

    //CRR
    CRR = CRR75 * MSF * Ksigma
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }
    // console.log('depth',depth,'CRR',CRR,'CRR75',CRR75,'MSF',MSF,'Ksigma',Ksigma,'Csigma',Csigma,'svpUsual',svpUsual,'Pa',Pa,'Math.log(svpUsual / Pa)',Math.log(svpUsual / Pa))

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * PGA * (sv / svpDesign) * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }
    // console.log('depth',depth,'CSR',CSR,'sv',sv,'svpDesign',svpDesign,'rrd',rrd,'PGA',PGA)

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }
    // console.log('depth',depth,'FS',FS)

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    return ret()
}


function cptOlsen({ ver = '1997', waterLevelDesign, depth, coe_a, qc, fs, u2, svp, svpUsual, svpDesign, sv, PGA, Mw }) {
    //若有使用Robertson(1986)之後版本, qc皆視為使用qt(校正後qc)
    let err = []
    let rc = {}
    let MSF = ''
    let rrd = ''
    let qt = ''
    let qc1 = ''
    let Rf = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    // let vstrTS = ''
    // let vstrIY = ''

    function ret() {
        //因經驗公式是與單位有關, 但無法確切定義其單位, 故避免轉換減少爭議
        // if (isnum(qc1)) {
        //     qc1 = qc1 / cvru
        // }
        let r = { ...rc, rrd, qc1, Rf, CRR75, CRR, CSR, FS, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check ver
        if (ver !== '1997') {
            err.push(`ver${brk(ver)}非1997`)
            return ret() //重大錯誤直接報錯結束
        }

        //check coe_a
        if (!isnum(coe_a)) {
            err.push(`coe_a${brk(coe_a)}非數字，強制預設為0.8`)
            coe_a = 0.8
        }
        else {

            //cdbl
            coe_a = cdbl(coe_a)

        }

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //非液化: 地下水位以上
        if (depth < waterLevelDesign) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check qc
        if (!isnum(qc)) {
            err.push(`qc${brk(qc)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            qc = cdbl(qc)

            //check
            if (qc < 0) {
                err.push(`qc${brk(qc)}<0`)
                delayErr = true
            }

        }

        //check fs
        if (!isnum(fs)) {
            err.push(`fs${brk(fs)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            fs = cdbl(fs)

            //check
            if (fs < 0) {
                err.push(`fs${brk(fs)}<0`)
                delayErr = true
            }

        }

        //check u2
        if (!isnum(u2)) {
            err.push(`u2${brk(u2)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            u2 = cdbl(u2)

            // //check, 須允許水壓負值
            // if (u2 < 0) {
            //     err.push(`u2${brk(u2)}<0`)
            //     delayErr = true
            // }

        }

        //check svp, 若有svp則直接複寫svpUsual與svpDesign
        if (isnum(svp)) {

            //cdbl
            svp = cdbl(svp)

            //save
            svpUsual = svp
            svpDesign = svp

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //CPT分析
    let useCnLeq = false //未使用迭代法之Icn或Qtn, 故使用無限制之useCnLeq=false
    rc = cptCommon(depth, coe_a, qc, fs, u2, sv, svpUsual, useCnLeq)
    // Ic = get(rc, 'Ic', null)
    // Icn = get(rc, 'Icn', null)
    qt = get(rc, 'qt', null)
    Rf = get(rc, 'Rf', null)

    //check
    if (!isnum(qt)) {
        err.push(`qt${brk(qt)}非數字`)
        return ret() //重大錯誤直接報錯結束
    }

    //轉換單位成為kg/cm2
    sv = sv * cvru //kPa -> kg/cm2
    svpUsual = svpUsual * cvru //kPa -> kg/cm2
    svpDesign = svpDesign * cvru //kPa -> kg/cm2
    qt = qt * 1000 * cvru //MPa -> kg/cm2

    //MSF, 規模修正因子
    MSF = (Mw / 7.5) ** (-2.56)

    //rrd, 應力折減係數
    rrd = (1 - 0.4113 * depth ** 0.5 + 0.04052 * depth + 0.001753 * depth ** 1.5) / (1 - 0.4177 * depth ** 0.5 + 0.05729 * depth - 0.006205 * depth ** 1.5 + 0.00121 * depth ** 2)

    //qc1, 單位基於kg/cm2但無法確切定義其單位, 故不給予
    if (svpUsual > 0) {
        qc1 = qt / svpUsual ** 0.7 //基於kg/cm2
    }
    else {
        qc1 = 1e20
    }

    //Rf(%), 摩擦比(fs與qc同單位故無單位)
    // Rf = null
    // if (qt > 0) {
    //     Rf = fs / qt * 100
    // }
    // else {
    //     Rf = 1e20
    // }

    //CRR75
    CRR75 = 0.00128 * qc1 - 0.025 + 0.17 * Rf - 0.028 * Rf ** 2 + 0.0016 * Rf ** 3

    //CRR
    CRR = CRR75 * MSF
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * PGA * (sv / svpDesign) * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    return ret()
}


function cptShibata({ ver = '1988', waterLevelDesign, depth, coe_a, qc, fs, u2, svp, svpUsual, svpDesign, sv, PGA, Mw, D50 }) {
    //若有使用Robertson(1986)之後版本, qc皆視為使用qt(校正後qc)
    let err = []
    let rc = {}
    let MSF = ''
    let rrd = ''
    let qt = ''
    let qc1 = ''
    let qc1cr = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''
    // let vstrTS = ''
    // let vstrIY = ''

    function ret() {
        //因經驗公式是與單位有關, 但無法確切定義其單位, 故避免轉換減少爭議
        // if (isnum(qc1)) {
        //     qc1 = qc1 / cvru
        // }
        if (isnum(qc1cr)) {
            qc1cr = qc1cr / cvru
        }
        let r = { ...rc, rrd, qc1, qc1cr, CRR75, CRR, CSR, FS, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    let noLique = false
    let delayErr = false
    while (true) {

        //check ver
        if (ver !== '1988') {
            err.push(`ver${brk(ver)}非1988`)
            return ret() //重大錯誤直接報錯結束
        }

        //check coe_a
        if (!isnum(coe_a)) {
            err.push(`coe_a${brk(coe_a)}非數字，強制預設為0.8`)
            coe_a = 0.8
        }
        else {

            //cdbl
            coe_a = cdbl(coe_a)

        }

        //check depth
        if (!isnum(depth)) {
            err.push(`depth${brk(depth)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            depth = cdbl(depth)

            //check
            if (depth < 0) {
                err.push(`depth${brk(depth)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check waterLevelUsual, 不使用故不需檢查

        //check waterLevelDesign
        if (!isnum(waterLevelDesign)) {
            err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
            waterLevelDesign = 0
        }
        else {

            //cdbl
            waterLevelDesign = cdbl(waterLevelDesign)

            //check
            if (waterLevelDesign < 0) {
                err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
                waterLevelDesign = 0
            }

        }

        //非液化: 地下水位以上
        if (depth < waterLevelDesign) {
            noLique = true
        }

        //非液化: 深度大於20m
        if (depth > 20) {
            noLique = true
        }

        //check qc
        if (!isnum(qc)) {
            err.push(`qc${brk(qc)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            qc = cdbl(qc)

            //check
            if (qc < 0) {
                err.push(`qc${brk(qc)}<0`)
                delayErr = true
            }

        }

        //check fs
        if (!isnum(fs)) {
            err.push(`fs${brk(fs)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            fs = cdbl(fs)

            //check
            if (fs < 0) {
                err.push(`fs${brk(fs)}<0`)
                delayErr = true
            }

        }

        //check u2
        if (!isnum(u2)) {
            err.push(`u2${brk(u2)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            u2 = cdbl(u2)

            // //check, 須允許水壓負值
            // if (u2 < 0) {
            //     err.push(`u2${brk(u2)}<0`)
            //     delayErr = true
            // }

        }

        //check D50
        if (!isnum(D50)) {
            err.push(`D50${brk(D50)}非數字`)
            delayErr = true
        }
        else {

            //cdbl
            D50 = cdbl(D50)

            //check
            if (D50 < 0) {
                err.push(`D50${brk(D50)}<0`)
                delayErr = true
            }

        }

        //check svp, 若有svp則直接複寫svpUsual與svpDesign
        if (isnum(svp)) {

            //cdbl
            svp = cdbl(svp)

            //save
            svpUsual = svp
            svpDesign = svp

        }

        //check svpUsual
        if (!isnum(svpUsual)) {
            err.push(`svpUsual${brk(svpUsual)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpUsual = cdbl(svpUsual)

            //check
            if (svpUsual < 0) {
                err.push(`svpUsual${brk(svpUsual)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check svpDesign
        if (!isnum(svpDesign)) {
            err.push(`svpDesign${brk(svpDesign)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            svpDesign = cdbl(svpDesign)

            //check
            if (svpDesign < 0) {
                err.push(`svpDesign${brk(svpDesign)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check sv
        if (!isnum(sv)) {
            err.push(`sv${brk(sv)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            sv = cdbl(sv)

            //check
            if (sv < 0) {
                err.push(`sv${brk(sv)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check PGA
        if (!isnum(PGA)) {
            err.push(`PGA${brk(PGA)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            PGA = cdbl(PGA)

            //check
            if (PGA < 0) {
                err.push(`PGA${brk(PGA)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        //check Mw
        if (!isnum(Mw)) {
            err.push(`Mw${brk(Mw)}非數字`)
            return ret() //重大錯誤直接報錯結束
        }
        else {

            //cdbl
            Mw = cdbl(Mw)

            //check
            if (Mw < 0) {
                err.push(`Mw${brk(Mw)}<0`)
                return ret() //重大錯誤直接報錯結束
            }

        }

        break
    }

    //check noLique
    if (noLique === true) {
        err = [] //清除錯誤
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret() //無錯誤並結束
    }

    //check delayErr
    if (delayErr === true) {
        return ret() //觸發延遲報錯並結束
    }

    //CPT分析
    let useCnLeq = false //未使用迭代法之Icn或Qtn, 故使用無限制之useCnLeq=false
    rc = cptCommon(depth, coe_a, qc, fs, u2, sv, svpUsual, useCnLeq)
    // Ic = get(rc, 'Ic', null)
    // Icn = get(rc, 'Icn', null)
    qt = get(rc, 'qt', null)

    //check
    if (!isnum(qt)) {
        err.push(`qt${brk(qt)}非數字`)
        return ret() //重大錯誤直接報錯結束
    }

    //轉換單位成為kg/cm2
    sv = sv * cvru //kPa -> kg/cm2
    svpUsual = svpUsual * cvru //kPa -> kg/cm2
    svpDesign = svpDesign * cvru //kPa -> kg/cm2
    qt = qt * 1000 * cvru //MPa -> kg/cm2

    // //轉換單位成為kg/cm2
    // sv = sv * cvru //kPa -> kg/cm2
    // svpUsual = svpUsual * cvru //kPa -> kg/cm2
    // svpDesign = svpDesign * cvru //kPa -> kg/cm2
    // qt = qt * 1000 * cvru //MPa -> kg/cm2
    // fs = fs * 1000 * cvru //MPa -> kg/cm2
    // u2 = u2 * 1000 * cvru //MPa -> kg/cm2

    // //轉換單位成為kg/cm2
    // sv = sv * cvru //kPa -> kg/cm2
    // svpUsual = svpUsual * cvru //kPa -> kg/cm2
    // svpDesign = svpDesign * cvru //kPa -> kg/cm2
    // qt = qt * 1000 * cvru //MPa -> kg/cm2
    // fs = fs * 1000 * cvru //MPa -> kg/cm2
    // u2 = u2 * 1000 * cvru //MPa -> kg/cm2

    //MSF, 規模修正因子
    MSF = (Mw / 7.5) ** (-2.56)

    //rrd, 應力折減係數
    rrd = 1 - 0.015 * depth

    //qc1, 單位基於kg/cm2但無法確切定義其單位, 故不給予
    qc1 = 1.7 / (svpUsual + 0.7) * qt

    //C2
    let C2
    if (D50 >= 0.25) { //D50單位(mm)
        C2 = 1
    }
    else {
        C2 = D50 / 0.25 //D50單位(mm)
    }

    //C3
    let TempL = null
    if (svpDesign > 0) {
        TempL = 0.1 * (MSF - 1) * PGA * (sv / svpDesign) * rrd //svp是用於CSR得要用svpDesign, Mw使用規模修正因子MSF
    }
    else {
        TempL = 1e20
    }
    let C3 = null
    if (TempL !== -0.1) {
        C3 = (TempL - 0.1) / (TempL + 0.1)
    }
    else {
        C3 = 1e20
    }

    //qc1cr(kg/cm2), 臨界正規化錐頭貫入阻抗
    qc1cr = C2 * (50 + 200 * C3)
    qc1cr = max(qc1cr, 0.1) //取最小值0.1，因 CSR75 可出現負值

    CRR = qc1
    CSR = qc1cr
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    return ret()
}


function vsHBF({ waterLevelDesign, depth, Vs, FC, svpDesign, sv, PGA, Mw }) {
    let err = []
    let MSF = ''
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''

    function ret() {
        let r = { CRR75, CRR, CSR, FS, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    if (!isnum(waterLevelDesign)) {
        err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
        waterLevelDesign = 0
    }
    waterLevelDesign = cdbl(waterLevelDesign)
    if (waterLevelDesign < 0) {
        err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
        waterLevelDesign = 0
    }

    if (!isnum(depth)) {
        err.push(`depth${brk(depth)}非數字`)
        return ret()
    }
    depth = cdbl(depth)
    if (depth < 0) {
        err.push(`depth${brk(depth)}<0`)
        return ret()
    }

    if (!isnum(Vs)) {
        err.push(`Vs${brk(Vs)}非數字`)
        return ret()
    }
    Vs = cdbl(Vs)
    if (Vs < 0) {
        err.push(`Vs${brk(Vs)}<0`)
        return ret()
    }

    if (!isnum(FC)) {
        err.push(`FC${brk(FC)}非數字`)
        return ret()
    }
    FC = cdbl(FC)
    if (FC < 0) {
        err.push(`FC${brk(FC)}<0`)
        return ret()
    }

    if (!isnum(svpDesign)) {
        err.push(`svpDesign${brk(svpDesign)}非數字`)
        return ret()
    }
    svpDesign = cdbl(svpDesign)
    if (svpDesign < 0) {
        err.push(`svpDesign${brk(svpDesign)}<0`)
        return ret()
    }

    if (!isnum(sv)) {
        err.push(`sv${brk(sv)}非數字`)
        return ret()
    }
    sv = cdbl(sv)
    if (sv < 0) {
        err.push(`sv${brk(sv)}<0`)
        return ret()
    }

    if (!isnum(PGA)) {
        err.push(`PGA${brk(PGA)}非數字`)
        return ret()
    }
    PGA = cdbl(PGA)
    if (PGA < 0) {
        err.push(`PGA${brk(PGA)}<0`)
        return ret()
    }

    if (!isnum(Mw)) {
        err.push(`Mw${brk(Mw)}非數字`)
        return ret()
    }
    Mw = cdbl(Mw)
    if (Mw < 0) {
        err.push(`Mw${brk(Mw)}<0`)
        return ret()
    }

    //MSF, 規模修正因子
    //let MSF = (Mw / 7.5) ** (-1.11) //原莊長賢excel使用
    MSF = (Mw / 7.5) ** (-3.3)

    //rrd, 應力折減係數
    let rrd = (1 - 0.4113 * depth ** 0.5 + 0.04052 * depth + 0.001753 * depth ** 1.5) / (1 - 0.4177 * depth ** 0.5 + 0.05729 * depth - 0.006205 * depth ** 1.5 + 0.00121 * depth ** 2)
    let Vs1 = 1 / Math.sqrt(svpDesign) * Vs
    console.log('待確認此處svpDesign,Vs的單位')
    let Kv
    if (FC <= 10) {
        Kv = 1.0
    }
    else {
        Kv = 0.00029 * FC ** 2 - 0.00355 * FC + 1.00651
    }
    let Vs100cs = Kv * (Vs1 - 100)
    Vs100cs = Math.min(Vs100cs, 135 - 0.5)

    //CRR75
    CRR75 = null
    if (Vs1 <= 100) {
        CRR75 = 0.09
    }
    else {
        CRR75 = 0.09 + 0.00022 * Vs100cs / (1 - Vs100cs / 135)
    }

    //CRR
    CRR = CRR75 * MSF
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * PGA * (sv / svpDesign) * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //非液化: 深度大於20m
    if (depth > 20) {
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret()
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    return ret()
}


function vsAndrus({ waterLevelDesign, depth, Vs, FC, svpDesign, sv, PGA, Mw }) {
    let err = []
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''

    function ret() {
        let r = { CRR75, CRR, CSR, FS, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    if (!isnum(waterLevelDesign)) {
        err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
        waterLevelDesign = 0
    }
    waterLevelDesign = cdbl(waterLevelDesign)
    if (waterLevelDesign < 0) {
        err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
        waterLevelDesign = 0
    }

    if (!isnum(depth)) {
        err.push(`depth${brk(depth)}非數字`)
        return ret()
    }
    depth = cdbl(depth)
    if (depth < 0) {
        err.push(`depth${brk(depth)}<0`)
        return ret()
    }

    if (!isnum(Vs)) {
        err.push(`Vs${brk(Vs)}非數字`)
        return ret()
    }
    Vs = cdbl(Vs)
    if (Vs < 0) {
        err.push(`Vs${brk(Vs)}<0`)
        return ret()
    }

    if (!isnum(FC)) {
        err.push(`FC${brk(FC)}非數字`)
        return ret()
    }
    FC = cdbl(FC)
    if (FC < 0) {
        err.push(`FC${brk(FC)}<0`)
        return ret()
    }

    if (!isnum(svpDesign)) {
        err.push(`svpDesign${brk(svpDesign)}非數字`)
        return ret()
    }
    svpDesign = cdbl(svpDesign)
    if (svpDesign < 0) {
        err.push(`svpDesign${brk(svpDesign)}<0`)
        return ret()
    }

    if (!isnum(sv)) {
        err.push(`sv${brk(sv)}非數字`)
        return ret()
    }
    sv = cdbl(sv)
    if (sv < 0) {
        err.push(`sv${brk(sv)}<0`)
        return ret()
    }

    if (!isnum(PGA)) {
        err.push(`PGA${brk(PGA)}非數字`)
        return ret()
    }
    PGA = cdbl(PGA)
    if (PGA < 0) {
        err.push(`PGA${brk(PGA)}<0`)
        return ret()
    }

    if (!isnum(Mw)) {
        err.push(`Mw${brk(Mw)}非數字`)
        return ret()
    }
    Mw = cdbl(Mw)
    if (Mw < 0) {
        err.push(`Mw${brk(Mw)}<0`)
        return ret()
    }

    //MSF, 規模修正因子
    let MSF = (Mw / 7.5) ** (-3.3)

    //rrd, 應力折減係數
    let rrd = (1 - 0.4113 * depth ** 0.5 + 0.04052 * depth + 0.001753 * depth ** 1.5) / (1 - 0.4177 * depth ** 0.5 + 0.05729 * depth - 0.006205 * depth ** 1.5 + 0.00121 * depth ** 2)
    let Vs1 = 1 / Math.sqrt(svpDesign) * Vs
    console.log('待確認此處svpDesign,Vs的單位')
    let Vs1Star
    if (FC <= 5) {
        Vs1Star = 215
    }
    else if (FC <= 35) {
        Vs1Star = 215 - 0.5 * (FC - 5)
    }
    else {
        Vs1Star = 200
    }

    //CRR75
    let a = 0.022
    let b = 2.8
    CRR75 = a * (Vs1 / 100) ** 2 + b * (1 / (Vs1Star - Vs1) - 1 / Vs1Star)
    CRR75 = max(CRR75, 0.1) // CRR75 會出現負值

    //CRR
    CRR = CRR75 * MSF
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * PGA * (sv / svpDesign) * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //非液化: 深度大於20m
    if (depth > 20) {
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret()
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    return ret()
}


function vsNCEER({ waterLevelDesign, depth, Vs, FC, svpDesign, sv, PGA, Mw }) {
    let err = []
    let CRR75 = ''
    let CRR = ''
    let CSR = ''
    let FS = ''

    function ret() {
        let r = { CRR75, CRR, CSR, FS, err: join(err, '; ') }
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                r[k] = ''
            }
        })
        return r
    }

    //check
    if (!isnum(waterLevelDesign)) {
        err.push(`waterLevelDesign${brk(waterLevelDesign)}非數字，強制預設為0(m)`)
        waterLevelDesign = 0
    }
    waterLevelDesign = cdbl(waterLevelDesign)
    if (waterLevelDesign < 0) {
        err.push(`waterLevelDesign${brk(waterLevelDesign)}<0，強制預設為0(m)`)
        waterLevelDesign = 0
    }

    if (!isnum(depth)) {
        err.push(`depth${brk(depth)}非數字`)
        return ret()
    }
    depth = cdbl(depth)
    if (depth < 0) {
        err.push(`depth${brk(depth)}<0`)
        return ret()
    }

    if (!isnum(Vs)) {
        err.push(`Vs${brk(Vs)}非數字`)
        return ret()
    }
    Vs = cdbl(Vs)
    if (Vs < 0) {
        err.push(`Vs${brk(Vs)}<0`)
        return ret()
    }

    if (!isnum(FC)) {
        err.push(`FC${brk(FC)}非數字`)
        return ret()
    }
    FC = cdbl(FC)
    if (FC < 0) {
        err.push(`FC${brk(FC)}<0`)
        return ret()
    }

    if (!isnum(svpDesign)) {
        err.push(`svpDesign${brk(svpDesign)}非數字`)
        return ret()
    }
    svpDesign = cdbl(svpDesign)
    if (svpDesign < 0) {
        err.push(`svpDesign${brk(svpDesign)}<0`)
        return ret()
    }

    if (!isnum(sv)) {
        err.push(`sv${brk(sv)}非數字`)
        return ret()
    }
    sv = cdbl(sv)
    if (sv < 0) {
        err.push(`sv${brk(sv)}<0`)
        return ret()
    }

    if (!isnum(PGA)) {
        err.push(`PGA${brk(PGA)}非數字`)
        return ret()
    }
    PGA = cdbl(PGA)
    if (PGA < 0) {
        err.push(`PGA${brk(PGA)}<0`)
        return ret()
    }

    if (!isnum(Mw)) {
        err.push(`Mw${brk(Mw)}非數字`)
        return ret()
    }
    Mw = cdbl(Mw)
    if (Mw < 0) {
        err.push(`Mw${brk(Mw)}<0`)
        return ret()
    }

    //MSF, 規模修正因子
    let MSF = (Mw / 7.5) ** (-3.3)

    //rrd, 應力折減係數
    let rrd = (1 - 0.4113 * depth ** 0.5 + 0.04052 * depth + 0.001753 * depth ** 1.5) / (1 - 0.4177 * depth ** 0.5 + 0.05729 * depth - 0.006205 * depth ** 1.5 + 0.00121 * depth ** 2)
    let Vs1 = 1 / Math.sqrt(svpDesign) * Vs
    console.log('待確認此處svpDesign的單位')
    let Vs1c
    if (FC <= 5) {
        Vs1c = 220
    }
    else if (FC <= 35) {
        Vs1c = 210
    }
    else {
        Vs1c = 200
    }

    //CRR75
    let a = 0.03
    let b = 0.9
    CRR75 = a * (Vs1 / 100) ** 2 + b * (1 / (Vs1c - Vs1) - 1 / Vs1c)
    CRR75 = max(CRR75, 0.1) // CRR75 會出現負值

    //CRR
    CRR = CRR75 * MSF
    if (isNumber(CRR)) {
        CRR = Math.min(CRR, 1e20)
    }

    //CSR
    CSR = null
    if (svpDesign > 0) {
        CSR = 0.65 * PGA * (sv / svpDesign) * rrd
    }
    else {
        CSR = 1e20
    }
    if (isNumber(CSR)) {
        CSR = Math.min(CSR, 1e20)
    }

    //FS
    if (isNumber(CSR) && CSR > 0) {
        FS = CRR / CSR
    }
    if (isNumber(FS) && FS > 10) {
        FS = 10
    }

    //非液化: 深度大於20m
    if (depth > 20) {
        CRR = '-'
        CSR = '-'
        FS = 10
        return ret()
    }

    //check
    if (CRR < 0) {
        err.push(`CRR${brk(CRR)}<0`)
    }
    if (CSR <= 0) {
        err.push(`CSR${brk(CSR)}<=0`)
    }
    if (FS < 0) {
        err.push(`FS${brk(FS)}<0，強制改為0`)
        FS = 0
    }

    return ret()
}


let methodLiques = {
    SPT: {
        sptSeed,
        // sptHBF,
        sptHBF2012: (row) => {
            row = { ...row, ver: '2012' }
            return sptHBF(row)
        },
        sptHBF2017: (row) => {
            row = { ...row, ver: '2017' }
            return sptHBF(row)
        },
        sptNCEER,
        // sptNJRA,
        sptNJRA1996: (row) => {
            row = { ...row, ver: '1996' }
            return sptNJRA(row)
        },
        sptNJRA2017: (row) => {
            row = { ...row, ver: '2017' }
            return sptNJRA(row)
        },
        sptTY,
    },
    CPT: {
        // cptHBF,
        cptHBF2012: (row) => {
            row = { ...row, ver: '2012' }
            return cptHBF(row)
        },
        cptHBF2017: (row) => {
            row = { ...row, ver: '2017' }
            return cptHBF(row)
        },
        cptHBF2021: (row) => {
            row = { ...row, ver: '2021' }
            return cptHBF(row)
        },
        // cptNCEER,
        cptNCEER1997: (row) => {
            row = { ...row, ver: '1997' }
            return cptNCEER(row)
        },
        // cptRobertson,
        cptRobertson2009: (row) => {
            row = { ...row, ver: '2009' }
            return cptRobertson(row)
        },
        // cptJuang,
        cptJuang2002: (row) => {
            row = { ...row, ver: '2002' }
            return cptJuang(row)
        },
        // cptKuAndJuang,
        cptKuAndJuang2012: (row) => {
            row = { ...row, ver: '2012' }
            return cptKuAndJuang(row)
        },
        // cptOlsen,
        cptOlsen1997: (row) => {
            row = { ...row, ver: '1997' }
            return cptOlsen(row)
        },
        // cptShibata,
        cptShibata1988: (row) => {
            row = { ...row, ver: '1988' }
            return cptShibata(row)
        },
    },
    VS: {
        vsHBF,
        vsAndrus,
        vsNCEER,
    },
}


let methodSettlements = {
    SPT: {
        sptVolumetricStrainTokimatsuAndSeed,
        sptVolumetricStrainIshiharaAndYoshimine,
    },
}


function liquefaction(kind = 'auto', rows, opt = {}) {

    //unitSvSvp
    let unitSvSvp = get(opt, 'unitSvSvp')
    if (unitSvSvp !== 'kPa' && unitSvSvp !== 'MPa') {
        throw new Error(`opt.unitSvSvp[${unitSvSvp}] need kPa or MPa`)
    }

    //keyDepth, 計算核心複雜不提供更換鍵名
    // let keyDepth = get(opt, 'keyDepth')
    // if (!isestr(keyDepth)) {
    //     keyDepth = 'depth'
    // }
    let keyDepth = 'depth'

    //keyDepthStart, 計算核心複雜不提供更換鍵名
    // let keyDepthStart = get(opt, 'keyDepthStart')
    // if (!isestr(keyDepthStart)) {
    //     keyDepthStart = 'depthStart'
    // }
    let keyDepthStart = 'depthStart'

    //keyDepthEnd, 計算核心複雜不提供更換鍵名
    // let keyDepthEnd = get(opt, 'keyDepthEnd')
    // if (!isestr(keyDepthEnd)) {
    //     keyDepthEnd = 'depthEnd'
    // }
    let keyDepthEnd = 'depthEnd'

    //getKeysFromRows
    let getKeysFromRows = (rows) => {

        //row0
        let row0 = get(rows, 0, [])
        // console.log('row0', row0)

        //ks, 基於第1列提取keys
        let ks = keys(row0)

        return ks
    }

    // function getLiqueKindFromKey(c) {
    //     if (strleft(c, 3) === 'spt') {
    //         return 'SPT'
    //     }
    //     else if (strleft(c, 3) === 'cpt') {
    //         return 'CPT'
    //     }
    //     else if (strleft(c, 2) === 'vs') {
    //         return 'VS'
    //     }
    //     throw new Error(`無法判斷分析種類: ${c}`)
    // }

    // function getLiqueKindFromRow(rows) {

    //     //getKeysFromRows
    //     let ks = getKeysFromRows(rows)

    //     //kind
    //     let kind = ''
    //     each(ks, (key) => {
    //         if (key.indexOf('-FS') >= 0) {
    //             kind = getLiqueKindFromKey(key)
    //             return false
    //         }
    //     })

    //     return kind
    // }

    //addDepthAndPorousParams
    let addDepthAndPorousParams = (rows, kind, waterLevelUsual, waterLevelDesign) => {

        //waterLevelUsual, waterLevelDesign
        waterLevelUsual = cdbl(waterLevelUsual)
        waterLevelDesign = cdbl(waterLevelDesign)

        //map
        rows = map(rows, (v, k) => {

            //err
            let err = get(v, 'err', '')

            //save waterLevelUsual,waterLevelDesign
            v.waterLevelUsual = waterLevelUsual
            v.waterLevelDesign = waterLevelDesign

            //depth
            let ds = get(v, keyDepthStart, null)
            let de = get(v, keyDepthEnd, null)
            let bDepth = isnum(ds) && isnum(de)
            if (bDepth) {
                ds = cdbl(ds)
                de = cdbl(de)

                //depth
                let depth = (ds + de) / 2
                v[keyDepth] = depth

            }
            else {
                v[keyDepth] = ''
            }

            //relaPorousParams, SPT,CPT,VS都需要飽和與乾單位重計算垂直應力與垂直有效應力
            let e = get(v, 'e', null)
            let GS = get(v, 'GS', null)
            let rd = get(v, 'rd', null) //乾單位重rd(kN/m3)
            let rsat = get(v, 'rsat', null) //飽和單位重rsat(kN/m3)
            let t = relaPorousParams(rd, rsat, GS, e)
            if (get(t, 'err')) { //err為非中斷之錯誤訊息, 故需直接儲存
                if (err === '') {
                    err = t.err
                }
                else {
                    if (err.indexOf(t.err) < 0) { //若不存在才加入
                        err += `, ${t.err}`
                    }
                }
                v.err = err
            }
            //err為非中斷訊息, 故各參數需獨立偵測是否為數值並儲存
            if (isNumber(t.rd)) {
                v.rd = t.rd
            }
            else {
                v.rd = ''
            }
            if (isNumber(t.rsat)) {
                v.rsat = t.rsat
            }
            else {
                v.rsat = ''
            }
            if (isNumber(t.GS)) {
                v.GS = t.GS
            }
            else {
                v.GS = ''
            }
            if (isNumber(t.e)) {
                v.e = t.e
            }
            else {
                v.e = ''
            }

            // if (kind === 'SPT') {

            // }
            // else if (kind === 'CPT') {

            // }
            // else if (kind === 'VS') {

            // }

            return v
        })

        return rows
    }

    //liqParams
    let liqParams = (kind, waterLevelUsual, waterLevelDesign, Mw, PGA, vibrationType, rows) => {

        //複寫各層Mw, PGA, vibrationType, 且此處不檢核交由各列檢核
        rows = map(rows, (v, k) => {
            v.Mw = Mw
            v.PGA = PGA
            v.vibrationType = vibrationType
            return v
        })

        //waterLevelUsual, waterLevelDesign
        waterLevelUsual = cdbl(waterLevelUsual)
        waterLevelDesign = cdbl(waterLevelDesign)

        //addDepthAndPorousParams
        rows = addDepthAndPorousParams(rows, kind, waterLevelUsual, waterLevelDesign)

        //hasVerticalStress, check sv,svp
        let hasVerticalStress = true
        each(rows, (v) => {
            let b1 = isnum(v.sv)
            let b2a = isnum(v.svp)
            let b2b = isnum(v.svpUsual) && isnum(v.svpDesign)
            let b2 = b2a || b2b
            let b = b1 && b2
            if (!b) {
                hasVerticalStress = false
                return false //跳出
            }
        })

        //check
        if (!hasVerticalStress) {
            //數據無垂直應力與垂直有效應力

            //calcVerticalStress, 輸出sv與svp單位為kPa, 計算sv:土層中點深度之垂直總應力(kN/m2), svpUsual與svpDesign:土層中點深度之常時與設計垂直有效應力(kN/m2)
            rows = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
            // console.log('calcVerticalStress rows', rows[0])

        }
        else {
            //數據有垂直應力與垂直有效應力

            //unitSvSvp, 此處限制用kPa, 故指定輸入為MPa才要轉kPa
            if (unitSvSvp === 'MPa') {
                rows = map(rows, (v, k) => {
                    if (isNumber(v.sv)) {
                        v.sv *= 1000
                    }
                    if (isNumber(v.svp)) {
                        v.svp *= 1000
                    }
                    if (isNumber(v.svpUsual)) {
                        v.svpUsual *= 1000
                    }
                    if (isNumber(v.svpDesign)) {
                        v.svpDesign *= 1000
                    }
                    return v
                })
            }

            //check
            each(rows, (v, k) => {
                // console.log(k, v, v[keyDepth], 'isNumber(v[keyDepth])', isNumber(v[keyDepth]))
                if (isNumber(v.sv)) {
                    checkVerticalStress(v.sv, v[keyDepth], 'kPa', 'sv')
                }
                if (isNumber(v.svp)) {
                    checkVerticalStress(v.svp, v[keyDepth], 'kPa', 'svp')
                }
                if (isNumber(v.svpUsual)) {
                    checkVerticalStress(v.svpUsual, v[keyDepth], 'kPa', 'svpUsual')
                }
                if (isNumber(v.svpDesign)) {
                    checkVerticalStress(v.svpDesign, v[keyDepth], 'kPa', 'svpDesign')
                }
            })

            //提取calcVerticalStress部份功能, 儲存地下水位以及重算中點深度
            rows = map(rows, (v, k) => {

                //save waterLevelUsual,waterLevelDesign
                v.waterLevelUsual = waterLevelUsual
                v.waterLevelDesign = waterLevelDesign

                //ds, de
                let ds = get(v, keyDepthStart, null)
                let de = get(v, keyDepthEnd, null)

                //check
                if (!isnum(ds)) {
                    throw new Error(`第 ${k} 樣本起始深度(depthStart)非數值: ${ds}`)
                }
                if (!isnum(de)) {
                    throw new Error(`第 ${k} 樣本結束深度(depthEnd)非數值: ${de}`)
                }
                ds = cdbl(ds)
                de = cdbl(de)

                //depth, 土層中點深度(m)
                v[keyDepth] = (de + ds) / 2

                return v
            })
            // console.log('提取calcVerticalStress部份功能 rows', rows[0])

        }

        // if (kind === 'SPT') {

        // }
        // else if (kind === 'CPT') {

        // }
        // else if (kind === 'VS') {

        // }

        return rows
    }

    //liqFS
    let liqFS = (kind, row) => {

        //cloneDeep
        row = cloneDeep(row)

        //各種液化方法
        each(methodLiques[kind], (func, method) => {

            //func
            let r = func(row)
            // console.log('func r', r)

            //CSR,CRR,FS,err
            each(r, (vv, kk) => {
                // console.log(kk, 'vv', vv)
                row[`${method}-${kk}`] = vv
            })

        })

        return row
    }

    //liqPL
    let liqPL = (rows) => {

        //cloneDeep
        rows = cloneDeep(rows)

        //getKeysFromRows
        let ks = getKeysFromRows(rows)

        //計算各種液化潛勢PL
        each(ks, (key) => {
            if (key.indexOf('-FS') >= 0) {

                //method
                let method = key.replace('-FS', '')
                // console.log('method', method)

                //sumPL
                let sumPL = 0
                rows = map(rows, (v, k) => {

                    //液化方法的PL
                    // console.log('isnum(v[keyDepthStart])', isnum(v[keyDepthStart]), v[keyDepthStart])
                    // console.log('isnum(v[keyDepthEnd])', isnum(v[keyDepthEnd]), v[keyDepthEnd])
                    // console.log('isnum(v[keyDepth])', isnum(v[keyDepth]), v[keyDepth])
                    // console.log('isnum(v[key])', isnum(v[key]), v[key])
                    if (isnum(v[keyDepthStart]) &&
                        isnum(v[keyDepthEnd]) &&
                        isnum(v[keyDepth]) &&
                        isnum(v[key])
                    ) {
                        let zs = cdbl(v[keyDepthStart])
                        let ze = cdbl(v[keyDepthEnd])
                        let z = cdbl(v[keyDepth])
                        let FL = cdbl(v[key])
                        let F = 1 - Math.min(Math.max(FL, 0), 1)
                        let W = 10 - 0.5 * z
                        sumPL += F * W * (ze - zs)
                        // console.log('zs', zs)
                        // console.log('ze', ze)
                        // console.log('z', z)
                        // console.log('FL', FL)
                        // console.log('F', F)
                        // console.log('W', W)
                        // console.log('F * W * (ze - zs)', F * W * (ze - zs))
                        // console.log('sumPL', sumPL)
                    }

                    //save
                    v[`${method}-PL`] = sumPL

                    return v
                })

            }
        })

        return rows
    }

    //liqSett
    let liqSett = (rows) => {

        //cloneDeep
        rows = cloneDeep(rows)

        //getKeysFromRows
        let ks = getKeysFromRows(rows)

        //計算各種液化沉陷
        each(ks, (key) => {
            if (key.indexOf('-vstr') >= 0) {

                //s
                let s = split(key, '-vstr')
                // console.log('s', s)

                //method
                let method = get(s, 0, '')
                // console.log('method', method)

                //type
                let type = get(s, 1, '')
                // console.log('type', type)

                //sumStl
                let sumStl = 0
                rows = map(rows, (v, k) => {
                    // console.log(k, v, 'key', key, 'v[key]', v[key])

                    //液化方法的vstr
                    // console.log('isnum(v[keyDepthStart])', isnum(v[keyDepthStart]), v[keyDepthStart])
                    // console.log('isnum(v[keyDepthEnd])', isnum(v[keyDepthEnd]), v[keyDepthEnd])
                    // console.log('isnum(v[key])', isnum(v[key]), v[key])
                    if (isnum(v[keyDepthStart]) &&
                        isnum(v[keyDepthEnd]) &&
                        isnum(v[key])
                    ) {
                        let zs = cdbl(v[keyDepthStart])
                        let ze = cdbl(v[keyDepthEnd])

                        let vstr = cdbl(v[key]) / 100 //由百分比(%)還原成比例
                        sumStl += vstr * (ze - zs)
                    }

                    //save
                    v[`${method}-stl${type}`] = sumStl //沉陷(m)

                    return v
                })

            }
        })

        return rows
    }

    //check
    if (!isearr(rows)) {
        throw new Error(`無有效數據`)
    }

    //check
    if (!isestr(kind)) {
        throw new Error('kind(分析種類)非字串')
    }
    if (kind !== 'SPT' && kind !== 'CPT' && kind !== 'VS') { //auto
        throw new Error(`kind(分析種類)${brk(kind)}非有效值: SPT, CPT, VS`)
    }

    //cloneDeep
    rows = cloneDeep(rows)
    // console.log('cloneDeep rows', rows[0])

    //checkDepthStartEnd
    let ckds = checkDepthStartEnd(rows)
    if (size(ckds) > 0) {
        throw new Error(join(ckds, ', '))
    }

    //sortBy
    rows = sortBy(rows, (v) => {
        return cdbl(v[keyDepthStart])
    })

    //waterLevelUsual, 常時地下水位, 直接使用最上層數據
    let waterLevelUsual = get(rows, '0.waterLevelUsual', 0)

    //waterLevelDesign, 設計地下水位, 直接使用最上層數據
    let waterLevelDesign = get(rows, '0.waterLevelDesign', 0)

    //Mw, 地震矩規模, 直接使用最上層數據, 此處不檢核交由各列檢核
    let Mw = get(rows, '0.Mw', '')

    //PGA, 最大地表加速度(g), 直接使用最上層數據, 此處不檢核交由各列檢核
    let PGA = get(rows, '0.PGA', '')

    //vibrationType, 振動形式, 直接使用最上層數據, 此處不檢核交由各列檢核
    let vibrationType = get(rows, '0.vibrationType', '')

    // //kind
    // if (kind === 'auto') {

    //     //getLiqueKindFromRow, rows需已進行液化分析, 故可由第1列第1個出現[-FS]欄位判斷此數據所進行的液化分析種類kind
    //     kind = getLiqueKindFromRow(rows)

    // }

    //liqParams, 自動計算參數
    rows = liqParams(kind, waterLevelUsual, waterLevelDesign, Mw, PGA, vibrationType, rows)
    // console.log('liqParams rows', rows[0])

    //liqFS, 各樣本計算安全係數與沉陷
    rows = map(rows, (row, k) => {
        return liqFS(kind, row)
    })

    //liqPL, 目前僅SPT法可使用liqPL計算液化潛勢PL, 不適用於CPT
    if (kind === 'SPT') {
        rows = liqPL(rows)
    }

    //liqSett, 目前僅SPT法有支援計算沉陷
    if (kind === 'SPT') {
        rows = liqSett(rows)
    }

    //排序欄位
    rows = map(rows, (row) => {
        let r = {}
        let kd = toLower(kind)
        let nkd = size(kd)

        //添加非結果欄位
        each(row, (v, k) => {
            if (strleft(k, nkd) !== kd) {
                r[k] = v
            }
        })

        //添加各液化分析結果
        each(methodLiques[kind], (m, km) => {
            let nkm = size(km)
            let kerr = ''
            let err = ''
            each(row, (v, k) => {
                if (strleft(k, nkm) === km) {
                    if (strright(k, 4) === '-err') {
                        kerr = k
                        err = v
                    }
                    else {
                        //先儲存非err欄位
                        r[k] = v
                    }
                }
            })
            if (kerr !== '') {
                //最後才添加err欄位
                r[kerr] = err
            }
        })

        return r
    })

    //清除非有效值
    each(rows, (r, ir) => {
        each(r, (v, k) => {
            if (!isestr(v) && !isnum(v)) {
                // console.log(ir, k, v)
                rows[ir][k] = ''
            }
        })
    })
    // console.log('rows', rows[0])

    //unitSvSvp, 此處限制用kPa, 故指定為輸出MPa才要轉MPa
    if (unitSvSvp === 'MPa') {
        rows = map(rows, (v) => {
            if (isNumber(v.sv)) {
                v.sv /= 1000
            }
            if (isNumber(v.svp)) {
                v.svp /= 1000
            }
            if (isNumber(v.svpUsual)) {
                v.svpUsual /= 1000
            }
            if (isNumber(v.svpDesign)) {
                v.svpDesign /= 1000
            }
            return v
        })
    }

    return rows
}


/**
 * 液化分析
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/calcLiquefaction.test.js Github}
 * @memberOf w-geo
 * @example
 *
 * let rowsIn = `[{"sampleId":"S-1","depthStart":"0","depthEnd":"3.5","depth":"1.75","N60":"8","w":"20.8","GS":"2.7","e":"0.86","LL":"32.5","PI":"11.4","soilClassification":"CL","D50":"","D10":"","FC":"76.09999847","rd":"14.21150662","PGA":"0.612","Mw":"7.6","waterLevelUsual":"0","waterLevelDesign":"0"},...]`
 * rowsIn = JSON.parse(rowsIn)
 * // console.log('rowsIn',rowsIn)
 *
 * let rowsOut = calcLiquefaction.calc('SPT', rowsIn)
 * // console.log('rowsOut',rowsOut)
 *
 * fs.writeFileSync('./rowsIn.json', JSON.stringify(rowsIn), 'utf8')
 * fs.writeFileSync('./rowsOut.json', JSON.stringify(rowsOut), 'utf8')
 *
 * // let mat = w.ltdtkeysheads2mat(rowsOut)
 * // w.downloadExcelFileFromData('./mat.xlsx', 'mat', mat)
 *
 */
let calcLiquefaction = {
    mLiques: methodLiques,
    mSettls: methodSettlements,
    calc: liquefaction,
}


export default calcLiquefaction
