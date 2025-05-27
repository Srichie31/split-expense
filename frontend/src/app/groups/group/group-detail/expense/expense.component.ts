import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Expense } from '../../../../model/expense.model';
import { UserResponse, UserService } from '../../../../service/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css'],
  providers: [UserService],
})
export class ExpenseComponent implements OnInit, OnDestroy {
  @Input() expense: Expense;
  user: UserResponse;
  private userSubscription: Subscription;
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUser(this.expense.paidBy['_id']);
    this.userSubscription = this.userService.user.subscribe((user) => {
      this.user = user;

    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
