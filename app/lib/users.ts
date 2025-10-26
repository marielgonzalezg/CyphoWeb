import bcrypt from "bcryptjs";

export type User = { id: string; email: string; password_hash: string; name?: string };

const users = new Map<string, User>();

export const UsersRepo = {
  async findByEmail(email: string) {
    return users.get(email.toLowerCase()) ?? null;
  },
  async create(email: string, password: string, name?: string) {
    const password_hash = await bcrypt.hash(password, 12);
    const user: User = { id: crypto.randomUUID(), email: email.toLowerCase(), password_hash, name };
    users.set(user.email, user);
    return user;
  },
};
