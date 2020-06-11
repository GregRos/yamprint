
const maxCache = 1000;

const cachedSqrts = new Int32Array(maxCache);

for (let i = 0; i < maxCache; i++) {
    cachedSqrts[i] = Math.sqrt(i);
}

export function fastIntSqrt(n: number) {
    n = n | 0;
    return n > maxCache ? Math.sqrt(n) : cachedSqrts[n];
}