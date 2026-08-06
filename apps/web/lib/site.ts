/** One place to name the product. Change this first when you start a project. */
export const site = {
  name: "VRentNow",
  description: "Rent the right vehicle online — browse, book, and drive.",
  url: process.env.AUTH_URL ?? "http://localhost:3000",
} as const;
