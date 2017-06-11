const wohnungen = [
{
"rent": 40,
"size": 80,
"district": "Neukölln",
"from": "20.12.2016",
"to": "30.12.2016"
},

{
"rent": 1316,
"size": 65,
"district": "Friedrichshain",
"from": "01.01.2017",
"to": null
},

{
"rent": 1300,
"size": 50,
"district": "Kreuzberg",
"from": "01.02.2017",
"to": "30.04.2017"
},

{
"rent": 900,
"size": 47,
"district": "Friedrichshain",
"from": "27.12.2016",
"to": null
},

{
"rent": 690,
"size": 60,
"district": "Prenzlauer Berg",
"from": "23.01.2017",
"to": null
},

{
"rent": 80,
"size": 100,
"district": "Neukölln",
"from": "23.12.2016",
"to": "03.01.2017"
},

{
"rent": 430,
"size": 54,
"district": "Neukölln",
"from": "04.01.2017",
"to": "18.01.2017"
},

{
"rent": 950,
"size": 90,
"district": "Neukölln",
"from": "16.01.2017",
"to": "07.03.2017"
},

{
"rent": 1400,
"size": 67,
"district": "Wedding",
"from": "22.12.2016",
"to": "29.12.2016"
},

{
"rent": 1000,
"size": 45,
"district": "Kreuzberg",
"from": "28.01.2017",
"to": null
},

{
"rent": 1800,
"size": 64,
"district": "Mitte",
"from": "18.12.2016",
"to": "31.12.2018"
},

{
"rent": 600,
"size": 49,
"district": "Kreuzberg",
"from": "01.02.2017",
"to": "01.03.2017"
},

{
"rent": 800,
"size": 30,
"district": "Kreuzberg",
"from": "12.01.2017",
"to": null
},

{
"rent": 850,
"size": 55,
"district": "Schöneberg",
"from": "01.01.2017",
"to": "31.12.2017"
},

{
"rent": 1275,
"size": 65,
"district": "Kreuzberg",
"from": "25.01.2017",
"to": null
},

{
"rent": 300,
"size": 67,
"district": "Wedding",
"from": "22.12.2016",
"to": "29.12.2016"
},

{
"rent": 1300,
"size": 65,
"district": "Kreuzberg",
"from": "27.12.2016",
"to": null
},

{
"rent": 680,
"size": 46,
"district": "Friedrichshain",
"from": "30.12.2016",
"to": "03.02.2017"
},

{
"rent": 1525,
"size": 104,
"district": "Friedrichshain",
"from": "21.02.2017",
"to": null
},

{
"rent": 1075,
"size": 70,
"district": "Prenzlauer Berg",
"from": "01.01.2017",
"to": null
} 
  
];

const parseDate = string => Date.parse(string.split('.').reverse().join('.'));

const time = ({from, to}) => {
  if (_.isNull(to)) { return Number.POSITIVE_INFINITY; };
  return parseDate(to) - parseDate(from);
};

const flip = f => x => y => f(y)(x);
const apply = x => f => f(x);

const and = flip(_.flow(apply, _.every));

// _.flip( a -> b -> c) -> b -> a -> c


// ps => x => f(ps)
// x => ps => f(ps)
// x => f

// const or = ps => x => _.some(p => p(x))(ps);
const or = flip(_.flow(apply, _.some));
const not = _.negate;

// const rentFilter = ({rent}) => rent < 1000;
const rentFilter = _.flow(_.get('rent'), _.gt(1000));
// const sizeFilter = ({size}) => size > 45 && size < 100;
const sizeFilter = _.flow(_.get('size'), and(_.lt(45), _.gt(100)));
// const dateFilter = flat => time(flat) > 30 * 86400 * 1000; 
const dateFilter = _.flow(time, _.lt(30 * 86400 * 1000));
// const xbergFilter = ({district}) => district === "Kreuzberg";
const xbergFilter = _.flow(_.get('district'), _.equals('Kreuzberg'))

// const complexFilter = flat => 
//    (rentFilter(flat) || xbergFilter(flat))
//      && sizeFilter(flat) 
//      && dateFilter(flat);

const complexFilter = and([
  or([rentFilter, xbergFilter]), 
  sizeFilter, 
  dateFilter,
  not(_.flow(_.get('district'), _.equals('Neukölln')))
]);

// x  AND (a OR y)
// and(or(x, y), z)

console.log(_.filter(complexFilter)(wohnungen));


// Wohnung -> Boolean // predicate
