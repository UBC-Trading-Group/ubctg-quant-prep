export type OptionType = "call" | "put";

export type OptionParams = {
  spot: number;
  strike: number;
  volatility: number;
  rate: number;
  time: number;
};

export function normalPdf(value: number) {
  return Math.exp(-0.5 * value * value) / Math.sqrt(2 * Math.PI);
}

function erf(value: number) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);

  return sign * y;
}

export function normalCdf(value: number) {
  return 0.5 * (1 + erf(value / Math.sqrt(2)));
}

export function d1(params: OptionParams) {
  const safeTime = Math.max(params.time, 1e-6);
  const safeVol = Math.max(params.volatility, 1e-6);

  return (
    (Math.log(params.spot / params.strike) + (params.rate + 0.5 * safeVol * safeVol) * safeTime) /
    (safeVol * Math.sqrt(safeTime))
  );
}

export function d2(params: OptionParams) {
  return d1(params) - Math.max(params.volatility, 1e-6) * Math.sqrt(Math.max(params.time, 1e-6));
}

export function blackScholesPrice(params: OptionParams, type: OptionType) {
  const firstD = d1(params);
  const secondD = d2(params);
  const discount = Math.exp(-params.rate * params.time);

  if (type === "call") {
    return params.spot * normalCdf(firstD) - params.strike * discount * normalCdf(secondD);
  }

  return params.strike * discount * normalCdf(-secondD) - params.spot * normalCdf(-firstD);
}

export function blackScholesGreeks(params: OptionParams, type: OptionType) {
  const firstD = d1(params);
  const secondD = d2(params);
  const safeTime = Math.max(params.time, 1e-6);
  const safeVol = Math.max(params.volatility, 1e-6);
  const discount = Math.exp(-params.rate * safeTime);
  const pdf = normalPdf(firstD);
  const delta = type === "call" ? normalCdf(firstD) : normalCdf(firstD) - 1;
  const gamma = pdf / (params.spot * safeVol * Math.sqrt(safeTime));
  const vega = params.spot * pdf * Math.sqrt(safeTime) / 100;
  const callTheta =
    (-params.spot * pdf * safeVol) / (2 * Math.sqrt(safeTime)) -
    params.rate * params.strike * discount * normalCdf(secondD);
  const putTheta =
    (-params.spot * pdf * safeVol) / (2 * Math.sqrt(safeTime)) +
    params.rate * params.strike * discount * normalCdf(-secondD);

  return {
    delta,
    gamma,
    theta: (type === "call" ? callTheta : putTheta) / 365,
    vega,
  };
}

export function createSeededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function seededNormal(random: () => number) {
  const first = Math.max(random(), 1e-12);
  const second = random();

  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}
