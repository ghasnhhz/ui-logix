// The schema has no person name — signup collects a company, an email and a
// phone. So the avatar reads off the company, falling back to the email local
// part for an account created before a company was required.
export function initials(company: string, email: string) {
  const source = company.trim() || email.split("@")[0] || "?";
  const words = source.split(/[\s.\-_]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}
