const checks = [
  { key: 'length', label: '8+ characters', test: (value) => value.length >= 8 },
  { key: 'lower', label: 'Lowercase', test: (value) => /[a-z]/.test(value) },
  { key: 'upper', label: 'Uppercase', test: (value) => /[A-Z]/.test(value) },
  { key: 'number', label: 'Number', test: (value) => /[0-9]/.test(value) },
  { key: 'symbol', label: 'Symbol', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const levels = [
  { label: 'FRAGILE', color: 'text-error', bar: 'bg-error' },
  { label: 'FRAGILE', color: 'text-error', bar: 'bg-error' },
  { label: 'WEAK', color: 'text-inferno', bar: 'bg-inferno' },
  { label: 'STABLE', color: 'text-volt', bar: 'bg-volt' },
  { label: 'STRONG', color: 'text-acid', bar: 'bg-acid' },
  { label: 'ELITE', color: 'text-acid', bar: 'bg-acid' },
];

export const usePasswordStrength = (password = '') => {
  const results = checks.map((check) => ({
    ...check,
    passed: check.test(password),
  }));
  const score = results.filter((check) => check.passed).length;
  const level = levels[score];

  return {
    score,
    checks: results,
    label: level.label,
    color: level.color,
    bar: level.bar,
    percentage: (score / checks.length) * 100,
  };
};
