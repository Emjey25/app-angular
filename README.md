# 🌱 Guía — Angular 21 Standalone + Tailwind CSS v4
## Aplicación "Huertas Comunitarias" — Gestión ODS 2

**Duración:** 2 horas · **Tecnologías:** Angular 21, Tailwind CSS v4, TypeScript

---

## 📋 Distribución del Tiempo

| Bloque | Actividad | Duración |
|--------|-----------|----------|
| 1 | Proyecto Angular + Tailwind v4 | 15 min |
| 2 | Core: Modelos, AuthService, Guard | 20 min |
| 3 | Login (componente standalone) | 35 min |
| 4 | Dashboard (componentes standalone) | 35 min |
| 5 | Routing y pruebas | 15 min |

---

## 🆚 Angular 21 Standalone vs NgModule — Resumen

| NgModule (viejo) | Standalone (Angular 21) |
|---|---|
| `AppModule` | `app.config.ts` |
| `AuthModule`, `DashboardModule` | No existen — cada componente es independiente |
| `loadChildren` → módulo | `loadComponent` → componente directo |
| `*ngIf` / `*ngFor` | `@if` / `@for` |
| `@Input()` / `@Output()` | `input()` / `output()` |
| `BehaviorSubject` | `signal()` / `computed()` |
| Guard como clase | Guard como función |

---

## 🏗️ Estructura del Proyecto

```
src/app/
├── core/
│   ├── guards/auth.guard.ts        ← Guard funcional
│   ├── models/user.model.ts        ← Interfaces
│   └── services/auth.service.ts    ← Servicio con Signals
├── modules/
│   ├── auth/pages/login/           ← Componente standalone
│   └── dashboard/
│       ├── components/sidebar/
│       ├── components/header/
│       ├── components/stats-card/
│       └── pages/main/
├── app.ts                          ← Componente raíz
├── app.html                        ← Solo <router-outlet />
├── app.config.ts                   ← Reemplaza a AppModule
└── app.routes.ts                   ← Rutas con loadComponent
```

---

## BLOQUE 1 — Proyecto + Tailwind v4 (15 min)

### 1.1 — Crear proyecto Angular 21

```bash
ng new huertas-comunitarias --style=scss --skip-tests --ssr
cd huertas-comunitarias
```

> Angular 21 genera todo **standalone por defecto**. No hay `app.module.ts`.

### 1.2 — Instalar Tailwind CSS v4

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### 1.3 — Configurar PostCSS

Crear archivo `.postcssrc.json` en la raíz del proyecto:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

### 1.4 — Importar Tailwind en los estilos globales

Abrir `src/styles.scss` y reemplazar todo con:

```scss
@import "tailwindcss";
```

### 1.5 — Crear estructura de carpetas

```bash
mkdir -p src/app/core/{guards,models,services,interceptors}
mkdir -p src/app/modules/auth/pages/login
mkdir -p src/app/modules/dashboard/{components/{sidebar,header,stats-card},pages/main}
mkdir -p src/app/shared/components
```

### 1.6 — Verificar que funciona

```bash
ng serve
```

Abrir `http://localhost:4200` — debe compilar sin errores.

---

## BLOQUE 2 — Core: Modelo, Servicio y Guard (20 min)

### 2.1 — Modelo de Usuario

`src/app/core/models/user.model.ts`:

```typescript
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'Docente' | 'Estudiante' | 'Administrador';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
```

### 2.2 — AuthService con Signals

`src/app/core/services/auth.service.ts`:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

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
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.currentUserSignal.set(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private checkStoredToken(): void {
    if (localStorage.getItem(this.TOKEN_KEY)) {
      this.currentUserSignal.set({
        id: 1, nombre: 'Mónica', email: 'monica@huertas.com', rol: 'Docente'
      });
    }
  }
}
```

> **¿Por qué Signals?** Son nativos de Angular, no necesitan `subscribe()`, y el template solo usa `currentUser()` como función.

### 2.3 — Guard Funcional

`src/app/core/guards/auth.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) return true;
  return router.createUrlTree(['/auth/login']);
};
```

> **Ya no es una clase.** Es una función simple. Usa `inject()` en vez de constructor.

---

## BLOQUE 3 — Login con Tailwind (35 min)

### 3.1 — Generar componente

```bash
ng generate component modules/auth/pages/login --skip-tests
```

### 3.2 — Login TypeScript

`src/app/modules/auth/pages/login/login.ts`:

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login implements OnInit {

  loginForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.errorMessage.set('Credenciales incorrectas.');
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false)
    });
  }
}
```

### 3.3 — Login HTML con Tailwind

`src/app/modules/auth/pages/login/login.html`:

```html
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-green-500 to-green-300 p-4">
  <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

    <!-- Header -->
    <div class="text-center mb-8">
      <div class="text-5xl mb-2">🌱</div>
      <h1 class="text-2xl font-bold text-green-800">Huertas Comunitarias</h1>
      <p class="text-gray-500 text-sm">Gestión ODS 2 — Hambre Cero</p>
    </div>

    <!-- Formulario -->
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
        <input id="email" type="email" formControlName="email"
          placeholder="correo@ejemplo.com"
          class="w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none focus:border-green-500"
          [class]="f['email'].touched && f['email'].invalid ? 'border-red-400' : 'border-gray-200'" />
        @if (f['email'].touched && f['email'].errors?.['required']) {
          <span class="text-red-500 text-xs mt-1">El correo es obligatorio</span>
        }
        @if (f['email'].touched && f['email'].errors?.['email']) {
          <span class="text-red-500 text-xs mt-1">Ingresa un correo válido</span>
        }
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
        <input id="password" type="password" formControlName="password"
          placeholder="Mínimo 6 caracteres"
          class="w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none focus:border-green-500"
          [class]="f['password'].touched && f['password'].invalid ? 'border-red-400' : 'border-gray-200'" />
        @if (f['password'].touched && f['password'].errors?.['required']) {
          <span class="text-red-500 text-xs mt-1">La contraseña es obligatoria</span>
        }
        @if (f['password'].touched && f['password'].errors?.['minlength']) {
          <span class="text-red-500 text-xs mt-1">Mínimo 6 caracteres</span>
        }
      </div>

      <!-- Error general -->
      @if (errorMessage()) {
        <div class="bg-red-50 text-red-700 text-sm p-3 rounded-lg text-center">
          ⚠️ {{ errorMessage() }}
        </div>
      }

      <!-- Botón -->
      <button type="submit" [disabled]="isLoading()"
        class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
        @if (!isLoading()) { Iniciar Sesión } @else { Cargando... }
      </button>
    </form>
  </div>
</div>
```

> No necesitamos archivo `.scss` para el login — todo se estiliza con clases de Tailwind directamente.

---

## BLOQUE 4 — Dashboard con Tailwind (35 min)

### 4.1 — Generar componentes

```bash
ng generate component modules/dashboard/pages/main --skip-tests
ng generate component modules/dashboard/components/sidebar --skip-tests
ng generate component modules/dashboard/components/header --skip-tests
ng generate component modules/dashboard/components/stats-card --skip-tests
```

### 4.2 — Sidebar

**`sidebar.ts`:**

```typescript
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  menuSelected = output<string>();

  menuItems = [
    { icon: '📊', label: 'Dashboard', route: 'dashboard' },
    { icon: '🌿', label: 'Mis Huertas', route: 'huertas' },
    { icon: '🌱', label: 'Cultivos', route: 'cultivos' },
    { icon: '🤝', label: 'Voluntarios', route: 'voluntarios' },
    { icon: '📋', label: 'Tareas', route: 'tareas' },
  ];

  activeItem = 'dashboard';

  selectItem(route: string): void {
    this.activeItem = route;
    this.menuSelected.emit(route);
  }
}
```

**`sidebar.html`:**

```html
<aside class="w-56 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 flex flex-col">
  <div class="flex items-center gap-2 px-4 py-4 bg-green-600 text-white">
    <span class="text-xl">🌱</span>
    <span class="font-bold text-sm">Huertas Comunitarias</span>
  </div>

  <nav class="py-3 flex-1">
    @for (item of menuItems; track item.route) {
      <a (click)="selectItem(item.route)"
        class="flex items-center gap-3 px-5 py-2.5 text-sm cursor-pointer transition-all"
        [class]="activeItem === item.route
          ? 'bg-green-50 text-green-800 font-semibold border-l-3 border-green-600'
          : 'text-gray-600 hover:bg-green-50 hover:text-green-700'">
        <span>{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </a>
    }
  </nav>
</aside>
```

### 4.3 — Header

**`header.ts`:**

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
})
export class Header {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
  }
}
```

**`header.html`:**

```html
<header class="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
  <h2 class="text-lg font-semibold text-gray-800">Dashboard — Gestión ODS 2</h2>

  <div class="flex items-center gap-4">
    <button class="text-xl hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer">🔔</button>
    @if (user()) {
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
          {{ user()!.nombre.charAt(0) }}
        </div>
        <div class="flex flex-col leading-tight">
          <span class="font-semibold text-sm">{{ user()!.nombre }}</span>
          <span class="text-xs text-gray-500">{{ user()!.rol }}</span>
        </div>
        <button (click)="logout()" class="text-lg hover:bg-red-50 p-1 rounded-md transition-colors cursor-pointer" title="Cerrar sesión">🚪</button>
      </div>
    }
  </div>
</header>
```

### 4.4 — StatsCard

**`stats-card.ts`:**

```typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.html',
})
export class StatsCard {
  title = input('');
  value = input<string | number>(0);
  icon = input('');
}
```

**`stats-card.html`:**

```html
<div class="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
  <div class="text-3xl w-12 h-12 flex items-center justify-center bg-green-50 rounded-xl">
    {{ icon() }}
  </div>
  <div class="flex flex-col">
    <span class="text-xs text-gray-500">{{ title() }}</span>
    <span class="text-2xl font-bold text-green-800">{{ value() }}</span>
  </div>
</div>
```

### 4.5 — Página Main del Dashboard

**`main.ts`:**

```typescript
import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Header } from '../../components/header/header';
import { StatsCard } from '../../components/stats-card/stats-card';

@Component({
  selector: 'app-main',
  imports: [Sidebar, Header, StatsCard],
  templateUrl: './main.html',
})
export class Main {
  stats = [
    { title: 'Huertas Activas', value: 5, icon: '🌿' },
    { title: 'Cosechas Próximas', value: 3, icon: '🌾' },
    { title: 'Voluntarios Hoy', value: 12, icon: '🤝' },
  ];

  tareas = [
    { tarea: 'Riego Diario', asignado: 'Ana R.', estado: 'Pendiente' },
    { tarea: 'Siembra Lechuga', asignado: 'Juan P.', estado: 'En Proceso' },
  ];

  cultivos = [
    { nombre: 'Tomate Cherry', estado: 'Fruición', color: 'bg-red-500' },
    { nombre: 'Zanahoria', estado: 'Crecimiento', color: 'bg-orange-500' },
    { nombre: 'Acelga', estado: 'Lista', color: 'bg-green-500' },
  ];
}
```

**`main.html`:**

```html
<div class="flex min-h-screen bg-gray-100">
  <app-sidebar />

  <div class="flex-1 ml-56 flex flex-col">
    <app-header />

    <main class="p-6 flex-1">
      <!-- Stats -->
      <h3 class="text-base font-bold text-gray-700 mb-3">Resumen Mensual</h3>
      <div class="grid grid-cols-3 gap-4 mb-6">
        @for (stat of stats; track stat.title) {
          <app-stats-card [title]="stat.title" [value]="stat.value" [icon]="stat.icon" />
        }
      </div>

      <!-- Widgets -->
      <div class="grid grid-cols-2 gap-6">

        <!-- Tareas -->
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <h3 class="font-bold text-gray-700 mb-4">Tareas Prioritarias</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-gray-200 text-left text-gray-500">
                <th class="pb-2">Tarea</th>
                <th class="pb-2">Asignado</th>
                <th class="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tareas; track t.tarea) {
                <tr class="border-b border-gray-100">
                  <td class="py-2">{{ t.tarea }}</td>
                  <td class="py-2">{{ t.asignado }}</td>
                  <td class="py-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold"
                      [class]="t.estado === 'Pendiente'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'">
                      {{ t.estado }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Cultivos -->
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <h3 class="font-bold text-gray-700 mb-4">Estado de Cultivos</h3>
          <div class="flex flex-col gap-3">
            @for (c of cultivos; track c.nombre) {
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div class="flex flex-col">
                  <strong class="text-sm">{{ c.nombre }}</strong>
                  <small class="text-xs text-gray-500">{{ c.estado }}</small>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold text-white" [class]="c.color">
                  {{ c.estado }}
                </span>
              </div>
            }
          </div>
        </div>

      </div>
    </main>
  </div>
</div>
```

---

## BLOQUE 5 — Routing y Pruebas (15 min)

### 5.1 — Configurar rutas

`src/app/app.routes.ts`:

```typescript
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
```

### 5.2 — Limpiar template raíz

Reemplazar `src/app/app.html` con:

```html
<router-outlet />
```

### 5.3 — Levantar y probar

```bash
ng serve
```

| # | Prueba | Resultado |
|---|--------|-----------|
| 1 | `localhost:4200` | Redirige a `/auth/login` |
| 2 | `/dashboard` sin login | Redirige a login (guard) |
| 3 | Login con datos | Carga 1s → redirige a `/dashboard` |
| 4 | Clic en 🚪 | Logout → vuelve a login |

---

## 🎯 Conceptos Clave

| Concepto | Implementado en |
|----------|----------------|
| **Standalone Components** | Todos los componentes |
| **Tailwind CSS v4** | Estilos directamente en HTML |
| **Signals** (`signal`, `computed`) | AuthService, Login |
| **`input()` / `output()`** | StatsCard, Sidebar |
| **`inject()`** | Header, authGuard |
| **Guard funcional** | `authGuard` |
| **`@if` / `@for`** | Todos los templates |
| **`loadComponent`** | app.routes.ts |
| **`app.config.ts`** | Reemplaza AppModule |
