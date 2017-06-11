const slow = x => {
  let a = 0;
  for (let i = 0; i < 1000*x; i++) {
    a += i;
  }
  return a;   
};

const perf = f => x => {
  const start = performance.now();
  const value = f(x);
  console.log(`${performance.now() - start}`);
  return value;
};

// arg => result
// 500 -> 109995743028

// perf(slow)(500);
// perf(slow)(500);

const memSlow = _.memoize(slow);

// perf(memSlow)(500);
// perf(memSlow)(500);

// fib :: (Number -> Number) -> Number -> Number
const fibF = f => n => {
  return (n === 0 || n === 1) ? 1 : f(n - 1) + f(n - 2);
};

// fib 5 -> fib 4 + fib 3
// fib 4 -> fib 3 + fib 2
// fib 3 -> fib 2 + fib 1

// const memFib = _.memoize(fib);
// perf(memFib)(37);
// console.log(fib(37))

// fixed points
// f(x) = x * x
// f(0) = 0
// f(1) = 1

// Y(f) = fixed
// fibF(fib) = fib; fib is fixed point for fibF
// Y(fibF) = fib
// Y(F) = f, F(f) = f
// Y(F) = F(Y(F))

const Y = F => F(x => Y(F)(x));

const fib = Y(fibF);

const Ymem = memory => F => {
  return F(x => {
    if (memory.has(x)) {
      return memory.get(x);
    }
    const value = Ymem(memory)(F)(x);
    memory.set(x, value);
    return value;
  });
};

const fibMem = Ymem(new Map())(fibF);


console.log(perf(fibMem)(500));
