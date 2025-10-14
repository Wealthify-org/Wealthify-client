import { Role } from "./role";

export type UserPublic = {
  id: string;
  email: string;
  username?: string;
  role: Role[];
};