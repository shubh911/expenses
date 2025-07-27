import { Component, OnInit } from '@angular/core';
import { Expense } from '../models/expense.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from '../services/expense.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-expense-detail',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './expense-detail.component.html',
  styleUrl: './expense-detail.component.scss'
})

export class ExpenseDetailComponent implements OnInit {
  expense: Expense | undefined;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadExpenseDetails(id);
    } else {
      this.errorMessage = 'No expense ID provided.';
      this.router.navigate(['/expenses']); // Redirect if no ID
    }
  }

  /**
   * Loads the details of a specific expense.
   * @param id The ID of the expense to load.
   */
  loadExpenseDetails(id: string): void {
    this.expenseService.getExpenseById(id).subscribe({
      next: (data) => {
        this.expense = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load expense details. Expense might not exist or backend is down.';
        console.error('Error loading expense details:', err);
      }
    });
  }

  /**
   * Navigates back to the expense list.
   */
  goBack(): void {
    this.router.navigate(['/expenses']);
  }

  /**
   * Navigates to the edit page for the current expense.
   */
  editExpense(): void {
    if (this.expense?.id) {
      this.router.navigate(['/expenses/edit', this.expense.id]);
    }
  }

  /**
   * Deletes the current expense after confirmation.
   */
  deleteExpense(): void {
    if (this.expense?.id && confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(this.expense.id).subscribe({
        next: () => {
          this.router.navigate(['/expenses']); // Go back to list after deletion
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete expense.';
          console.error('Error deleting expense:', err);
        }
      });
    }
  }
}


