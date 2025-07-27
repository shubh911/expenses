import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExpenseService } from '../services/expense.service';
import { Router } from '@angular/router';
import { Expense, RecurringExpense } from '../models/expense.model';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-recurring-expenses',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './recurring-expenses.component.html',
  styleUrl: './recurring-expenses.component.scss'
})


export class RecurringExpensesComponent implements OnInit {
  recurringExpenses: RecurringExpense[] = [];
  recurringExpensesForm: FormGroup; // Form to manage checkboxes
  errorMessage: string = '';
  loading: boolean = true;
  successMessage: string = '';

  constructor(
    private expenseService: ExpenseService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.recurringExpensesForm = this.fb.group({}); // Initialize an empty form group
  }

  ngOnInit(): void {
    this.loadRecurringExpenses();
  }

  /**
   * Loads recurring expenses from the backend (last 3 months by default).
   */
  loadRecurringExpenses(): void {
    this.loading = true;
    this.errorMessage = '';
    this.expenseService.getRecurringExpenses(3).subscribe({
      next: (data) => {
        this.recurringExpenses = data;
        this.initializeForm(); // Initialize form controls after data is loaded
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load recurring expenses. Please ensure the backend server is running and data is available.';
        console.error('Error loading recurring expenses:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Initializes form controls for each recurring expense.
   */
  private initializeForm(): void {
    this.recurringExpenses.forEach((exp, index) => {
      // Use a unique name for each control, e.g., 'expense_0', 'expense_1'
      this.recurringExpensesForm.addControl(`expense_${index}`, this.fb.control(false));
    });
  }

  /**
   * Adds selected recurring expenses to the current date.
   */
  addSelectedExpensesToCurrentMonth(): void {
    this.errorMessage = '';
    this.successMessage = '';
    const expensesToAdd: Expense[] = [];
    const today = new Date();
    const currentDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    this.recurringExpenses.forEach((exp, index) => {
      if (this.recurringExpensesForm.get(`expense_${index}`)?.value) {
        expensesToAdd.push({
          date: currentDate, // Set to current date
          amount: exp.amount,
          category: exp.category,
          description: exp.description,
          notes: 'Recurring expense added automatically' // Optional note
        });
      }
    });

    if (expensesToAdd.length === 0) {
      this.errorMessage = 'Please select at least one recurring expense to add.';
      return;
    }

    // Use forkJoin to wait for all createExpense calls to complete
    const creationObservables = expensesToAdd.map(exp => this.expenseService.createExpense(exp));

    forkJoin(creationObservables).subscribe({
      next: () => {
        this.successMessage = 'Selected recurring expenses added successfully!';
        // Optionally, reload the recurring expenses list or navigate away
        // For now, let's just show success and allow user to go back
        // this.loadRecurringExpenses(); // Uncomment to refresh the list on this page
      },
      error: (err) => {
        this.errorMessage = 'Failed to add one or more recurring expenses.';
        console.error('Error adding recurring expenses:', err);
      }
    });
  }

  /**
   * Navigates back to the expense list.
   */
  goBack(): void {
    this.router.navigate(['/expenses']);
  }
}
