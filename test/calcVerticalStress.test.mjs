import assert from 'assert'
import { calcVerticalStress } from '../src/calcVerticalStress.mjs'


describe(`calcVerticalStress`, function() {

    let f1 = () => {
        let waterLevelUsual = 0
        let waterLevelDesign = 0
        let rows = [
            {
                depthStart: 0,
                depthEnd: 5,
                rsat: 18, //kN/m3
            },
            {
                depthStart: 5,
                depthEnd: 10,
                rsat: 18, //kN/m3
            },
            {
                depthStart: 10,
                depthEnd: 20,
                rsat: 18, //kN/m3
            },
        ]
        // let rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
        // console.log(rowsNew, (18 - 9.81) * 15) //地下 15(m) 處之垂直有效應力為 122.85(kN/m2)
        let rowsNew = [
            {
                depthStart: 0,
                depthEnd: 5,
                rsat: 18,
                waterLevelUsual: 0,
                waterLevelDesign: 0,
                sv: 45,
                svpUsual: 20.474999999999998,
                svpDesign: 20.474999999999998,
                depth: 2.5
            },
            {
                depthStart: 5,
                depthEnd: 10,
                rsat: 18,
                waterLevelUsual: 0,
                waterLevelDesign: 0,
                sv: 135,
                svpUsual: 61.425,
                svpDesign: 61.425,
                depth: 7.5
            },
            {
                depthStart: 10,
                depthEnd: 20,
                rsat: 18,
                waterLevelUsual: 0,
                waterLevelDesign: 0,
                sv: 270,
                svpUsual: 122.85,
                svpDesign: 122.85,
                depth: 15
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcVerticalStress(${JSON.stringify(rows)}, ${JSON.stringify({ waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })})`, function() {
            let r = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f1()

    let f2 = () => {
        let waterLevelUsual = 0
        let waterLevelDesign = 0
        let rows = [
            {
                depthStart: 0,
                depthEnd: 5,
                rsat: 18, //kN/m3
            },
            {
                depthStart: 5,
                depthEnd: 10,
                rsat: 19, //kN/m3
            },
            {
                depthStart: 10,
                depthEnd: 20,
                rsat: 20, //kN/m3
            },
        ]
        // let rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
        // console.log(rowsNew, (19 - 9.81) * 15) //地下 15(m) 處之垂直有效應力為 137.85(kN/m2)
        let rowsNew = [
            {
                depthStart: 0,
                depthEnd: 5,
                rsat: 18,
                waterLevelUsual: 0,
                waterLevelDesign: 0,
                sv: 45,
                svpUsual: 20.474999999999998,
                svpDesign: 20.474999999999998,
                depth: 2.5
            },
            {
                depthStart: 5,
                depthEnd: 10,
                rsat: 19,
                waterLevelUsual: 0,
                waterLevelDesign: 0,
                sv: 137.5,
                svpUsual: 63.925,
                svpDesign: 63.925,
                depth: 7.5
            },
            {
                depthStart: 10,
                depthEnd: 20,
                rsat: 20,
                waterLevelUsual: 0,
                waterLevelDesign: 0,
                sv: 285,
                svpUsual: 137.85,
                svpDesign: 137.85,
                depth: 15
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcVerticalStress(${JSON.stringify(rows)}, ${JSON.stringify({ waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })})`, function() {
            let r = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f2()

    let f3 = () => {
        let waterLevelUsual = 20
        let waterLevelDesign = 20
        let rows = [
            {
                depthStart: 0,
                depthEnd: 5,
                rd: 18, //kN/m3
            },
            {
                depthStart: 5,
                depthEnd: 10,
                rd: 18, //kN/m3
            },
            {
                depthStart: 10,
                depthEnd: 20,
                rd: 18, //kN/m3
            },
        ]
        // let rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
        // console.log(rowsNew, (18) * 15) //地下 15(m) 處之垂直總應力與垂直有效應力為 270(kN/m2)
        let rowsNew = [
            {
                depthStart: 0,
                depthEnd: 5,
                rd: 18,
                waterLevelUsual: 20,
                waterLevelDesign: 20,
                sv: 45,
                svpUsual: 45,
                svpDesign: 45,
                depth: 2.5
            },
            {
                depthStart: 5,
                depthEnd: 10,
                rd: 18,
                waterLevelUsual: 20,
                waterLevelDesign: 20,
                sv: 135,
                svpUsual: 135,
                svpDesign: 135,
                depth: 7.5
            },
            {
                depthStart: 10,
                depthEnd: 20,
                rd: 18,
                waterLevelUsual: 20,
                waterLevelDesign: 20,
                sv: 270,
                svpUsual: 270,
                svpDesign: 270,
                depth: 15
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcVerticalStress(${JSON.stringify(rows)}, ${JSON.stringify({ waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })})`, function() {
            let r = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f3()

    let f4 = () => {
        let waterLevelUsual = 3
        let waterLevelDesign = 3
        let rows = [
            {
                depthStart: 0,
                depthEnd: 3,
                rd: 18, //kN/m3
            },
            {
                depthStart: 3,
                depthEnd: 11,
                rsat: 20, //kN/m3
            },
        ]
        // let rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
        // console.log(rowsNew, 18 * 3 + (20 * 4 - 9.81 * 4)) //地下 7(m) 處之垂直有效應力為 94.76(kN/m2)
        let rowsNew = [
            {
                depthStart: 0,
                depthEnd: 3,
                rd: 18,
                waterLevelUsual: 3,
                waterLevelDesign: 3,
                sv: 27,
                svpUsual: 27,
                svpDesign: 27,
                depth: 1.5
            },
            {
                depthStart: 3,
                depthEnd: 11,
                rsat: 20,
                waterLevelUsual: 3,
                waterLevelDesign: 3,
                sv: 134,
                svpUsual: 94.75999999999999,
                svpDesign: 94.75999999999999,
                depth: 7
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcVerticalStress(${JSON.stringify(rows)}, ${JSON.stringify({ waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })})`, function() {
            let r = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f4()

    let f5 = () => {
        let waterLevelUsual = 3
        let waterLevelDesign = 3
        let rows = [
            {
                depthStart: 0,
                depthEnd: 1,
                rd: 18, //kN/m3
            },
            {
                depthStart: 1,
                depthEnd: 5,
                rd: 18, //kN/m3
                rsat: 20, //kN/m3
            },
            {
                depthStart: 5,
                depthEnd: 9,
                rsat: 20, //kN/m3
            },
        ]
        // let rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
        // console.log(rowsNew, 18 * 3 + (20 * 4 - 9.81 * 4)) //地下 7(m) 處之垂直有效應力為 94.76(kN/m2)
        let rowsNew = [
            {
                depthStart: 0,
                depthEnd: 1,
                rd: 18,
                waterLevelUsual: 3,
                waterLevelDesign: 3,
                sv: 9,
                svpUsual: 9,
                svpDesign: 9,
                depth: 0.5
            },
            {
                depthStart: 1,
                depthEnd: 5,
                rd: 18,
                rsat: 20,
                waterLevelUsual: 3,
                waterLevelDesign: 3,
                sv: 56,
                svpUsual: 56,
                svpDesign: 56,
                depth: 3
            },
            {
                depthStart: 5,
                depthEnd: 9,
                rsat: 20,
                waterLevelUsual: 3,
                waterLevelDesign: 3,
                sv: 134,
                svpUsual: 94.75999999999999,
                svpDesign: 94.75999999999999,
                depth: 7
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcVerticalStress(${JSON.stringify(rows)}, ${JSON.stringify({ waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })})`, function() {
            let r = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f5()

    let f6 = () => {
        let waterLevelUsual = 3
        let waterLevelDesign = 0
        let rows = [
            {
                depthStart: 0,
                depthEnd: 1,
                rd: 18, //kN/m3
                rsat: 20, //kN/m3
            },
            {
                depthStart: 1,
                depthEnd: 5,
                rd: 18, //kN/m3
                rsat: 20, //kN/m3
            },
            {
                depthStart: 5,
                depthEnd: 9,
                rsat: 20, //kN/m3
            },
        ]
        // let rowsNew = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
        // console.log(rowsNew, 18 * 3 + (20 * 4 - 9.81 * 4), (20 - 9.81) * 7) //地下 7(m) 處之常時垂直有效應力為 94.76(kN/m2), 設計垂直有效應力為 71.33(kN/m2)
        let rowsNew = [
            {
                depthStart: 0,
                depthEnd: 1,
                rd: 18,
                rsat: 20,
                waterLevelUsual: 3,
                waterLevelDesign: 0,
                sv: 9,
                svpUsual: 9,
                svpDesign: 5.095,
                depth: 0.5
            },
            {
                depthStart: 1,
                depthEnd: 5,
                rd: 18,
                rsat: 20,
                waterLevelUsual: 3,
                waterLevelDesign: 0,
                sv: 56,
                svpUsual: 56,
                svpDesign: 30.57,
                depth: 3
            },
            {
                depthStart: 5,
                depthEnd: 9,
                rsat: 20,
                waterLevelUsual: 3,
                waterLevelDesign: 0,
                sv: 134,
                svpUsual: 94.75999999999999,
                svpDesign: 71.33,
                depth: 7
            }
        ]

        it(`should return ${JSON.stringify(rowsNew)} when calcVerticalStress(${JSON.stringify(rows)}, ${JSON.stringify({ waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })})`, function() {
            let r = calcVerticalStress(rows, { waterLevelUsual, waterLevelDesign, unitSvSvp: 'kPa' })
            let rr = rowsNew
            assert.strict.deepStrictEqual(r, rr)
        })

    }
    f6()

})
