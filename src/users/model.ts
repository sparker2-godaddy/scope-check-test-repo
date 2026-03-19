export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}
