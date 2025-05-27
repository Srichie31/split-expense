import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { UserResponse } from 'src/app/service/user.service';
import { GroupService } from '../../../../service/group.service';
import { AuthService } from 'src/app/service/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-members',
  templateUrl: './manage-members.component.html',
  styleUrls: ['./manage-members.component.css']
})
export class ManageMembersComponent implements OnDestroy{
  addMemberForm: FormGroup;
  nonMembers: UserResponse[] = []
  members: UserResponse[] = []
  groupId: string;
  loggedInUserId: string

  private userSubscription: Subscription;

  constructor(private groupService: GroupService,
              private authService: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user.subscribe(
      user => this.loggedInUserId = user?.user_id
    )
    this.route.parent?.params.subscribe(
      (params: Params) => {
        console.log(params);
        
        this.groupId = params['id'];
        this.fetchNonMembers()
        this.fetchMembers()
      }
    )

    this.addMemberForm = this.formBuilder.group({
      selectedMembers: [[], Validators.required] // Initially no members selected
    });
    this.addMemberForm.controls['selectedMembers'].reset();
  }

  fetchNonMembers() {
    this.groupService.getNonMebers(this.groupId).subscribe(
      (nonMembers) => this.nonMembers = nonMembers
    )
  }

  fetchMembers() {
    this.groupService.getMembers(this.groupId).subscribe(
      (members) => this.members = members
    )
  }

  onAddMembers() {
    const selectedMembers = this.addMemberForm.value.selectedMembers;
    console.log(selectedMembers,this.nonMembers)
    this.groupService.addMembers(this.groupId, selectedMembers).subscribe(
      () => {
        this.fetchNonMembers();
        this.fetchMembers();
      }
    );

  }

  onClear() {
    this.addMemberForm.reset();
  }

  onRemoveMember(memberId: string) {
    this.groupService.deleteMember(this.groupId, memberId).subscribe(
      () => {
        this.fetchNonMembers();
        this.fetchMembers();
      }
    )
  }

  onGotToSummary() {
    this.router.navigate(['../summary'], {relativeTo: this.route})
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
