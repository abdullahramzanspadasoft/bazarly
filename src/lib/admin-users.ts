export const ADMIN_USERS = [
  {
    name: "Abdullah Arain",
    email: "abdullaharainch535@gmail.com",
    password: "admin123",
  },
  {
    name: "Abrar SQA",
    email: "abrarsqa25@gmail.com",
    password: "admin123",
  },
];

export const ADMIN_EMAILS = ADMIN_USERS.map((u) => u.email.toLowerCase());

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function canManageProducts(email?: string | null, role?: string | null): boolean {
  return role === "admin" && !!email && isAdminEmail(email);
}
