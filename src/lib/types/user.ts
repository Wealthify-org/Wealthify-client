import { Role } from "./role";

export type UserPublic = {
  id: number;
  email: string;
  username?: string;
  role: Role[];
};

type ServerRoleDTO = { 
  id: number;
  value: Role;
  description?: string 
};

type ServerUserDTO = {
  id: number;
  email: string;
  username?: string;
  roles: ServerRoleDTO[];
};

export const toUserPublic = (user: ServerUserDTO): UserPublic => ({
  id: user.id,                  
  email: user.email,
  username: user.username,
  role: user.roles.map(r => r.value),   
});