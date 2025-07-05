import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { User } from '../model/user.model';

export interface AuthResponse {
  userId: string;
  name: string
  email: string
  token: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private authUrl = 'https://split-expense-backend-by-srichie.vercel.app/auth';
  private logOutTimer: any;

  constructor(private http: HttpClient,
              private router: Router) {}

  signup(name: string, email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.authUrl}/register`, {
        name,
        email,
        password,
      })
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handelAuthentication(resData.userId, resData.name, resData.email, resData.token, resData.expiresIn);
        })
      );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, {
      email,
      password,
    }).pipe(
      catchError(this.handleError),
      tap(resData => {
        this.handelAuthentication(resData.userId, resData.name, resData.email, resData.token, resData.expiresIn);
      })
    );
  }

  logout() {
    this.user.next(null);
    localStorage.removeItem("userData")
    this.router.navigate(['/auth'])
    if(!this.logOutTimer) {
      clearTimeout(this.logOutTimer)
    }
    this.logOutTimer = null;
  }

  autoLogin() {
    let userData: {
      user_id: string,
      name: string,
      email: string,
      _token: string,
      _tokenExpirationDate: string
    } = JSON.parse(localStorage.getItem("userData"));

    if(!userData) {
      return;
    }

    let loadedUser = new User(userData.user_id, userData.name, userData.email, userData._token, new Date(userData._tokenExpirationDate));

    if(loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogOut(expirationDuration);
    }
  }

  autoLogOut(expirationDuration: number) {
    this.logOutTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handelAuthentication(userId: string, name: string, email: string, token: string, expiresIn: number) {
    const expirationDate: Date = new Date(expiresIn * 1000);
    const user = new User(userId, name, email, token, expirationDate);
    this.user.next(user);
    this.autoLogOut(expiresIn * 1000 - new Date().getTime())
    localStorage.setItem("userData", JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unkown error occured!';
    if (!errorRes.error || !errorRes.error.message)
      return throwError(() => errorMessage);
    switch (errorRes.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already!';
        break;
      case 'INVALID_CREDENTIALS':
        errorMessage = 'Invalid credentials. Please try again!';
        break;
    }
    return throwError(() => errorMessage);
  }
}
