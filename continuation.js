const apply = f => x => f(x);
const compose = f => g => x => f(g(x));

// Cont a r = (a -> r) -> r
const Cont = cont => ({ cont });

Cont.run = ({cont}) => cont;

// :: Number -> Number -> (Number -> r) -> r
const add = x => y => next => next(x + y);

// a -> b -> Cont a r -> Cont b r

// (a -> r) -> r
// (b -> r) -> r

Cont.map = f => cA => Cont(next => Cont.run(cA)(compose(next)(f)));

// ((a -> b) -> r) -> r 
Cont.apply = cF => cA => Cont(
  next => Cont.run
    (cF)
    (f => Cont.run(cA)(compose(next)(f))));

// a -> (a -> r) -> r 

Cont.lift2 = f => cA => cB => Cont.apply(Cont.map(f)(cA))(cB);

Cont.bind = f => cA => Cont(next => Cont.run(cA)(a => Cont.run(f(a))(next)));

const add23 = Cont(add(2)(3));
const even = Cont.map(x => x % 2 === 0)(add23);

const add45 = Cont(add(4)(5));

const sumC = Cont.lift2(_.add)(add23)(add45);

const cont37 = Cont.bind(x => Cont(add(32)(x)))(add23);

// (b -> Cont c r) -> (a -> Cont b r) -> (a -> Cont c r)
Cont.composeM = f => g => x => Cont.bind(f)(g(x));

// Number -> Cont () ()
const wait = ms => Cont(next => setTimeout(next, ms));

// String -> Cont Object ()
const request = url => Cont(next => fetch(url).then(next));

const parseJson = response => Cont(next => response.json().then(next));

const mostStars = _.maxBy(_.get('stargazers_count'));

// (a -> b) -> a -> Cont b r
const liftC = f => x => Cont(next => next(f(x)));

Cont.flowM = fs => _.reduce((acc, f) => Cont.composeM(f)(acc))(liftC(_.identity))(fs);

Cont.run(
  Cont.flowM([
    request,
    parseJson,
    liftC(mostStars),
    liftC(_.get('contributors_url')),
    request,
    parseJson,
    liftC(_.map(_.get('avatar_url')))
  ])
  ('https://api.github.com/users/DaQuirm/repos')
)(console.log);
  

// Cont.run(cont37)(console.log);


