// Morgensen-Scott encoding
// representing sum types in lambda calculus
// closure = memory :)

// 1 constructor
const Unit = {};
Unit.Unit = x => x; // {}??

// 2 constructors
const Boolean = {};

Boolean.True = x => y => x;
Boolean.False = x => y => y;

Boolean.cond = value => t => f => value(t)(f)

// 4 Constructors / "enum"
const Suit = {};

Suit.Hearts   = a => b => c => d => a
Suit.Diamonds = a => b => c => d => b
Suit.Clubs    = a => b => c => d => c
Suit.Spades   = a => b => c => d => d

Suit.match = suit => h => d => c => s => suit(h)(d)(c)(s)

// 2 constructors with arguments, "polymorphic"
const Maybe = {};
Maybe.Nothing = x => y => x;
Maybe.Just = value => x => y => y(value);

const {Nothing, Just} = Maybe;

Maybe.maybe = m => fallback => f => m(fallback)(f)
Maybe.show = m => Maybe.maybe(m)('Nothing')(x => `Just(${x})`)

const n = Nothing;
const j5 = Just(5)

console.log(Maybe.maybe(n)(37)(x => x + 2));
console.log(Maybe.maybe(j5)(37)(x => x + 2));

// 2 Contructors with arguments, recursive, "polymorphic"
const List = {};
List.Empty = x => y => x;
List.Cons = value => list => x => y => y(value)(list)

List.uncons = list => fallback => f => list(fallback)(f)

List.length = list => List.uncons(list)(0)(h => t => 1 + List.length(t))

console.log(List.length(List.Empty))

const l2 = List.Cons(2)(List.Empty)
const l123 = List.Cons(1)(List.Cons(2)(List.Cons(3)(List.Empty)))

console.log(List.length(l123))

List.head = list => List.uncons(list)(Nothing)(h => t => Just(h))

console.log(Maybe.show(List.head(List.Empty)));
console.log(Maybe.show(List.head(l2)));
console.log(Maybe.show(List.head(l123)));

// Product type
const Tuple = f => s => mf => mf(f)(s)

Tuple.match = mf => tuple => tuple(mf)
Tuple.fst = tuple => tuple(f => s => f)
Tuple.snd = tuple => tuple(f => s => s)

const t25 = Tuple(2)(5)
console.log(Tuple.fst(t25))
console.log(Tuple.snd(t25))
