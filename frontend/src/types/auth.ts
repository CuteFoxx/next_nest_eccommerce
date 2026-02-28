export type Role = "USER" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  role: Role;
};
