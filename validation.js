const compose = f => g => x => f(g(x));
const constant = x => y => x;
const apply = f => x => f(x);
const flip = f => x => y => f(y)(x);
const identity = x => x;
const cond = x => t => f => x ? t : f;
const condF = c => t => f => x => c(x) ? t(x) : f(x);

const Field = name => value => ({ name, value });

Field.getName = _.get('name');
Field.getValue = _.get('value');
Field.map = f => field => Field(Field.getName(field))(f(Field.getValue(field)));

const Map = pairs => _.fromPairs(pairs);

// Map a = Map k a
// (a -> b) -> Map k a -> Map k b
Map.map = _.mapValues;
Map.get = _.get;

// FormState a = Map String (Field a)
const FormState = s => Map(s);
// (a -> b) -> FormState a -> FormState b
FormState.map = compose(Map.map)(Field.map);
FormState.get = compose(compose(Field.getValue))(Map.get);

const formState = FormState([
  ['firstName',   Field('First name')('alexander')],
  ['lastName',    Field('Last name')('supertramp')], 
  ['likesOlives', Field('Olives')('false')],
  ['destination', Field('Destination')('noumea')],
  ['budget',      Field('Budget(EUR)')('600')],
  ['from',        Field('From')('2017.07.19')],
  ['to',          Field('To')('2017.07.20')]
]);

// parseInt :: String -> Number -> Number
// getName :: (id)Number -> Maybe String

// Algebraic Data Types (ADTs)
// Boolean
// | True
// | False

// Maybe a
// | Just a
// | Nothing 

const Maybe = {
  Just: x => ({ just: x }),
  Nothing: {}
};
const {Just, Nothing} = Maybe;
// fromString :: String -> Maybe String
Maybe.fromString = s => cond(_.eq('')(s))(Nothing)(Just(s));
Maybe.isJust = _.has('just');
// :: Maybe a -> (a -> b) -> b -> b
Maybe.maybe = f => fb => condF(Maybe.isJust)
  (compose(f)(_.get('just')))
  (constant(fb))

// :: Maybe a -> String
Maybe.toString = Maybe.maybe(s => `Just(${JSON.stringify(s, null, 2)})`)('Nothing');
Maybe.match = pattern => m => Maybe.maybe(pattern.Just)(pattern.Nothing(m))(m);
// :: (a -> b) -> Maybe a -> Maybe b
Maybe.map = f => Maybe.match({
  Just: compose(Just)(f),
  Nothing: identity
});

// x => f(g(x)) = compose(f)(g) 
// x => f(x)    = f (eta-reduction)

// :: Maybe (a -> b) -> Maybe a -> Maybe b
Maybe.apply = Maybe.match({
  Just: Maybe.map,
  Nothing: constant(constant(Nothing))
});

// (a -> b) -> (Maybe a -> Maybe b)
Maybe.lift1 = Maybe.map;
// (a -> b -> c) -> (Maybe a -> Maybe b -> Maybe c)
// (a -> (b -> c)) -> (Maybe a -> Maybe b -> Maybe c)
// a = x
// (b -> c) = y
// (x -> y) -> ...
Maybe.lift2 = f => mA => mB => Maybe.apply(Maybe.map(f)(mA))(mB);

Maybe.lift3 = f => mA => mB => mC => 
  Maybe.apply(Maybe.apply(Maybe.map(f)(mA))(mB))(mC);

Maybe.lift4 = f => mA => mB => mC => 
  Maybe.apply(Maybe.lift3(f)(mA)(mB)(mC));
 
Maybe.flatten = Maybe.maybe(identity)(Nothing);

Maybe.fromNumber = condF(Number.isNaN)(constant(Nothing))(Just);

const compose2 = compose(compose)(compose);

// Maybe.bind = compose(compose(Maybe.flatten))(Maybe.map);
Maybe.bind = compose2(Maybe.flatten)(Maybe.map);

// (b -> m c) -> (a -> m b) -> (a -> m c)
// Maybe.composeM = f => g => x => Maybe.bind(f)(g(x));
Maybe.composeM = compose(compose)(Maybe.bind);

// :: (x -> y) -> Maybe x -> Maybe y
// Maybe x -> Maybe y
// Maybe a -> Maybe (b -> c)
  
// console.log(Maybe.toString(Maybe.lift2(_.add)(Just(2))(Just(5)))) // Just(7)
// console.log(Maybe.toString(Maybe.lift2(_.add)(Nothing)(Just(5)))) // Nothing
// console.log(Maybe.toString(Maybe.lift2(_.add)(Just(2))(Nothing))) // Nothing

// :: String -> String -> Boolean -> Traveler
const Traveler = firstName => lastName => likesOlives => 
  ({ firstName, lastName, likesOlives });

// Maybe String -> Maybe String -> Maybe Boolean -> Maybe Traveler

const Date = {};
Date.parse = compose(Maybe.fromNumber)(window.Date.parse);
// :: Date -> Date -> Maybe DateRange
Date.range = from => to =>
  cond(to-from > 0)(Just({from, to}))(Nothing);

Date.futureCheck = d => cond(d - window.Date.now() > 0)(Just(d))(Nothing);

// :: Traveler -> String -> Number -> DateRange -> Journey 
const Journey = traveler => destination => budget => dateRange => 
  ({ traveler, destination, budget, dateRange });

// :: String -> String
const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

const Boolean = {};
// :: String -> Maybe Boolean
Boolean.fromString = s => 
  cond(_.eq('true')(s))
    (Just(true))
    (cond(_.eq('false')(s))
       (Just(false))
       (Nothing));

const Num = {};
Num.fromString = compose(Maybe.fromNumber)(Number);
Num.aboveZero = condF(_.lt(0))(Just)(constant(Nothing));

const Either = {};
Either.Left = left => ({ left });
Either.Right = right => ({ right });
const {Left, Right} = Either;
Either.isRight = _.has('right');

// (a -> c) -> (b -> c) -> Either a b -> c
Either.either = l => r => 
  condF(Either.isRight)
    (compose(r)(_.get('right')))
    (compose(l)(_.get('left')));

Either.match = pattern => Either.either(pattern.Left)(pattern.Right);

Either.map = f => Either.match({
  Left: Left,
  Right: compose(Right)(f)
});

// Either err (a -> b) -> Either err a -> Either err b
Either.apply = eF => eA => Either.match({
  Left: Left,
  Right: f => Either.map(f)(eA)
})(eF);

Either.lift2 = f => eA => eB => Either.apply(Either.map(f)(eA))(eB);

Either.lift3 = f => eA => eB => eC => 
  Either.apply(Either.apply(Either.map(f)(eA))(eB))(eC);

Either.lift4 = f => eA => eB => eC => 
  Either.apply(Either.lift3(f)(eA)(eB)(eC));

Either.flatten = Either.match({
  Left: identity,
  Right: identity
});

Either.bind = f => Either.match({
  Left: Left,
  Right: f
});

Either.composeM = compose(compose)(Either.bind);
// [ai -> Either a(i+1)] -> a -> Either an
Either.flowM = fs => _.reduce((acc, f) => Either.composeM(f)(acc))(Right)(fs);

Either.toString = Either.either
  (a => `Left(${JSON.stringify(a, null, 2)})`)
  (b => `Right(${JSON.stringify(b, null, 2)})`);

// Validator a err = (a -> Bool) , (a -> err)
const Validator = predicate => errorF => ({ predicate, errorF });

Validator.getPredicate = _.get('predicate');
Validator.getErrorF = _.get('errorF');

// Validator a err -> a -> Either err a
Validator.validate = validator =>
  condF(Validator.getPredicate(validator))
    (Right)
    (compose(Left)(Validator.getErrorF(validator)));

// (c -> a) -> (b -> d) -> Validator a b -> Validator c d 
Validator.dimap = f => g => validator => 
  Validator
    (compose(Validator.getPredicate(validator))(f))
    (compose(g)(Validator.getErrorF(validator)));
     
const Validation = {};
// (a -> Boolean) -> (a -> String) -> a -> Either String a
Validation.validate = predicate => errorMsgF =>
  condF(predicate)(Right)(compose(Left)(errorMsgF));

Validation.fromMaybeF = f => errorMsgF => x =>
  Maybe.match({
    Just: Right,
    Nothing: constant(Left(errorMsgF(x)))
  })(f(x));
     
Validation.String = {
  notEmpty: Validation.validate
    (_.negate(_.eq('')))
    (constant('value must be a non-empty string'))
};

Validation.Number = {
  positive: Validation.fromMaybeF
    (Num.aboveZero)
    (x => `${x} is not positive`)
};

Validation.Date = {
  future: Validation.fromMaybeF
    (Date.futureCheck)
    (constant('date must be in the future')),
  
  range: from => to => Validation.fromMaybeF
    (Date.range(from))
    (constant('invalid date range'))
    (to)
};

Validation.Parse = {
  boolean: Validation.fromMaybeF
    (Boolean.fromString)
    (constant('value must be either "true" or "false"')),
  
  date: Validation.fromMaybeF
    (Date.parse)
    (date => `invalid date: ${date}`),
  
  number: Validation.fromMaybeF
    (Num.fromString)
    (n => `invalid number: ${n}`)
};

// Validator a String -> Field a -> Validator (Field a) String
Validation.validateField = validator => field =>
    Validator.dimap
      (Field.getValue)
      (err => `${Field.getName(field)}: ${err}`)
      (field);

const numWithin = a => b =>
  validate(_.inRange(a)(b))(v => `${v} must be in range: [${a}..${b}]`);


// :: FormState String -> Journey
const Model = fs => {
    // Map String (Field String) -> Map String (Maybe String)
//     const vFs = FormState.map(Maybe.fromString)(fs);
      
//     const mFirstName = Maybe.map(capitalize)(FormState.get('firstName')(vFs));
//     const mLastName = Maybe.map(capitalize)(FormState.get('lastName')(vFs));
//     const mLikesOlives = Maybe.bind
//       (Boolean.fromString)
//       (FormState.get('likesOlives')(vFs));
  
//     const mTraveler = Maybe.lift3(Traveler)(mFirstName)(mLastName)(mLikesOlives);  
  
//     const mDateFrom = Maybe.bind
//       (Maybe.composeM(Date.futureCheck)(Date.parse))
//       (FormState.get('from')(vFs));
//     const mDateTo = Maybe.bind
//       (Maybe.composeM(Date.futureCheck)(Date.parse))
//       (FormState.get('to')(vFs));  
  
//     const mDateRange = Maybe.bind(from =>
//       Maybe.bind(to => 
//         Date.range(from)(to)
//       )(mDateTo)
//     )(mDateFrom);
  
//     // do
//     //   from <- 
//     //   to <- 
//     //   Date.range      
  
//     const mDestination = Maybe.map(capitalize)(FormState.get('destination')(vFs));  
//     const mBudget = Maybe.bind
//       (Maybe.composeM(Num.aboveZero)(Num.fromString))
//       (FormState.get('budget')(vFs));
  
//     const mJourney = Maybe.lift4(Journey)
//       (mTraveler)
//       (mDestination)
//       (mBudget)
//       (mDateRange);
  
 
    const vFs = FormState.map(Validation.String.notEmpty)(fs);
 
    const eFirstName = Either.bind
      (compose(Right)(capitalize))
      (FormState.get('firstName')(vFs));
  
    const eLastName = Either.bind
      (compose(Right)(capitalize))
      (FormState.get('lastName')(vFs));
  
    const eLikesOlives = Either.bind
      (Validation.Parse.boolean)
      (FormState.get('likesOlives')(vFs));    
  
    const eTraveler = Either.lift3(Traveler)
      (eFirstName)
      (eLastName)
      (eLikesOlives);    
  
    const eDateFrom = Either.bind
      (Either.flowM([
        Validation.Parse.date,
        Validation.Date.future
      ]))
      (FormState.get('from')(vFs));
  
    const eDateTo = Either.bind
      (Either.flowM([
        Validation.Parse.date,
        Validation.Date.future
      ]))
      (FormState.get('to')(vFs));
  
    const eDateRange = Either.bind
      (from => 
        Either.bind
        (to => 
          Validation.Date.range(from)(to)
        )(eDateTo)
      )(eDateFrom);
      
    const eDestination = Either.bind
      (compose(Right)(capitalize))
      (FormState.get('destination')(vFs));

    const eBudget = Either.bind
      (Either.flowM([
        Validation.Parse.number,
        Validation.Number.positive
      ]))
      (FormState.get('budget')(vFs));
  
    const eJourney = Either.lift4(Journey)
      (eTraveler)
      (eDestination)
      (eBudget)
      (eDateRange);
  
//     console.log(Either.apply(Right(_.add(3)))(Right(7)));
//     console.log(Either.apply(Left('no'))(Right(7)));
//     console.log(Either.apply(Left('no'))(Left('err!')));
  
//     console.log(Either.lift2(_.add)(Right(3))(Right(7)));
  
//     console.log(Either.apply(Either.apply(
//         Either.map(Traveler)(Field.getValue(eFirstName)))
//                  (Field.getValue(eLastName)))(Field.getValue(eLikesOlives)));
  
    return eJourney;
  
//     return `${Maybe.toString(mJourney)}`; 
};



console.log(compose(Either.toString)(Model)(formState));
