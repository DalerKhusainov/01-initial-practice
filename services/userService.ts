import { User, CreateUserDTO, UpdateUserDTO } from "../types/user";

// In-memory storage
let users: User[] = [
  { id: 1, name: "Ivan", email: "ivan@example.com" },
  { id: 2, name: "Maria", email: "maria@example.com" },
];

let nextId = 3;

export const userService = {
  // Получить всех пользователей
  getAllUsers(): User[] {
    return users;
  },

  // Получить пользователя по ID
  getUserById(id: number): User | undefined {
    return users.find((user) => user.id === id);
  },

  // Создать пользователя
  createUser(userData: CreateUserDTO): User {
    // Проверка уникальности email
    if (this.isEmailExists(userData.email)) {
      throw new Error("User with this email already exists");
    }

    const newUser: User = {
      id: nextId++,
      ...userData,
    };

    users.push(newUser);
    return newUser;
  },

  // Обновить пользователя
  updateUser(id: number, updates: UpdateUserDTO): User | null {
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) return null;

    // Проверка уникальности email при смене
    if (updates.email && updates.email !== users[userIndex].email) {
      if (this.isEmailExists(updates.email)) {
        throw new Error("User with this email already exists");
      }
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
    };

    return users[userIndex];
  },

  // Удалить пользователя
  deleteUser(id: number): boolean {
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) return false;

    users.splice(userIndex, 1);
    return true;
  },

  // Вспомогательный метод для проверки email
  isEmailExists(email: string): boolean {
    return users.some((user) => user.email === email);
  },
};
