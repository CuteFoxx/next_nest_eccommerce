export type Role = "USER" | "ADMIN";

export type User = {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  role: Role;
};
