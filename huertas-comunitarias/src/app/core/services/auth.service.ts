import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private platformId = inject(PLATFORM_ID);

  // Signal en vez de BehaviorSubject
  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  private readonly TOKEN_KEY = 'huertas_token';

  constructor(private router: Router) {
    this.checkStoredToken();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const mockResponse: LoginResponse = {
      token: 'jwt-token-' + Date.now(),
      user: { id: 1, nombre: 'Mónica', email: credentials.email, rol: 'Docente' }
    };

    return of(mockResponse).pipe(
      delay(1000),
      tap(res => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
        }
        this.currentUserSignal.set(res.user);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private checkStoredToken(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (localStorage.getItem(this.TOKEN_KEY)) {
      this.currentUserSignal.set({
        id: 1, nombre: 'Mónica', email: 'monica@huertas.com', rol: 'Docente'
      });
    }
  }
}
