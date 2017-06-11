
const identity = x => x;
const constant = x => y => x;
const apply = f => x => f(x);
const compose = f => g => x => f(g(x));
// (S x y z) = (x z (y z))
const S = x => y => z => x(z)(y(z));

const flip = f => x => y => f(y)(x);

const Church = {
  zero: constant(identity),
  one: apply,
  toJSNumber: n => n(x => x + 1)(0)  
};


// Church.two = f => x => f(Church.one(f)(x));
// Church.three = f => x => f(Church.two(f)(x))

// Church.succ = n => f => x => f(n(f)(x));
// Church.succ = n => f => x => compose(f)(n(f))(x);
// Church.succ = n => f => compose(f)(n(f));
// Church.succ = n => f => S(compose)(n)(f);
Church.succ = S(compose);

// console.log(Church.toJSNumber(Church.succ(Church.three)))
// console.log(Church.toJSNumber(Church.succ(Church.one)));
// console.log(Church.toJSNumber(Church.succ(Church.zero)));

const Boolean = {
  TRUE: constant,
  FALSE: flip(constant),
//   cond: x => y => n => x(y)(n),
  cond: identity,
  toNumber: x => Boolean.cond(x)(Church.one)(Church.zero)
};

Boolean.toJSNumber = compose(Church.toJSNumber)(Boolean.toNumber);

// console.log(Church.toJSNumber(Boolean.toNumber(Boolean.TRUE)));
// console.log(Boolean.toJSNumber(Boolean.FALSE));

Church.isZero = n => n(constant(Boolean.FALSE))(Boolean.TRUE);

// console.log(Boolean.toJSNumber(Church.isZero(Church.zero)));
// console.log(Boolean.toJSNumber(Church.isZero(Church.one)));
// console.log(Boolean.toJSNumber(Church.isZero(Church.succ(Church.one))));

// Church.add = a => b => f => x => a(f)(b(f)(x));
// Church.add = a => b => f => compose(b(f))(a(f));
// x(z)(y(z)) z = f, y = a , x = compose(compose)(b)
// Church.add = a => b => f => S(compose(b)(compose))(a)(f); 
// Church.add = a => b => S(compose(b)(compose))(a); 
// Church.add = a => b => S(compose(a)(compose))(b); 
// Church.add = a => S(compose(a)(compose)); 
// Church.add = a => S(flip(compose)(compose)(a));
Church.add = compose(S)(flip(compose)(compose))

Church.two = Church.succ(Church.one);
Church.three = Church.succ(Church.two);

console.log(Church.toJSNumber(Church.add(Church.one)(Church.two)));

// Church.mul = a => b => f => x => a(b(f))(x);
// Church.mul = a => b => f => a(b(f));
Church.mul = compose;

console.log(Church.toJSNumber(Church.mul(Church.three)(Church.two)));
