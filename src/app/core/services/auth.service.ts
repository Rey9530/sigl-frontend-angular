import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IUser, ILoginRequest, ILoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';

  private currentUserSubject = new BehaviorSubject<IUser | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: ILoginRequest): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(
      `${environment.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        this.setToken(response.access_token);
        this.setUser(response.usuario);
        this.currentUserSubject.next(response.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  getCurrentUser(): IUser | null {
    return this.currentUserSubject.value;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: IUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): IUser | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }
}
