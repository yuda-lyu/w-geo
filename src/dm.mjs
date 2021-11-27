// import { Decimal } from 'decimal.js'
import Decimal from 'decimal.js'


function gte(x1, x2) {
    return new Decimal(x1).gte(x2)
}


function gt(x1, x2) {
    return new Decimal(x1).gt(x2)
}


function lte(x1, x2) {
    return new Decimal(x1).lte(x2)
}


function lt(x1, x2) {
    return new Decimal(x1).lt(x2)
}


function eq(x1, x2) {
    return new Decimal(x1).eq(x2)
}


function neq(x1, x2) {
    return !eq(x1, x2)
}


function judge(x1, op, x2) {
    if (op === '===') {
        return eq(x1, x2)
    }
    else if (op === '!==') {
        return neq(x1, x2)
    }
    else if (op === '>=') {
        return gte(x1, x2)
    }
    else if (op === '>') {
        return gt(x1, x2)
    }
    else if (op === '<=') {
        return lte(x1, x2)
    }
    else if (op === '<') {
        return lt(x1, x2)
    }
    else {
        console.log(op)
        throw new Error('invalid op')
    }
}

export {
    gte,
    gt,
    lte,
    lt,
    eq,
    neq,
    judge
}
