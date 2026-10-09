const cad = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });
const int = new Intl.NumberFormat('en-CA');

export const money = (n: number) => cad.format(n);
export const num = (n: number) => int.format(n);
export const pct = (n: number) => `${Math.round(n * 100)}%`;

export const efficacy = (lumens: number, watts: number) => Math.round(lumens / watts);

export const kelvin = (k: number) => `${num(k)}K`;
