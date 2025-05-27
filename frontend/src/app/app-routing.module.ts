import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { GroupsComponent } from "./groups/groups.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AuthComponent } from "./auth/auth.component";
import { canActiate } from "./auth/auth.guard";
import { GroupDetailComponent } from "./groups/group/group-detail/group-detail.component";
import { GroupSummaryComponent } from "./groups/group/group-detail/group-summary/group-summary.component";
import { ManageMembersComponent } from "./groups/group/group-detail/manage-members/manage-members.component";
import { ExpenseDetailComponent } from "./groups/group/group-detail/expense/expense-detail/expense-detail.component";
import { ExpenseFormComponent } from "./shared/expense-form/expense-form.component";
import { GroupFormComponent } from "./shared/group-form/group-form.component";


const appRoutes: Route[] = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  { path: 'dashboard', component: DashboardComponent, canActivate: [canActiate]},
  { path: 'groups', component: GroupsComponent, canActivate: [canActiate], children: [
    { path: 'new-group', component: GroupFormComponent },
    { path: 'new-expense', component: ExpenseFormComponent},
    { path: ':id', component: GroupDetailComponent, children: [
        { path: '', redirectTo: 'summary', pathMatch: 'full' },
        { path: 'summary', component: GroupSummaryComponent },
        { path: 'manage-members', component: ManageMembersComponent },
        { path: 'expense', children: [
            { path: ':expenseId', children: [
              { path: '', component: ExpenseDetailComponent},
              { path: 'edit', component: ExpenseFormComponent}
            ]}
          ]
        },
        { path: 'edit', component: GroupFormComponent}
      ]
    }
  ]},
  { path: 'auth', component: AuthComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}