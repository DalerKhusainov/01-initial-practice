import { User } from "../types/userTypes";

const users: User[] = [
  {
    id: 1,
    name: "Daler",
    email: "daler@example.com",
  },
  {
    id: 2,
    name: "Gulnoza",
    email: "gulnoza@example.com",
  },
];

export const userService = {
  isEmailExists(email: string): boolean {
    return users.some((u) => u.email === email);
  },
  getAllUsers(): User[] {
    return users;
  },
  getUserById(id: number): User | null {
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    return user;
  },
};
