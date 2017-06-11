const compose = f => g => x => f(g(x));
const constant = x => y => x;
const apply = f => x => f(x);
const flip = f => x => y => f(y)(x);

const Boolean = {
  
  and: x => y => x && y,
  or:  x => y => x || y,
  not: x => !x
  
};

const Predicate = {
  
  // :: P a -> Boolean
  is: apply,
  
  // (b -> a) -> P a -> P b
  comap: flip(compose),
  
  // P (b -> a) -> P a -> P b
  // (b -> a) -> Boolean
  // a -> Boolean
  // b -> Boolean
//   coapply: pF => pA => 
  
  // (Boolean -> Boolean) -> P a -> P a
  
  // :: P a -> P a -> P a
//   and: pA => pB => x => Boolean.and(pA(x))(pB(x))
//   or: pA => pB => x => Boolean.or(pA(x))(pB(x))
  
  // (Boolean -> Boolean) -> P a -> P a
  bLift: compose,
  // (Boolean -> Boolean -> Boolean) -> P a -> P a -> P a
  bLift2: bF => pA => pB => x => bF(pA(x))(pB(x))
};

Predicate.not = Predicate.bLift(Boolean.not);

Predicate.and = Predicate.bLift2(Boolean.and);
Predicate.or = Predicate.bLift2(Boolean.or);

// ([Boolean] -> Boolean) -> [P a] -> P a
Predicate.bLiftArr = bF => pArr => x => bF(_.map(flip(apply)(x))(pArr));

Predicate.every = Predicate.bLiftArr(_.every(_.identity));
Predicate.any = Predicate.bLiftArr(_.some(_.identity));

Predicate.equals = a => x => x === a;
Predicate.oneOf = compose(Predicate.any)(_.map(Predicate.equals));

// Predicate Number
const pos = x => x > 0;

// console.log(Predicate.is(pos)(-37))
const posStr = Predicate.comap(Number)(pos);
const notPosStr = Predicate.not(posStr);

// console.log(Predicate.is(posStr)('-37'));
// console.log(Predicate.is(notPosStr)('-37'));

// const between = a => b => Predicate.and(x => x > a)(x => x < b);
const between = a => b => Predicate.every([x => x > a, x => x < b])
const between3and7 = between(3)(7);

// console.log(Predicate.is(between3and7)(5));
// console.log(Predicate.is(between3and7)(10));

console.log(Predicate.equals(3)(10));
console.log(Predicate.equals(3)(1*3));
console.log(Predicate.oneOf([1, 3, 5])(37));

