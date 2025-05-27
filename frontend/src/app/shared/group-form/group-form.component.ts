import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, UrlSegment } from '@angular/router';
import { Group } from 'src/app/model/group.model';
import { GroupService } from 'src/app/service/group.service';

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.css']
})
export class GroupFormComponent {
  groupForm: FormGroup;
  isEdit = true;
  formHeading = "Edit Group";
  groupId: string;
  group: Group;
  constructor(private groupService: GroupService,
              private route: ActivatedRoute,
              private location: Location) { }

  ngOnInit() {
    this.initForm();
    this.route.url.subscribe(
      (url: UrlSegment[]) => {
        if(url[0].path === "new-group") {
          this.isEdit = false;
          this.formHeading = "Add Group";
        }
        else {
          this.route.parent?.params.subscribe(
            (params: Params) => {
              this.groupId = params['id'];
              this.groupService.getGroupById(this.groupId).subscribe(
                (group: Group) => {
                  this.group = group;
                  this.initForm(this.group.name);
                }
              );
            }
          )
        }
      }
    )
  }

  initForm(groupName=null) {
    this.groupForm = new FormGroup({
      'name': new FormControl(groupName, [
        Validators.required,
      ])
    })
  }

  isEqual() {
    return this.group && this.group.name === this.groupForm.value.name;
  }

  onSubmit() {
    if(!this.isEdit) 
      this.groupService.addGroup(this.groupForm.value).subscribe(
        () => this.groupService.fetchGroups() // fetch groups instead of emitting an event to avoid 404 for fetching summaries
      );
    else {
      this.groupService.updateGroup(this.groupId, this.groupForm.value.name).subscribe(
        () => this.groupService.groupsChanged.next()
      );
    }
    this.goBack()
  }

  onClear() {
    this.groupForm.reset()
  }

  onReset() {
    this.isEdit ? this.initForm(this.group.name) : this.groupForm.reset();
  }

  goBack() {
    this.location.back()
  }
}
