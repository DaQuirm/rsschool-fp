// "Typeclasses", Monoid & Writer, Kleisli composition
// TODO: Traversable

// "Haskell" impl in JS can be done because l-calculus in JS can be done :D

const Class = {}

Class.Show = show => ({show})
Class.Monoid = _.identity

Class.Foldable = Foldable => _.assign({
  fold: Monoid => Foldable.foldl(Monoid.mappend)(Monoid.mempty)
})(Foldable)

Class.Functor = _.identity

Class.Functor.fromMonad = Monad => Class.Functor({
  map: f => ma => Monad.bind(a => Monad.pure(f(a)))(ma)
})

Class.Applicative = Functor => Applicative => _.assign({
  lift2: f => ma => mb => Applicative.apply(Functor.map(f)(ma))(mb)
})(Applicative)

Class.Applicative.fromMonad = Monad => 
  Class.Applicative(Class.Functor.fromMonad(Monad))({
    pure: Monad.pure,
    apply: mf => ma => 
      Monad.bind(f => Monad.bind(a => Monad.pure(f(a)))(ma))(mf)
  })

Class.Monad = _.identity

// String
String.Show = Class.Show(s => `'${s}'`)

String.Monoid = Class.Monoid({
  mempty: '',
  mappend: strA => strB => strA + strB
})

// Number
Number.Show = Class.Show(_.toString)

Number.Monoid = Class.Monoid({
  mempty: 0,
  mappend: x => y => x + y
})

// Array

// (Show a) => [a] -> String
Array.Show = Show => Class.Show(xs => `[${xs.map(Show.show).join(', ')}]`)

Array.Monoid = Class.Monoid({
  mempty: [],
  mappend: arrA => arrB => arrA.concat(arrB)
})

const uncurry = f => (x, y) => f(x)(y)
const compose = f => g => x => f(g(x))

// Foldable Array
Array.Foldable = Class.Foldable({
  foldl: f => _.reduce(uncurry(f)),
  foldr: f => _.reduceRight(uncurry(flip(f)))
})

// Maybe

const Maybe = {}
const Just = Maybe.Just = value => ({ value })
const Nothing = Maybe.Nothing = null

Maybe.maybe = fallback => f => m => {  
  if (m !== null) {
    return f(m.value)
  }
  return fallback
}

Maybe.Show = Show => Class.Show(Maybe.maybe('Nothing')(Show.show))

Maybe.Functor = Class.Functor({
  map: f => ma => Maybe.maybe(Nothing)(compose(Just)(f))(ma)
})

// Maybe.Applicative = Class.Applicative(Maybe.Functor)({
//   pure: Just,
//   apply: mF => mA => Maybe.maybe(Nothing)(f => Maybe.Functor.map(f)(mA))(mF)
// })

Maybe.Monad = Class.Monad({
  pure: Just,
  bind: f => m => Maybe.maybe(Nothing)(f)(m)
})

Maybe.Applicative = Class.Applicative.fromMonad(Maybe.Monad)

console.log('==========|Applicative Maybe|==========')

const mA0 = Maybe.Applicative.lift2(_.add)(Just(2))(Just(5))
console.log(Maybe.Show(Number.Show).show(mA0))
const mA1 = Maybe.Applicative.lift2(_.add)(Nothing)(Just(5))
console.log(Maybe.Show(Number.Show).show(mA1))
const mA2 = Maybe.Applicative.lift2(_.add)(Just(2))(Nothing)
console.log(Maybe.Show(Number.Show).show(mA2))

Maybe.Monoid = Monoid => Class.Monoid({
  mempty: Nothing,
  mappend: ma => mb => 
    Maybe.Monad.bind(x => 
      Maybe.Monad.bind(y => 
        Just(Monoid.mappend(x)(y)))(mb)
    )(ma)
})

console.log('==========|Monoid Maybe|==========')

const m0 = Maybe.Monoid(String.Monoid).mappend(Just('Hello'))(Just(', world!'))
console.log(Maybe.Show(String.Show).show(m0))

const m1 = Maybe.Monoid(String.Monoid).mappend(Just('Hello'))(Nothing)
console.log(Maybe.Show(String.Show).show(m1))

const m2 = Maybe.Monoid(Number.Monoid).mappend(Just(3))(Just(7))
console.log(Maybe.Show(Number.Show).show(m2))

const m3 = Maybe.Monoid(Number.Monoid).mappend(Nothing)(Just(7))
console.log(Maybe.Show(Number.Show).show(m3))

const m4 = Maybe.Monoid(Array.Monoid).mappend(Just([1, 2]))(Just([3, 4, 5]))
console.log(Maybe.Show(Array.Show(Number.Show)).show(m4))

const Kleisli = Monad => {
  const compose = f => g => x => Monad.bind(g)(f(x))
  const Monoid = Class.Monoid({
    mempty: Monad.pure,
    mappend: compose
  })
  return {
    compose,    
    Monoid,
    // (Monad m) => (Foldable t) => t (a -> m a) -> (a -> m a)
    flowM: Foldable => Foldable.fold(Monoid)
  }
}

const Tuple = a => b => [a, b]
Tuple.fst = _.get('0')
Tuple.snd = _.get('1')

// Show Tuple
Tuple.Show = ShowA => ShowB => Class.Show(
  ([a, b]) => `(${ShowA.show(a)}, ${ShowB.show(b)})`
)

const Writer = Tuple // whoa

Writer.Monad = Monoid => Class.Monad({
  pure: x => Writer(x)(Monoid.mempty),
  bind: f => w => {
    const wr = f(Tuple.fst(w))
    return Writer(Tuple.fst(wr))(Monoid.mappend(Tuple.snd(w))(Tuple.snd(wr)))
  }
})

Writer.Kleisli = Monoid => Kleisli(Writer.Monad(Monoid))

const flip = f => x => y => f(y)(x)
// Writer :: a -> m -> Writer a m
// Writer.log :: m -> Writer a m
Writer.log = flip(Writer)

const negateNumber = x => Writer(-x)([`Negated number ${x}!`])

console.log('==========|Writer|==========')

const w0 = Writer.Monad(Array.Monoid).bind(x => negateNumber(2 * x))(negateNumber(10));
console.log(Writer.Show(Number.Show)(Array.Show(String.Show)).show(w0))

// "shorthand"/instantiation
// (Monoid m) => (Foldable t) => t (a -> Writer a m) -> (a -> Writer a m)
Writer.flowM = Monoid => Foldable => Writer.Kleisli(Monoid).flowM(Foldable)

const w1 = Writer.flowM(Array.Monoid)(Array.Foldable)([
  Writer.log(['Let\'s negate the number']),
  negateNumber,
  Writer.log(['Now let\'s negate its square']),
  x => negateNumber(x * x)
])(37)

console.log(Writer.Show(Number.Show)(Array.Show(String.Show)).show(w1))
