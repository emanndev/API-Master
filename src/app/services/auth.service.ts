import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User, AuthResponse } from '../model/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    // Simulate loading token from localStorage
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      this.tokenSubject.next(savedToken);
      this.currentUserSubject.next({
        username: 'testuser',
        password: 'password123',
      });
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    // Simulated Login authentication
    if (username === 'testuser' && password === 'password123') {
      const token = 'fake-jwt-token-123';
      const user: User = { username, password };
      localStorage.setItem('authToken', token);
      this.tokenSubject.next(token);
      this.currentUserSubject.next(user);
      return of({ token, user });
    }
    return throwError(() => new Error('Invalid credentials'));
  }

  logout() {
    localStorage.removeItem('authToken');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
