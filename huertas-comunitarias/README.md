# 🌱 Huertas Comunitarias — Gestión ODS 2

> Aplicación web de gestión de huertas comunitarias alineada con el **Objetivo de Desarrollo Sostenible 2: Hambre Cero**. Construida con **Angular 21 Standalone**, **Tailwind CSS v4**, **TypeScript** y **SSR (Server-Side Rendering)**.

---

## 📦 Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| Angular | `^21.2.0` | Framework frontend (Standalone Components) |
| Tailwind CSS | `^4.2.2` | Framework de utilidad CSS |
| TypeScript | `~5.9.2` | Tipado estático |
| Angular SSR | `^21.2.2` | Renderizado del lado del servidor |
| RxJS | `~7.8.0` | Programación reactiva |
| Express | `^5.1.0` | Servidor SSR |
| PostCSS | `^8.5.8` | Procesador CSS para Tailwind |

---

## 🏗️ Estructura del Proyecto

```
huertas-comunitarias/
├── .postcssrc.json                          ← Configuración de PostCSS para Tailwind v4
├── angular.json                             ← Configuración del workspace Angular
├── package.json                             ← Dependencias y scripts
├── tsconfig.json                            ← Configuración base de TypeScript
├── tsconfig.app.json                        ← Configuración TS para la app
├── tsconfig.spec.json                       ← Configuración TS para tests
├── public/
│   └── favicon.ico                          ← Ícono del sitio
└── src/
    ├── index.html                           ← HTML principal
    ├── main.ts                              ← Bootstrap de la app (cliente)
    ├── main.server.ts                       ← Bootstrap SSR (servidor)
    ├── server.ts                            ← Servidor Express para SSR
    ├── styles.scss                          ← Estilos globales (importa Tailwind)
    └── app/
        ├── app.ts                           ← Componente raíz (AppComponent)
        ├── app.html                         ← Template raíz — solo <router-outlet />
        ├── app.scss                         ← Estilos del componente raíz
        ├── app.config.ts                    ← Configuración de la app (reemplaza AppModule)
        ├── app.config.server.ts             ← Configuración SSR del servidor
        ├── app.routes.ts                    ← Definición de rutas con loadComponent
        ├── app.routes.server.ts             ← Rutas de renderizado del servidor
        │
        ├── core/                            ← Lógica central de la aplicación
        │   ├── guards/
        │   │   └── auth.guard.ts            ← Guard funcional de autenticación
        │   ├── interceptors/                ← (Preparado para interceptores HTTP)
        │   ├── models/
        │   │   └── user.model.ts            ← Interfaces User, LoginRequest, LoginResponse
        │   └── services/
        │       └── auth.service.ts          ← Servicio de autenticación con Signals + SSR
        │
        ├── modules/                         ← Módulos de funcionalidad
        │   ├── auth/
        │   │   └── pages/
        │   │       └── login/
        │   │           ├── login.ts          ← Componente Login (ReactiveFormsModule)
        │   │           ├── login.html        ← Template Login (Tailwind CSS)
        │   │           └── login.scss        ← Estilos específicos del Login
        │   └── dashboard/
        │       ├── components/
        │       │   ├── header/
        │       │   │   ├── header.ts         ← Componente Header (inject + signals)
        │       │   │   ├── header.html       ← Template Header con info de usuario
        │       │   │   └── header.scss
        │       │   ├── sidebar/
        │       │   │   ├── sidebar.ts        ← Componente Sidebar (output signal)
        │       │   │   ├── sidebar.html      ← Template Sidebar con menú de navegación
        │       │   │   └── sidebar.scss
        │       │   └── stats-card/
        │       │       ├── stats-card.ts     ← Componente StatsCard (input signals)
        │       │       ├── stats-card.html   ← Template tarjeta de estadísticas
        │       │       └── stats-card.scss
        │       └── pages/
        │           └── main/
        │               ├── main.ts           ← Página principal del Dashboard
        │               ├── main.html         ← Template con sidebar, header, stats, tareas
        │               └── main.scss
        │
        └── shared/                          ← (Preparado para componentes compartidos)
            └── components/
```

---

## 🆚 Angular 21 Standalone vs NgModule

Este proyecto usa exclusivamente la arquitectura **Standalone**, sin ningún `NgModule`.

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

## 🚀 Guía Paso a Paso — Cómo Replicar el Proyecto

### Requisitos Previos

- **Node.js** `v20+`
- **npm** `v10+`
- **Angular CLI** `v21+` — instalar con:

```bash
npm install -g @angular/cli@latest
```

---

### PASO 1 — Crear el proyecto Angular 21

```bash
ng new huertas-comunitarias --style=scss --skip-tests --ssr
cd huertas-comunitarias
```

> Angular 21 genera todo **standalone por defecto**. No hay `app.module.ts`.

---

### PASO 2 — Instalar Tailwind CSS v4

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

---

### PASO 3 — Configurar PostCSS

Crear el archivo `.postcssrc.json` en la **raíz** del proyecto:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

---

### PASO 4 — Importar Tailwind en los estilos globales

Abrir `src/styles.scss` y **reemplazar todo** su contenido con:

```scss
@import "tailwindcss";
```

---

### PASO 5 — Crear la estructura de carpetas

```bash
mkdir -p src/app/core/{guards,models,services,interceptors}
mkdir -p src/app/modules/auth/pages/login
mkdir -p src/app/modules/dashboard/{components/{sidebar,header,stats-card},pages/main}
mkdir -p src/app/shared/components
```

---

### PASO 6 — Verificar que el proyecto base funciona

```bash
ng serve
```

Abrir `http://localhost:4200` — debe compilar sin errores.

---

### PASO 7 — Crear el modelo de Usuario

Crear `src/app/core/models/user.model.ts`:

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

---

### PASO 8 — Crear el AuthService con Signals y compatibilidad SSR

Crear `src/app/core/services/auth.service.ts`:

```typescript
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
```

> **⚠️ Nota sobre SSR:** Como el proyecto se creó con `--ssr`, `localStorage` no existe en el servidor (Node.js). Se usa `isPlatformBrowser()` con `PLATFORM_ID` para proteger **todas** las llamadas a `localStorage` y evitar el error `ReferenceError: localStorage is not defined`.

> **¿Por qué Signals?** Son nativos de Angular 21, no necesitan `subscribe()`, y el template solo usa `currentUser()` como función.

---

### PASO 9 — Crear el Guard funcional

Crear `src/app/core/guards/auth.guard.ts`:

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

### PASO 10 — Generar el componente Login

```bash
ng generate component modules/auth/pages/login --skip-tests
```

---

### PASO 11 — Implementar el Login (TypeScript)

Reemplazar `src/app/modules/auth/pages/login/login.ts`:

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {

  loginForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

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

---

### PASO 12 — Implementar el Login (HTML con Tailwind)

Reemplazar `src/app/modules/auth/pages/login/login.html`:

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

> No necesitamos archivo `.scss` aparte para el login — todo se estiliza con clases de Tailwind directamente en el HTML.

---

### PASO 13 — Generar los componentes del Dashboard

```bash
ng generate component modules/dashboard/pages/main --skip-tests
ng generate component modules/dashboard/components/sidebar --skip-tests
ng generate component modules/dashboard/components/header --skip-tests
ng generate component modules/dashboard/components/stats-card --skip-tests
```

---

### PASO 14 — Implementar el Sidebar

**`src/app/modules/dashboard/components/sidebar/sidebar.ts`:**

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

**`src/app/modules/dashboard/components/sidebar/sidebar.html`:**

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

---

### PASO 15 — Implementar el Header

**`src/app/modules/dashboard/components/header/header.ts`:**

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

**`src/app/modules/dashboard/components/header/header.html`:**

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

---

### PASO 16 — Implementar el StatsCard

**`src/app/modules/dashboard/components/stats-card/stats-card.ts`:**

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

**`src/app/modules/dashboard/components/stats-card/stats-card.html`:**

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

---

### PASO 17 — Implementar la página Main del Dashboard

**`src/app/modules/dashboard/pages/main/main.ts`:**

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

**`src/app/modules/dashboard/pages/main/main.html`:**

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

### PASO 18 — Configurar las rutas

Reemplazar `src/app/app.routes.ts`:

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

---

### PASO 19 — Limpiar el template raíz

Reemplazar **todo** el contenido de `src/app/app.html` con:

```html
<router-outlet />
```

---

### PASO 20 — Verificar `app.config.ts`

El archivo `src/app/app.config.ts` ya viene configurado por Angular CLI con el router. Verifica que contenga:

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay())
  ]
};
```

---

### PASO 21 — Verificar `app.ts` (Componente raíz)

El archivo `src/app/app.ts` debe contener:

```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('huertas-comunitarias Dev senior');
}
```

---

### PASO 22 — Levantar y probar

```bash
ng serve
```

Abrir `http://localhost:4200` y verificar:

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 1 | `localhost:4200` | Redirige a `/auth/login` |
| 2 | Navegar a `/dashboard` sin login | Redirige a `/auth/login` (guard funciona) |
| 3 | Llenar formulario con email y contraseña (min 6 chars) | El botón "Iniciar Sesión" se activa |
| 4 | Hacer clic en "Iniciar Sesión" | Carga 1 segundo → redirige a `/dashboard` |
| 5 | Dashboard muestra sidebar, header, stats, tareas y cultivos | Layout completo visible |
| 6 | Clic en 🚪 (logout) | Vuelve a `/auth/login` |

---

## 🎯 Conceptos Clave Implementados

| Concepto | Implementado en | Descripción |
|----------|-----------------|-------------|
| **Standalone Components** | Todos los componentes | Sin `NgModule`, cada componente es autosuficiente |
| **Tailwind CSS v4** | Todos los templates HTML | Estilos con clases de utilidad directas |
| **Signals** (`signal`, `computed`) | `AuthService`, `Login` | Estado reactivo nativo de Angular |
| **`input()` / `output()`** | `StatsCard`, `Sidebar` | Reemplazo moderno de `@Input()` / `@Output()` |
| **`inject()`** | `Header`, `authGuard` | Inyección de dependencias funcional |
| **Guard funcional** | `auth.guard.ts` | Función pura en vez de clase con `canActivate` |
| **`@if` / `@for`** | Todos los templates | Flujo de control moderno (reemplaza `*ngIf`, `*ngFor`) |
| **`loadComponent`** | `app.routes.ts` | Lazy loading a nivel de componente |
| **`app.config.ts`** | Configuración raíz | Reemplazo de `AppModule` |
| **SSR compatible** | `AuthService` | Usa `isPlatformBrowser()` para proteger `localStorage` |

---

## ⚠️ Nota Importante: Compatibilidad SSR

Al crear el proyecto con `--ssr`, el servidor (Node.js/Express) también ejecuta el código Angular. Como `localStorage` **no existe** en Node.js, se agregó protección en el `AuthService`:

```typescript
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Dentro de la clase:
private platformId = inject(PLATFORM_ID);

// Antes de cada uso de localStorage:
if (isPlatformBrowser(this.platformId)) {
  localStorage.setItem(key, value);
}
```

Esto aplica a los métodos: `login()`, `logout()`, `isAuthenticated()` y `checkStoredToken()`.

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` / `ng serve` | Servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Build de producción |
| `npm run serve:ssr:huertas-comunitarias` | Ejecutar build SSR con Express |
| `npm run watch` | Build en modo watch |

---

## 📝 Licencia

Proyecto académico — Gestión ODS 2: Hambre Cero.
