import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GroupService } from '../../../../service/group.service';
import {  UserService } from '../../../../service/user.service';

@Component({
  selector: 'app-group-summary',
  templateUrl: './group-summary.component.html',
  styleUrls: ['./group-summary.component.css'],
  providers: [UserService]
})
export class GroupSummaryComponent implements OnInit {
  groupId: string;
  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
  ) {}

  groupSummary: any = null;
  lentSummary: any = null;

  ngOnInit() {

    this.route.parent?.params.subscribe((params: Params) => {
      this.groupId = params['id'];
      console.log(this.groupId);

      this.groupService
        .getGroupSummary(this.groupId)
        .subscribe((groupSummary) => {
          console.log(groupSummary);

          this.groupSummary = groupSummary;
        });
      // this.groupService.getLentSummary(this.groupId).subscribe(
      //   (lentSummary) => {
      //     this.lentSummary = [lentSummary];
      //   }
      // )
      // this.groupService.groupsChanged.subscribe(() => {
      //   this.groupService
      //     .getGroupSummary(this.groupId)
      //     .subscribe((groupSummary) => {
      //       this.groupSummary = [groupSummary];
      //     });
      //   // this.groupService.getLentSummary(this.groupId).subscribe(
      //   //   (lentSummary) => {
      //   //     this.lentSummary = lentSummary;
      //   //   }
      //   // )
      // });
    });
  }

  getSummaryText(settlementStatus: string) {
    let summaryText: string = '';
    switch (settlementStatus) {
      case 'OWES':
        summaryText = 'owes';
        break;
      case 'GETS_BACK':
        summaryText = 'gets back';
        break;
      case 'SETTLED_UP':
        summaryText = 'settled up';
        break;
    }
    return summaryText;
  }

  getUserName(userId: string): string {

    return userId;
  }

  abs(balance) {
    return Math.abs(balance);
  }

  toggle(summary: any): void {
    summary.showDetails = !summary.showDetails;
  }

  getBalanceStatus(balance: number): string {
    return balance < 0 ? 'owes' : balance > 0 ? 'gets' : 'is settled for';
  }

  onManageMember() {
    this.router.navigate(['../manage-members'], { relativeTo: this.route });
  }
}
