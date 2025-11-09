export type UserPublic = {
  id: number;
  email: string;
  username?: string;
};

type ServerUserDTO = {
  id: number;
  email: string;
  username?: string;
};

export const toUserPublic = (user: ServerUserDTO): UserPublic => ({
  id: user.id,                  
  email: user.email,
  username: user.username,
});