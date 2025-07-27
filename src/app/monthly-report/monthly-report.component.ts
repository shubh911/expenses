import { Component, OnInit } from '@angular/core';
import { MonthlyReport } from '../models/expense.model';
import { ExpenseService } from '../services/expense.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-monthly-report',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './monthly-report.component.html',
  styleUrl: './monthly-report.component.scss'
})

export class MonthlyReportComponent implements OnInit {
  monthlyReport: MonthlyReport = {};
  sortedMonths: string[] = [];
  errorMessage: string = '';

  constructor(private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.loadMonthlyReport();
  }

  /**
   * Loads the monthly expenditure report from the backend.
   */
  loadMonthlyReport(): void {
    this.expenseService.getMonthlyReport().subscribe({
      next: (data) => {
        this.monthlyReport = data;
        // Sort months in descending order (most recent first)
        this.sortedMonths = Object.keys(data).sort().reverse();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load monthly report. Please ensure the backend server is running.';
        console.error('Error loading monthly report:', err);
      }
    });
  }

  /**
   * Returns the categories and their totals for a given month.
   * @param month The month string (YYYY-MM).
   * @returns An array of objects with category name and total amount.
   */
  getCategoriesForMonth(month: string): { category: string; amount: number }[] {
    const categories = this.monthlyReport[month]?.categories;
    if (!categories) {
      return [];
    }
    return Object.keys(categories)
      .map(category => ({ category, amount: categories[category] }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  }
}