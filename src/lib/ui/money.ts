// Whole dollars, never cents — MASTER.md § 7 calls cents fake precision on a
// seeded rate. Grouped in en-US on every locale so the server and the client
// render the same string and the figure matches the comp.
export const money = (amount: number) => `$${Math.round(amount).toLocaleString("en-US")}`;
