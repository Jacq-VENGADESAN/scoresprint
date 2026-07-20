export function betaModeEnabled() {
  const value = process.env.BETA_MODE?.trim().toLowerCase();
  if (!value) return true;
  return !["0", "false", "off", "no"].includes(value);
}

export function betaLabel() {
  return betaModeEnabled() ? "Bêta publique gratuite" : "Version publique";
}
