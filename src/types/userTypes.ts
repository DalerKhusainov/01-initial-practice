export interface User {
  id: number;
  name: string;
  email: string;
}

export type CreateuserDTO = Omit<User, "id">;
export type UpdateUserDTO = Partial<CreateuserDTO>;
