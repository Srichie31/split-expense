import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Expense } from '../model/expense.model';
import { Group } from '../model/group.model';
import { UserService } from '../service/user.service';
import { User } from '../model/user.model';
import { AuthService } from '../service/auth.service';
import { ExpenseService } from 'src/app/service/expense.service';
import { GroupService } from '../service/group.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [UserService],
})
export class DashboardComponent {
  //   addExpenseForm: FormGroup;
  //   groups: Group[] = [];
  //   user: User;
  //   splitBetween;
  //   private groupsSubscription: Subscription;
  //   constructor(
  //     private groupService: GroupService,
  //     private authService: AuthService,
  //     private expenseService: ExpenseService,
  //     private router: Router
  //   ) {}
  //   ngOnInit() {
  //     this.addExpenseForm = new FormGroup({
  //       expenseDescription: new FormControl(null, [Validators.required]),
  //       groupId: new FormControl(0, [Validators.required]),
  //       expenseAmount: new FormControl(null, [
  //         Validators.required,
  //         this.amountLessThanOneValidator,
  //       ]),
  //       expenseDate: new FormControl(new Date(), [
  //         Validators.required,
  //         this.dateValidator,
  //       ]),
  //       splitBetween: new FormControl([], [Validators.required]),
  //     });
  //     this.groupService.fetchGroups();
  //     this.groupsSubscription = this.groupService.groups.subscribe(
  //       (groups: Group[]) => {
  //         this.groups = groups;
  //       }
  //     );
  //     this.authService.user.subscribe((user) => (this.user = user));
  //   }
  //   onAddExpense() {
  //     let groupId: string = this.addExpenseForm.get('groupId').value;
  //     let expense: Expense = new Expense(
  //       this.addExpenseForm.value['expenseDescription'],
  //       this.addExpenseForm.value['expenseAmount'],
  //       this.addExpenseForm.value['expenseDate']
  //         .toISOString()
  //         .slice(0, 19)
  //         .replace('T', ' '),
  //       this.user.user_id,
  //       groupId,
  //       this.addExpenseForm.value['split_between']
  //     );
  //     this.expenseService
  //       .addExpense(expense)
  //       .subscribe((response) => this.groupService.fetchGroups());
  //     this.addExpenseForm.reset();
  //     this.router.navigate(['groups']);
  //   }
  //   isInvalid(formControlName: string) {
  //     let control = this.addExpenseForm.get(formControlName);
  //     return !control.valid && control.touched && control.value == null;
  //   }
  //   amountLessThanOneValidator(control: FormControl): { [s: string]: boolean } {
  //     if (control.value !== null && control.value <= '0') {
  //       return { isInvalidAmount: true };
  //     } else return null;
  //   }
  //   isAmountInvalid() {
  //     let control = this.addExpenseForm.get('expenseAmount');
  //     return control.errors
  //       ? control.errors.hasOwnProperty('isInvalidAmount') &&
  //           control.errors['isInvalidAmount']
  //       : false;
  //   }
  //   dateValidator(control: FormControl): { [s: string]: boolean } {
  //     if (control.value != null && new Date(control.value) > new Date()) {
  //       return { isInvalidDate: true };
  //     } else return null;
  //   }
  //   isDateInvalid() {
  //     let control = this.addExpenseForm.get('expenseDate');
  //     return control.errors
  //       ? control.errors.hasOwnProperty('isInvalidDate') &&
  //           control.errors['isInvalidDate']
  //       : false;
  //   }
  //   onReset() {
  //     this.addExpenseForm.reset();
  //   }
  //   ngOnDestroy(): void {
  //     this.groupsSubscription?.unsubscribe();
  //   }
}
