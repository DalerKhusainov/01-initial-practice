export interface User {
  id: number;
  name: string;
  email: string;
}

export type CreateUserDTO = Omit<User, "id">; // DTO для создания
export type UpdateUserDTO = Partial<Omit<User, "id">>; // >DTO для обновления
