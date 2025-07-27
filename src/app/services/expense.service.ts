// src/app/services/expense.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, MonthlyReport, ComparisonReport, RecurringExpense, ExpenseTag } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})

export class ExpenseService {
  private apiUrl = 'http://localhost:3000'; // Your Node.js backend URL

  constructor(private http: HttpClient) { }

  /**
   * Fetches all expenses from the backend.
   * @returns An Observable of an array of Expense objects.
   */
  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses`);
  }

  /**
   * Fetches a single expense by its ID.
   * @param id The ID of the expense to fetch.
   * @returns An Observable of an Expense object.
   */
  getExpenseById(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/expenses/${id}`);
  }

  /**
   * Creates a new expense.
   * @param expense The Expense object to create.
   * @returns An Observable of the created Expense object.
   */
  createExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/expenses`, expense);
  }

  /**
   * Updates an existing expense.
   * @param id The ID of the expense to update.
   * @param expense The updated Expense object.
   * @returns An Observable of the updated Expense object.
   */
  updateExpense(id: string, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/expenses/${id}`, expense);
  }

  /**
   * Deletes an expense by its ID.
   * @param id The ID of the expense to delete.
   * @returns An Observable of the HTTP response.
   */
  deleteExpense(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/expenses/${id}`);
  }

  /**
   * Fetches the monthly expenditure report.
   * @returns An Observable of a MonthlyReport object.
   */
  getMonthlyReport(): Observable<MonthlyReport> {
    return this.http.get<MonthlyReport>(`${this.apiUrl}/reports/monthly`);
  }

  /**
   * Fetches a comparison report between two months.
   * @param month1 The first month in YYYY-MM format.
   * @param month2 The second month in YYYY-MM format.
   * @returns An Observable of a ComparisonReport object.
   */
  getComparisonReport(month1: string, month2: string): Observable<ComparisonReport> {
    return this.http.get<ComparisonReport>(`${this.apiUrl}/reports/compare?month1=${month1}&month2=${month2}`);
  }

  /**
   * Fetches a list of recurring expenses identified from the last N months.
   * @param months The number of months to look back for recurring expenses (default is 3).
   * @returns An Observable of an array of RecurringExpense objects.
   */
  getRecurringExpenses(months: number = 3): Observable<RecurringExpense[]> {
    return this.http.get<RecurringExpense[]>(`${this.apiUrl}/reports/recurring?months=${months}`);
  }

  /**
   * Fetches a list of unique expense tags (description, category, amount) from the last N months.
   * These can be used to quickly pre-fill forms.
   * @param months The number of months to look back for expense tags (default is 2).
   * @returns An Observable of an array of ExpenseTag objects.
   */
  getExpenseTags(months: number = 2): Observable<ExpenseTag[]> {
    return this.http.get<ExpenseTag[]>(`${this.apiUrl}/tags?months=${months}`); // Updated endpoint to /tags
  }
}

