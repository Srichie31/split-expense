import { Injectable, OnDestroy } from "@angular/core";
import { Expense } from "../model/expense.model";
import { BehaviorSubject, Subject} from "rxjs";
import { map, tap } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable({providedIn: 'root'})
export class ExpenseService{
    private baseUrl = "https://split-expense-by-srichie-backend.vercel.app/expenses";

    expenses = new BehaviorSubject<Expense[]>([]);
    expensesChanged = new Subject<void>();
    
    constructor(private http: HttpClient) {
    }

    getExpenseByGroupId(groupId: string) {
        return this.http
            .get<Expense[]>(`${this.baseUrl}`, {
                params: new HttpParams().set("groupId", groupId)
            }).pipe(
                tap((expenses) => {
                    this.expenses.next(expenses)
                })
            );
    }

    getExpenseById(expenseId: string) {
        return this.http
            .get(`${this.baseUrl}/${expenseId}`);
        // return this.http
        //     .get<Expense>(`${this.baseUrl}/${expenseId}`);
    }

    addExpense(expense: Expense) {
        return this.http.post(`${this.baseUrl}/create`, expense);
    }

    updateExpense(expenseId: string, newExpense: {description: string, expense_date: string, amount: number , paidBy : string}) {
        return this.http
            .put(`${this.baseUrl}/${expenseId}`, newExpense);
    }

    deleteExpense(expenseId: string) {
        return this.http
            .delete(`${this.baseUrl}/${expenseId}`);
    }

}