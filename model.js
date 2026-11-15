/** Fictional browser simulation only; intentionally independent of Tappy's backend. */
export function newDemo() {
  return { mode: 'STAMPS', stamps: 0, points: 0, rewards: [], visits: 0, history: [], customers: ['Avery Example', 'Jamie Sample', 'Sam Fictional'], locations: [] };
}
export function parseMoney(input) {
  if (!/^(?:0|[1-9]\d{0,4})(?:\.\d{1,2})?$/.test(input)) throw new Error('invalid-amount');
  const [whole, fraction = ''] = input.split('.');
  const minor = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, '0'));
  if (minor <= 0 || minor > BigInt(1_000_000)) throw new Error('invalid-amount');
  return Number(minor);
}
export function purchase(state, input) {
  const minor = parseMoney(input);
  state.visits++;
  if (state.mode !== 'POINTS') { state.stamps++; if (state.stamps >= 9) { state.stamps -= 9; state.rewards.push(state.visits); } }
  if (state.mode !== 'STAMPS') state.points += Math.floor(minor / 100);
  state.history.unshift({ kind: 'purchase', visit: state.visits, minor });
}
export function redeem(state, kind) {
  if (kind === 'stamp') { if (!state.rewards.length) throw new Error('insufficient'); state.rewards.shift(); }
  else { if (state.mode === 'STAMPS' || state.points < 100) throw new Error('insufficient'); state.points -= 100; }
  state.visits++;
  state.history.unshift({ kind, visit: state.visits });
}
export function addCustomer(state, name) {
  const trimmed = name.trim();
  if (!trimmed || [...trimmed].length > 40 || [...trimmed].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) throw new Error('invalid-name');
  if (state.customers.some(n => n.toLowerCase() === trimmed.toLowerCase())) throw new Error('duplicate-name');
  if (state.customers.length >= 30) throw new Error('demo-limit');
  state.customers.push(trimmed);
}
export function addLocation(state, name, latitude, longitude) {
  if (!name.trim() || name.length > 40 || state.locations.length >= 10) throw new Error('invalid-location');
  const valid = value => /^-?\d{1,3}(?:\.\d{1,6})?$/.test(value);
  if (!valid(latitude) || !valid(longitude) || Math.abs(Number(latitude)) > 90 || Math.abs(Number(longitude)) > 180) throw new Error('invalid-location');
  state.locations.push({ name: name.trim(), latitude, longitude });
}
export function contrast(background, text) {
  const luminance = color => {
    const c = [1, 3, 5].map(offset => { const v = parseInt(color.slice(offset, offset + 2), 16) / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
  };
  const a = luminance(background), b = luminance(text);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

