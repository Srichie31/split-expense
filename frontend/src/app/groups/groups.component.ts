import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Group } from '../model/group.model';
import { GroupService } from '../service/group.service';
import { Subscription } from 'rxjs';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit, OnDestroy {

  faPlus = faPlus

  public groups: Group[] = []

  private groupsSubscription: Subscription;
  private groupsChangedSubscription: Subscription;

  constructor(private groupService: GroupService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.groupsSubscription = this.groupService.groups.subscribe(
      (groups: Group[]) => {
        this.groups = groups;
        console.log(groups)
      }
    )
    this.groupService.fetchGroups();
    this.groupsChangedSubscription = this.groupService.groupsChanged.subscribe(
      () => this.groupService.fetchGroups()
    )
  }

  onAddExpense() {
    this.router.navigate(['new-expense'], {relativeTo: this.route})
  }

  onAddGroup() {
    this.router.navigate(['new-group'], {relativeTo: this.route})
  }

  ngOnDestroy(): void {
    this.groupsSubscription?.unsubscribe();
    this.groupsChangedSubscription.unsubscribe();
  }

}