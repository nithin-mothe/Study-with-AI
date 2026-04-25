export function normalizeTopic(input: string) {
  return sanitizeText(input).toLowerCase();
}

export function sanitizeText(input: string) {
  return input.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}
