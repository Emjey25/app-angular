import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./modules/auth/pages/login/login').then(c => c.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/pages/main/main').then(c => c.Main),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
