import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComparisonReport } from '../models/expense.model';
import { ExpenseService } from '../services/expense.service';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-expense-comparison',
  imports: [DatePipe, CurrencyPipe, ReactiveFormsModule],
  templateUrl: './expense-comparison.component.html',
  styleUrl: './expense-comparison.component.scss'
})

export class ExpenseComparisonComponent implements OnInit {
  comparisonForm: FormGroup;
  comparisonReport: ComparisonReport | null = null;
  errorMessage: string = '';
  monthsAvailable: string[] = []; // List of YYYY-MM strings from available expenses

  constructor(private fb: FormBuilder, private expenseService: ExpenseService) {
    this.comparisonForm = this.fb.group({
      month1: ['', Validators.required],
      month2: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAvailableMonths();
  }

  /**
   * Loads all available months from the monthly report to populate dropdowns.
   */
  loadAvailableMonths(): void {
    this.expenseService.getMonthlyReport().subscribe({
      next: (data) => {
        this.monthsAvailable = Object.keys(data).sort().reverse(); // Sort descending
      },
      error: (err) => {
        this.errorMessage = 'Failed to load available months for comparison.';
        console.error('Error loading available months:', err);
      }
    });
  }

  /**
   * Handles form submission to get and display the comparison report.
   */
  onSubmit(): void {
    if (this.comparisonForm.valid) {
      const { month1, month2 } = this.comparisonForm.value;
      this.errorMessage = ''; // Clear previous errors

      if (month1 === month2) {
        this.errorMessage = 'Please select two different months for comparison.';
        this.comparisonReport = null; // Clear previous report
        return;
      }

      this.expenseService.getComparisonReport(month1, month2).subscribe({
        next: (data) => {
          this.comparisonReport = data;
        },
        error: (err) => {
          this.errorMessage = 'Failed to fetch comparison report. Please ensure the backend server is running and months are valid.';
          console.error('Error fetching comparison report:', err);
          this.comparisonReport = null;
        }
      });
    } else {
      this.errorMessage = 'Please select both months for comparison.';
      this.comparisonForm.markAllAsTouched();
    }
  }

  /**
   * Returns categories and their totals for a specific month in the comparison report.
   * @param month The month string (YYYY-MM).
   * @returns An array of objects with category name and total amount.
   */
  getCategoriesForComparisonMonth(month: string): { category: string; amount: number }[] {
    const categories = this.comparisonReport?.[month]?.categories;
    if (!categories) {
      return [];
    }
    return Object.keys(categories)
      .map(category => ({ category, amount: categories[category] }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  }
}



