import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { Todo } from '../models/todo.model';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-todo',
  imports: [ReactiveFormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss'
})

export class TodoListComponent implements OnInit, OnDestroy {
  todoForm: FormGroup;
  todos: Todo[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = true;

  private todoSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder, private todoService: TodoService) {
    this.todoForm = this.fb.group({
      newTodo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTodos();
  }

  ngOnDestroy(): void {
    // Unsubscribe from todo data listener to prevent memory leaks
    if (this.todoSubscription) {
      this.todoSubscription.unsubscribe();
    }
  }

  /**
   * Loads todos from the backend using TodoService.
   */
  loadTodos(): void {
    this.loading = true;
    this.errorMessage = '';

    // Subscribe to the getTodos Observable
    this.todoSubscription = this.todoService.getTodos().subscribe({
      next: (data) => {
        // Sort by createdAt descending to show most recent first
        this.todos = data.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching todos:', err);
        this.errorMessage = 'Failed to load todos. Please ensure the backend server is running.';
        this.loading = false;
      }
    });
  }

  /**
   * Adds a new todo item to the backend.
   */
  addTodo(): void {
    if (this.todoForm.invalid) {
      this.errorMessage = 'Please enter a todo item.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    const newTodoText = this.todoForm.get('newTodo')?.value;

    this.todoService.addTodo({ text: newTodoText, completed: false }).subscribe({
      next: (addedTodo) => {
        // Add the new todo to the local array and re-sort
        this.todos.unshift(addedTodo); // Add to beginning for immediate display
        this.todos.sort((a, b) => { // Re-sort to maintain order
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        this.todoForm.reset(); // Clear the input field
        this.successMessage = 'Todo added successfully!';
        setTimeout(() => this.successMessage = '', 3000); // Clear message after 3 seconds
      },
      error: (err) => {
        console.error('Error adding todo:', err);
        this.errorMessage = 'Failed to add todo. Please try again.';
      }
    });
  }

  /**
   * Toggles the completed status of a todo item.
   * @param todo The todo item to update.
   */
  toggleCompleted(todo: Todo): void {
    if (!todo.id) return;

    this.errorMessage = '';
    this.todoService.updateTodo(todo.id, { completed: !todo.completed }).subscribe({
      next: (updatedTodo) => {
        // Update the todo in the local array
        const index = this.todos.findIndex(t => t.id === updatedTodo.id);
        if (index !== -1) {
          this.todos[index] = updatedTodo;
        }
      },
      error: (err) => {
        console.error('Error toggling todo status:', err);
        this.errorMessage = 'Failed to update todo status. Please try again.';
      }
    });
  }

  /**
   * Edits the text of a todo item.
   * @param todo The todo item to edit.
   */
  editTodo(todo: Todo): void {
    if (!todo.id) return;

    const newText = prompt('Edit todo:', todo.text);
    if (newText !== null && newText.trim() !== '') {
      this.errorMessage = '';
      this.todoService.updateTodo(todo.id, { text: newText.trim() }).subscribe({
        next: (updatedTodo) => {
          // Update the todo in the local array
          const index = this.todos.findIndex(t => t.id === updatedTodo.id);
          if (index !== -1) {
            this.todos[index] = updatedTodo;
          }
        },
        error: (err) => {
          console.error('Error editing todo:', err);
          this.errorMessage = 'Failed to edit todo. Please try again.';
        }
      });
    } else if (newText !== null) {
      this.errorMessage = 'Todo text cannot be empty.';
    }
  }

  /**
   * Deletes a todo item from the backend.
   * @param todo The todo item to delete.
   */
  deleteTodo(todo: Todo): void {
    if (!todo.id) return;

    const confirmed = window.confirm('Are you sure you want to delete this todo?');
    if (confirmed) {
      this.errorMessage = '';
      this.todoService.deleteTodo(todo.id).subscribe({
        next: () => {
          // Remove the todo from the local array
          this.todos = this.todos.filter(t => t.id !== todo.id);
          this.successMessage = 'Todo deleted successfully!';
          setTimeout(() => this.successMessage = '', 3000); // Clear message after 3 seconds
        },
        error: (err) => {
          console.error('Error deleting todo:', err);
          this.errorMessage = 'Failed to delete todo. Please try again.';
        }
      });
    }
  }
}