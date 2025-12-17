// utils/numerology.js

// Giữ master number phổ biến
export function reduceNumber(n) {
  const masters = new Set([11, 22, 33]);
  while (n > 9 && !masters.has(n)) {
    n = String(n)
      .split("")
      .reduce((a, b) => a + Number(b), 0);
  }
  return n;
}

// Bỏ dấu tiếng Việt + giữ chữ cái
export function normalizeName(input = "") {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

// Pythagorean mapping
const MAP = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);

function sumLetters(str, predicate) {
  let sum = 0;
  for (const ch of str) {
    if (ch === " ") continue;
    if (!MAP[ch]) continue;
    if (!predicate || predicate(ch)) sum += MAP[ch];
  }
  return sum;
}

// Life Path = tổng tất cả chữ số của YYYY-MM-DD rồi reduce
export function calcLifePath(birthDateISO = "") {
  if (!birthDateISO) return "";
  const digits = birthDateISO.replaceAll("-", "").split("");
  const sum = digits.reduce((a, b) => a + Number(b), 0);
  return reduceNumber(sum);
}

// Destiny/Expression = tổng tất cả chữ trong tên
export function calcDestiny(fullName = "") {
  const name = normalizeName(fullName);
  if (!name) return "";
  const sum = sumLetters(name);
  return reduceNumber(sum);
}

// Soul Urge = nguyên âm
export function calcSoul(fullName = "") {
  const name = normalizeName(fullName);
  if (!name) return "";
  const sum = sumLetters(name, (ch) => VOWELS.has(ch));
  return reduceNumber(sum);
}

// Personality = phụ âm
export function calcPersonality(fullName = "") {
  const name = normalizeName(fullName);
  if (!name) return "";
  const sum = sumLetters(name, (ch) => !VOWELS.has(ch));
  return reduceNumber(sum);
}

export function calcAllNumbers({ name, birth_date }) {
  const life_path = calcLifePath(birth_date);
  const destiny = calcDestiny(name);
  const soul = calcSoul(name);
  const personality = calcPersonality(name);

  return { life_path, destiny, soul, personality };
}
