import { Routes } from '@angular/router';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';
import { MonthlyReportComponent } from './monthly-report/monthly-report.component';
import { ExpenseComparisonComponent } from './expense-comparison/expense-comparison.component';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { RecurringExpensesComponent } from './recurring-expenses/recurring-expenses.component';
import { TodoListComponent } from './todo/todo.component';

export const routes: Routes = [
  { path: '', redirectTo: '/expenses', pathMatch: 'full' }, // Default route
  { path: 'expenses', component: ExpenseListComponent, pathMatch: "full" },
  { path: 'expenses/new', component: ExpenseFormComponent, pathMatch: "full"  },
  { path: 'expenses/edit/:id', component: ExpenseFormComponent, pathMatch: "full" },
  { path: 'expenses/detail/:id', component: ExpenseDetailComponent, pathMatch: "full" },
  { path: 'reports/monthly', component: MonthlyReportComponent, pathMatch: "full" },
  { path: 'reports/compare', component: ExpenseComparisonComponent },
  { path: 'expenses/recurring', component: RecurringExpensesComponent },
  { path: 'todo', component: TodoListComponent },
  { path: '**', redirectTo: '/expenses' } // Wildcard route for any unmatched URL
];
