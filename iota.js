// iota combinator
// iota f = fSK
const iota = f => f(x => y => z => x(z)(y(z)))(x => y => x)

const identity = iota(iota)
const constant = iota(iota(iota(iota)))
const S = iota(iota(iota(iota(iota))))

console.log(identity(37));
console.log(constant(37)(NaN));
console.log(S(a => x => a + x)(x => x + 1)(18))
