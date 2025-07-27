import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../services/expense.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Expense, ExpenseTag } from '../models/expense.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-expense-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe ],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss'
})

export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  isEditMode: boolean = false;
  expenseId: string | null = null;
  errorMessage: string = '';
  expenseTags: ExpenseTag[] = []; // Original list of tags
  leftTags: ExpenseTag[] = [];    // Tags for the left column
  rightTags: ExpenseTag[] = [];   // Tags for the right column


  // Predefined categories for dropdown
  categories: string[] = [
    'Education', 'EMI', 'Entertainment', 'Food', 'Healthcare', 'Housing',
    'Investment', 'Other', 'Salary', 'Shopping', 'Transportation', 'Utilities'
  ].sort(); // Sorted alphabetically

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize the form with validators
    this.expenseForm = this.fb.group({
      date: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Check if we are in edit mode
    this.expenseId = this.route.snapshot.paramMap.get('id');
    if (this.expenseId) {
      this.isEditMode = true;
      this.loadExpense(this.expenseId);
    } else {
      // Set default date to today for new expense
      this.expenseForm.patchValue({ date: this.getCurrentDate() });
      this.loadExpenseTags(); // Load tags only in add new expense mode
    }
  }

  /**
   * Loads an existing expense for editing.
   * @param id The ID of the expense to load.
   */
  loadExpense(id: string): void {
    this.expenseService.getExpenseById(id).subscribe({
      next: (expense) => {
        this.expenseForm.patchValue(expense); // Populate form with expense data
      },
      error: (err) => {
        this.errorMessage = 'Failed to load expense for editing.';
        console.error('Error loading expense:', err);
      }
    });
  }

  /**
   * Loads unique expense tags from the backend for the last 2 months.
   */
  loadExpenseTags(): void {
    this.expenseService.getExpenseTags(2).subscribe({ // Fetch tags from last 2 months
      next: (data) => {
        this.expenseTags = data;
        this.splitTagsForDisplay(); // Split tags for two columns
      },
      error: (err) => {
        console.error('Error loading expense tags:', err);
        // Optionally set an error message for the user if tags are critical
      }
    });
  }

  /**
   * Splits the expenseTags array into two halves for display in two columns.
   */
  private splitTagsForDisplay(): void {
    const mid = Math.ceil(this.expenseTags.length / 2);
    this.leftTags = this.expenseTags.slice(0, mid);
    this.rightTags = this.expenseTags.slice(mid);
  }


  /**
   * Fills the form with data from a selected expense tag.
   * The date is set to the current day.
   * @param tag The ExpenseTag object to use for pre-filling.
   */
  fillFormWithTag(tag: ExpenseTag): void {
    const today = this.getCurrentDate();
    this.expenseForm.patchValue({
      date: today,
      amount: tag.amount,
      category: tag.category,
      description: tag.description,
      notes: '' // Clear notes or set a default for new entry
    });
    this.expenseForm.markAllAsTouched(); // Mark controls as touched to show validation if any
  }

  /**
   * Handles form submission for creating or updating an expense.
   */
  onSubmit(): void {
    if (this.expenseForm.valid) {
      const expenseData: Expense = this.expenseForm.value;

      if (this.isEditMode && this.expenseId) {
        // Update existing expense
        this.expenseService.updateExpense(this.expenseId, expenseData).subscribe({
          next: () => {
            this.router.navigate(['/expenses']); // Redirect to list after update
          },
          error: (err) => {
            this.errorMessage = 'Failed to update expense.';
            console.error('Error updating expense:', err);
          }
        });
      } else {
        // Create new expense
        this.expenseService.createExpense(expenseData).subscribe({
          next: () => {
            this.router.navigate(['/expenses']); // Redirect to list after creation
          },
          error: (err) => {
            this.errorMessage = 'Failed to create expense.';
            console.error('Error creating expense:', err);
          }
        });
      }
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.expenseForm.markAllAsTouched(); // Show validation errors
    }
  }

  /**
   * Gets the current date in YYYY-MM-DD format.
   * @returns The current date string.
   */
  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
