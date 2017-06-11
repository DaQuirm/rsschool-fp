const identity = x => x;
const apply = f => x => f(x);
const compose = f => g => x => f(g(x));
const flip = f => x => y => f(y)(x);
const S = f => g => x => f(x)(g(x));
const W = x => x(x);

// Lazy a = () -> a
const Lazy = f => x => () => f(x);

const Lazy2 = f => x => y => compose(flip(apply)(y))(Lazy(f)(x));

Lazy.constant = Lazy(identity);

Lazy.eval = l => {
  const value = l();  
  console.log(`evaluated ${value}`);
  return value;
}

Lazy.map = compose;
// Lazy.map = f => Lazy(flip(compose)(Lazy.eval)(f))

// Lazy (a -> b) -> Lazy a -> Lazy b
// * -> a -> b
// * -> a
Lazy.apply =
  // f(x)(f(y)) = S(flip(apply)(x))(flip(apply)(y))(f)
  // S(flip(apply)(lF))(flip(apply)(lA))(Lazy.eval)
  // Lazy(S(flip(apply)(lF))(flip(apply)(lA)))(Lazy.eval)
  
  // Lazy.map(Lazy.eval(lF))(lA)
  // compose(Lazy.eval)(Lazy.map)(lF)(lA)

  // Lazy(compose(Lazy.eval)(compose(Lazy.map)(Lazy.eval)(lF)))(lA)
  // Lazy(compose(Lazy.eval)(compose(Lazy.map)(Lazy.eval)(lF)))
//   Lazy(compose
//        (compose(Lazy.eval))
//        (compose(Lazy.map)(Lazy.eval))(lF)
//       )
// compose(Lazy)(compose
//        (compose(Lazy.eval))
//        (compose(Lazy.map)(Lazy.eval))
//       )(lF)
// compose
//   (Lazy)
//   (compose(compose(Lazy.eval))
//   (compose(compose)(Lazy.eval)))
  
//   lF => lA => () => Lazy.eval(lF)(Lazy.eval(lA))
//   Lazy2(lF => lA => Lazy.eval(lF)(Lazy.eval(lA)));
//   Lazy2(lF => compose(Lazy.eval(lF))(Lazy.eval));
//   Lazy2(lF => flip(compose)(Lazy.eval)(Lazy.eval(lF)));
//   Lazy2(compose(flip(compose)(Lazy.eval))(Lazy.eval));
//     Lazy2(flip(compose)(Lazy.eval)(flip(compose)(Lazy.eval)));
//     Lazy2(W(flip(compose)(Lazy.eval)));  
    Lazy2(W(flip(compose)(Lazy.eval)));

Lazy.lift2 = compose(compose(Lazy.apply))(Lazy.map);

// (a -> Lazy b) -> Lazy a -> Lazy b
// Lazy.bind = Lazy2(f => lA => Lazy.eval(Lazy.eval(Lazy.map(f)(lA))))
// Lazy.bind = Lazy2(f => lA => Lazy.eval(f(Lazy.eval(lA))));
Lazy.bind = Lazy2(compose(compose(Lazy.eval))(flip(compose)(Lazy.eval)));

const l2 = Lazy.constant(2);
const l5 = Lazy.map(_.add(2))(Lazy.constant(3));
const l7 = Lazy.lift2(_.add)(l2)(l5);

// console.log(Lazy.eval(l5));
// console.log(Lazy.eval(l7));


const Eff = Lazy;
const Eff2 = Lazy2;
const unit = undefined;
// Eff Number
const random = Eff(Math.random)(unit);
const round = Math.round;
// Number -> Eff Number
const randomUpTo = n => Eff.map(_.multiply(n))(random);
const randomIntUpTo = compose(Eff.map(round))(randomUpTo);
// String -> String -> Eff String
const ask = Eff2(t => d => prompt(t, d));

const guessed = randomIntUpTo(1); // Eff Number
const input = ask('Make a guess')('0'); // Eff String
const guess = Eff.map(Number)(input); // Eff Number

const correct = Eff.lift2(_.eq)(guessed)(guess); // Eff Boolean

const _log = x => console.log(x); 
const log = Eff(_log); // String -> Eff Unit

const result0 = Eff.bind(log)()
const result = Eff.bind(log)(correct);

// console.log(Eff.eval(randomRange(5)));
Eff.eval(result);
