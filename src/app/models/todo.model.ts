// Interface for Todo item
export interface Todo {
  id?: string;
  text: string;
  completed: boolean;
  createdAt?: string; // Stored as ISO string in backend
}
