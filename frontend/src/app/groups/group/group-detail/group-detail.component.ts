import { Component, OnDestroy } from '@angular/core';

import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Group } from '../../../model/group.model';
import { GroupService } from '../../../service/group.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Expense } from '../../../model/expense.model';
import { ExpenseService } from '../../../service/expense.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css'],
})
export class GroupDetailComponent implements OnDestroy {
  group: Group;
  id: string;
  expenses: Expense[] = [];

  faEdit = faEdit;
  faDelete = faTrash;

  private expensesSubscription: Subscription;
  private expensesChangedSubscription: Subscription;
  private groupsChangedSubscription: Subscription;

  constructor(
    private groupService: GroupService,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      console.log(params, params['id']);

      this.fetchGroup();
      this.fetchExpenses();
      this.expensesSubscription = this.expenseService.expenses.subscribe(
        (expense) => (this.expenses = expense)
      );
      this.expensesChangedSubscription =
        this.expenseService.expensesChanged.subscribe(() =>
          this.fetchExpenses()
        );
      this.groupsChangedSubscription =
        this.groupService.groupsChanged.subscribe(() => this.fetchGroup());
    });
  }

  onEditGroup() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  fetchGroup() {
    console.log('Fetching group with ID:', this.id);
    this.groupService.getGroupById(this.id).subscribe({
      next: (group) => {
        console.log('Fetched group:', group);
        this.group = group;
      },
      error: (err) => {
        console.error('Error while fetching group:', err);
      },
    });
  }

  fetchExpenses() {
    console.log(this.id);

    this.expenseService.getExpenseByGroupId(this.id).subscribe((expenses) => {
      console.log(expenses);

      this.expenses = expenses;
    });
  }

  onDeleteGroup() {
    console.log(this.group);
    this.groupService.deleteGroup(this.group['_id']).subscribe(() => {
      this.groupService.fetchGroups(); // Fetch groups instead of emitting an event to avoid 404 for fetching summaries
    });
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onManageMember() {
    const groupId = this.route.snapshot.paramMap.get('id');
    console.log(groupId);
    
    if (groupId) {
      this.router.navigate([`/groups/${groupId}/manage-members`]);
    }
  }

  ngOnDestroy(): void {
    this.expensesSubscription?.unsubscribe();
    this.expensesChangedSubscription.unsubscribe();
    this.groupsChangedSubscription.unsubscribe();
  }
}
