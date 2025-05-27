import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Subscription } from 'rxjs';
import { Dropdown, Collapse } from 'bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  isAuthenticated: boolean = false;
  userName: string;
  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;
  dropdowns: Dropdown[] = [];
  collapseInstance!: Collapse;

  private userSubscription: Subscription;
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngAfterViewInit() {
    // Initialize all dropdowns inside this component
    const dropdownElements =
      this.navbarCollapse.nativeElement.querySelectorAll('.dropdown-toggle');
    this.dropdowns = Array.from(dropdownElements).map((el) => new Dropdown(el));

    // Initialize collapse for the navbar toggler target
    this.collapseInstance = new Collapse(this.navbarCollapse.nativeElement, {
      toggle: false, // don't auto-toggle on init
    });
  }

  toggleNavbar() {
    this.collapseInstance.toggle();
  }
  onAddExpense() {
    this.router.navigate(['/groups/new-expense']);
  }
  ngOnInit() {
    this.userSubscription = this.authService.user.subscribe((user) => {
      this.isAuthenticated = !!user;
      this.userName = user?.name;
    });
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
