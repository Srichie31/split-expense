import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Expense } from 'src/app/model/expense.model';
import { ExpenseService } from 'src/app/service/expense.service';
import { UserResponse, UserService } from 'src/app/service/user.service';
import { GroupService } from 'src/app/service/group.service';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.css'],
  providers: [UserService]
})
export class ExpenseDetailComponent implements OnInit, OnDestroy {
  expenseId: string;
  expense: Expense;
  user: UserResponse;

  faDelete = faTrash;
  faEdit = faEdit;

  private userSubscription: Subscription;
  constructor(private route: ActivatedRoute,
              private router: Router,
              private expenseService: ExpenseService,
              private groupService: GroupService,
              private userService: UserService,
              private location: Location) {}

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.expenseId = params['expenseId'];
        console.log(this.expenseId)
        this.expenseService.getExpenseById(this.expenseId).subscribe(
          (expense: Expense) => {
            this.expense = expense;
            this.userService.getUser(this.expense.paidBy["_id"]);
            this.userSubscription = this.userService.user.subscribe(user => this.user = user)
            console.log(this.expense);
            
          }
        );
      }
    )

  }

  onEdit() {
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  goBack() {
    this.location.back()
  }

  onDelete() {
    this.expenseService.deleteExpense(this.expense['_id']).subscribe(
      () => {
        this.expenseService.expensesChanged.next();
        this.groupService.groupsChanged.next();
      }
    )
    this.goBack();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

}
