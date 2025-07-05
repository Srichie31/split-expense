import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Group } from "../model/group.model";
import { UserResponse } from "./user.service";

@Injectable({providedIn: 'root'})
export class GroupService implements OnDestroy{
  groups = new BehaviorSubject<Group[]>([]);
  groupsChanged = new Subject<void>();
  private baseUrl: string = 'https://split-expense-backend-by-srichie.vercel.app/groups'

  constructor(private http: HttpClient) {
    this.fetchGroups();
  }

  fetchGroups() {
    this.http
      .get<Group[]>(`${this.baseUrl}`)
      .subscribe(groups => this.groups.next(groups));
    
  }

  getGroupById(groupId: string) {
    return this.http.get<any>(`${this.baseUrl}/${groupId}`).pipe(
      tap(resp => console.log('Raw API response:', resp))
    );
  }

  getNonMebers(groupId: string) {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/${groupId}/nonmembers`);
  }

  getMembers(groupId: string) {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/${groupId}/members`);
  }

  getGroupSummary(groupId: string) {
    return this.http.get(`${this.baseUrl}/${groupId}/summary`);
  }

  getLentSummary(groupId: string) {
    return this.http.get(`${this.baseUrl}/${groupId}/lent`);
  }

  addGroup(group: { name: string }) {
    return this.http.post(`${this.baseUrl}/create`, group);
  }

  addMembers(groupId: string, memberIds: string[]) {
    return this.http.post(`${this.baseUrl}/${groupId}/members`, { memberIds })
    .pipe(
      tap(
        () => this.fetchGroups()
      )
    )
  }

  deleteMember(groupId: string, memberId: string) {
    return this.http.delete(`${this.baseUrl}/${groupId}/members/${memberId}`)
    .pipe(
      tap(
        () => this.fetchGroups()
      )
    )
  }

  updateGroup(groupId: string, name: string) {
    return this.http.put(`${this.baseUrl}/${groupId}`, {name});
  }

  deleteGroup(groupId: string) {
    return this.http.delete(`${this.baseUrl}/${groupId}`);
  }

  ngOnDestroy() {
    this.groups.unsubscribe();
  }
}