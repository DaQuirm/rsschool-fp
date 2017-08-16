// "Typeclasses", Monoid & Writer, Kleisli composition
// TODO: partial instances (???)

// Show String
String.show = s => `'${s}'`

// Monoid String
String.mempty = ''
String.mappend = strA => strB => strA + strB

// Show Number
Number.show = _.toString

// Monoid Number
Number.mempty = 0
Number.mappend = x => y => x + y

// Show Array
// (Show a) => [a] -> String
Array.Show = Show => ({
  show: xs => `[${xs.map(Show.show).join(', ')}]`
})

// Monoid Array
Array.mempty = []
Array.mappend = arrA => arrB => arrA.concat(arrB)

const uncurry = f => (x, y) => f(x)(y)
const compose = f => g => x => f(g(x))

// Foldable Array
Array.foldl = f => _.reduce(uncurry(f))
Array.foldr = f => _.reduceRight(uncurry(f))
Array.fold = Monoid => Array.foldr(flip(Monoid.mappend))(Monoid.mempty)

const Maybe = {}
const Just = Maybe.Just = value => ({ value })
const Nothing = Maybe.Nothing = null

Maybe.maybe = fallback => f => m => {  
  if (m !== null) {
    return f(m.value)
  }
  return fallback
}

Maybe.Show = Show => ({
  show: Maybe.maybe('Nothing')(Show.show)
})

// Monad Maybe
Maybe.pure = Just
Maybe.bind = f => m => Maybe.maybe(Nothing)(f)(m)

// Monoid Maybe 
Maybe.Monoid = Monoid => ({
  mempty: Nothing,
  mappend: mA => mB => 
    Maybe.bind(x => 
      Maybe.bind(y => 
        Just(Monoid.mappend(x)(y)))(mB)
    )(mA)
})

const m0 = Maybe.Monoid(String).mappend(Just('Hello'))(Just(', world!'))
console.log(Maybe.Show(String).show(m0))

const m1 = Maybe.Monoid(String).mappend(Just('Hello'))(Nothing)
console.log(Maybe.Show(String).show(m1))

const m2 = Maybe.Monoid(Number).mappend(Just(3))(Just(7))
console.log(Maybe.Show(Number).show(m2))

const m3 = Maybe.Monoid(Number).mappend(Nothing)(Just(7))
console.log(Maybe.Show(Number).show(m3))

const m4 = Maybe.Monoid(Array).mappend(Just([1, 2]))(Just([3, 4, 5]))
console.log(Maybe.Show(Array.Show(Number)).show(m4))

const Kleisli = {}

Kleisli.compose = Monad => f => g => x => Monad.bind(f)(g(x))

Kleisli.Monoid = Monad => ({
  mempty: Monad.pure,
  mappend: Kleisli.compose(Monad)
})

// (Monad m) => (Foldable t) => t (a -> m a) -> (a -> m a)
Kleisli.flowM = Monad => Foldable => Foldable.fold(Kleisli.Monoid(Monad))

const Tuple = a => b => [a, b]
Tuple.fst = _.get('0')
Tuple.snd = _.get('1')

// Show Tuple
Tuple.Show = ShowA => ShowB => ({
  show: ([a, b]) => `(${ShowA.show(a)}, ${ShowB.show(b)})`
})

const Writer = Tuple // whoa

Writer.Monad = Monoid => ({
  pure: x => Writer(x)(Monoid.mempty),
  bind: f => w => {
    const wr = f(Tuple.fst(w))
    return Writer(Tuple.fst(wr))(Monoid.mappend(Tuple.snd(w))(Tuple.snd(wr)))
  }
})

const flip = f => x => y => f(y)(x)
// Writer :: a -> m -> Writer a m
// Writer.log :: m -> Writer a m
Writer.log = flip(Writer)

const negateNumber = x => Writer(-x)([`Negated number ${x}!`])

const w0 = Writer.Monad(Array).bind(x => negateNumber(2 * x))(negateNumber(10));
console.log(Writer.Show(Number)(Array.Show(String)).show(w0))

// "shorthand"/instantiation
// (Monoid m) => (Foldable t) => t (a -> Writer a m) -> (a -> Writer a m)
Writer.flowM = Monoid => Foldable => Kleisli.flowM(Writer.Monad(Monoid))(Foldable)

const w1 = Writer.flowM(Array)(Array)([
  Writer.log(['Let\'s negate the number']),
  negateNumber,
  Writer.log(['Now let\'s negate its square']),
  x => negateNumber(x * x)
])(37)

console.log(Writer.Show(Number)(Array.Show(String)).show(w1))
