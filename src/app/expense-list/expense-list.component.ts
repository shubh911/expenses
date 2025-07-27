import { Component, OnInit } from '@angular/core';
import { Expense } from '../models/expense.model';
import { ExpenseService } from '../services/expense.service';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TodoListComponent } from '../todo/todo.component';

@Component({
  selector: 'app-expense-list',
  imports: [DatePipe, RouterLink, CurrencyPipe, TodoListComponent],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})

export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = []; // Keep this for raw data if needed, but groupedExpenses will be used for display
  groupedExpenses: { [key: string]: Expense[] } = {}; // Grouped by YYYY-MM
  sortedMonths: string[] = []; // To maintain order of months
  errorMessage: string = '';

  constructor(private expenseService: ExpenseService, private router: Router) { }

  ngOnInit(): void {
    this.loadExpenses();
  }

  /**
   * Loads all expenses from the backend and groups them by month.
   */
  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data; // Store raw expenses
        this.groupAndSortExpenses(); // Group and sort for display
      },
      error: (err) => {
        this.errorMessage = 'Failed to load expenses. Please ensure the backend server is running.';
        console.error('Error loading expenses:', err);
      }
    });
  }

  /**
   * Groups expenses by month (YYYY-MM) and sorts months in descending order.
   */
  private groupAndSortExpenses(): void {
    this.groupedExpenses = {}; // Reset grouped expenses
    this.expenses.forEach(exp => {
      const date = new Date(exp.date);
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!this.groupedExpenses[yearMonth]) {
        this.groupedExpenses[yearMonth] = [];
      }
      this.groupedExpenses[yearMonth].push(exp);
    });

    // Sort expenses within each month by date descending
    for (const month in this.groupedExpenses) {
      this.groupedExpenses[month].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Sort months in descending order (most recent first)
    this.sortedMonths = Object.keys(this.groupedExpenses).sort().reverse();
  }

  /**
   * Navigates to the expense detail page.
   * @param id The ID of the expense to view.
   */
  viewExpenseDetails(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/expenses/detail', id]);
    }
  }

  /**
   * Navigates to the expense edit page.
   * @param id The ID of the expense to edit.
   */
  editExpense(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/expenses/edit', id]);
    }
  }

  /**
   * Deletes an expense after confirmation.
   * @param id The ID of the expense to delete.
   */
  deleteExpense(id: string | undefined): void {
    if (id && confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          this.loadExpenses(); // Reload expenses after deletion
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete expense.';
          console.error('Error deleting expense:', err);
        }
      });
    }
  }
}
