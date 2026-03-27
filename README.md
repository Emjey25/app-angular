# 🌱 Guía Paso a Paso — Angular Standalone: Login y Dashboard
## Aplicación "Huertas Comunitarias" — Gestión ODS 2

**Duración total:** 2 horas  
**Fecha:** 27 de Marzo, 2026  
**Tecnologías:** Angular 21 (Standalone), TypeScript, SCSS  
**Arquitectura:** Core Architecture con Componentes Standalone  

---

> [!IMPORTANT]
> **Angular 21 ya NO usa `NgModule`.** La arquitectura moderna es **100% Standalone**. Los componentes, directivas y pipes se importan directamente donde se necesiten. La configuración global se maneja mediante `app.config.ts` y funciones `provide*()`.

---

## 📋 Distribución del Tiempo

| Bloque | Actividad | Duración |
|--------|-----------|----------|
| 1 | Crear proyecto Angular + estructura Core | 15 min |
| 2 | Core: Modelos, AuthService y Guard funcional | 20 min |
| 3 | Feature Auth — Login de acceso | 35 min |
| 4 | Feature Dashboard — Vista principal | 35 min |
| 5 | Routing, pruebas y ajustes finales | 15 min |

---

## 🆚 NgModule vs Standalone — ¿Qué cambió?

| Concepto (antes NgModule) | Equivalente Standalone (Angular 21) |
|---|---|
| `AppModule` con `@NgModule()` | `app.config.ts` con `ApplicationConfig` |
| `imports: [BrowserModule]` en módulo | `providers: [provideRouter()]` en config |
| `CoreModule`, `SharedModule` | Carpetas organizativas, sin archivos `.module.ts` |
| `AuthModule` con `loadChildren` | `loadComponent` directamente en rutas |
| `declarations: [LoginComponent]` | `imports: [ReactiveFormsModule]` dentro de cada `@Component` |
| `app-routing.module.ts` | `app.routes.ts` (simple array de `Routes`) |
| `@NgModule({ providers: [...] })` | `providedIn: 'root'` en servicios o `providers` en `app.config.ts` |

---

## 🏗️ Arquitectura Core Standalone — Estructura del Proyecto

```
src/app/
├── core/                          ← Servicios globales, guards, interceptors, modelos
│   ├── guards/
│   │   └── auth.guard.ts          ← Guard funcional (función, NO clase)
│   ├── interceptors/
│   ├── models/
│   │   └── user.model.ts
│   └── services/
│       └── auth.service.ts        ← providedIn: 'root' (singleton automático)
├── modules/                       ← Features independientes
│   ├── auth/
│   │   └── pages/
│   │       └── login/             ← Componente standalone
│   └── dashboard/
│       ├── components/
│       │   ├── sidebar/           ← Componente standalone
│       │   ├── header/            ← Componente standalone
│       │   └── stats-card/        ← Componente standalone
│       └── pages/
│           └── main/              ← Componente standalone
├── shared/                        ← Componentes reutilizables, pipes, directivas
│   └── components/
├── app.ts                         ← Componente raíz standalone
├── app.html                       ← Template del componente raíz
├── app.scss                       ← Estilos del componente raíz
├── app.config.ts                  ← ⭐ Reemplaza a AppModule (providers globales)
├── app.config.server.ts           ← Configuración para SSR
├── app.routes.ts                  ← ⭐ Reemplaza a AppRoutingModule
└── app.routes.server.ts           ← Rutas de SSR
```

> [!NOTE]
> **No hay ni un solo `*.module.ts`** en toda la aplicación. Los componentes se importan directamente donde se necesitan. La carpeta `core/` ya no necesita un `CoreModule` — los servicios con `providedIn: 'root'` son singleton automáticamente.

---

## BLOQUE 1 — Crear Proyecto + Estructura Core (15 min)

### Paso 1.1 — Crear el proyecto Angular 21

Abre tu terminal y ejecuta:

```bash
ng new huertas-comunitarias --style=scss --skip-tests --ssr
```

> **¿Qué hace cada flag?**
> - `--style=scss` → Usa SCSS en vez de CSS plano
> - `--skip-tests` → No genera archivos `.spec.ts` (para ahorrar tiempo en clase)
> - `--ssr` → Habilita Server-Side Rendering (incluido por defecto en Angular 21)
>
> ⚠️ **Ya no existe `--routing`.** Angular 21 genera `app.routes.ts` automáticamente.
> ⚠️ **Ya no se genera `app.module.ts`.** Todo es standalone por defecto.

```bash
cd huertas-comunitarias
```

### Paso 1.2 — Observa los archivos generados

Angular 21 genera estos archivos clave (no los archivos de NgModule del pasado):

| Archivo | Propósito |
|---------|-----------|
| `app.ts` | Componente raíz (`@Component` standalone) |
| `app.html` | Template del componente raíz |
| `app.config.ts` | **Configuración global** (reemplaza `AppModule`) |
| `app.routes.ts` | **Definición de rutas** (reemplaza `AppRoutingModule`) |
| `app.config.server.ts` | Configuración para SSR |
| `app.routes.server.ts` | Rutas de Server-Side Rendering |

**`app.ts` — Componente Raíz (ya generado):**

```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],      // ← Imports directamente en el componente
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('huertas-comunitarias');
}
```

> [!NOTE]
> Observa que **no hay `NgModule`**. El componente importa lo que necesita directamente en su decorator `@Component({ imports: [...] })`. Además, usa `signal()` en vez de propiedades simples — esto es la nueva **reactividad de Angular**.

**`app.config.ts` — Configuración Global (ya generado):**

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay())
  ]
};
```

> [!IMPORTANT]
> `app.config.ts` es el **corazón de la configuración**. Aquí se registran todos los providers globales: Router, HttpClient, Hydration, etc. Es el reemplazo directo de `AppModule`.

### Paso 1.3 — Crear la estructura de carpetas

Ejecuta estos comandos **en orden**:

```bash
# 1. Carpetas del Core
mkdir -p src/app/core/guards
mkdir -p src/app/core/interceptors
mkdir -p src/app/core/models
mkdir -p src/app/core/services

# 2. Carpetas de Features (antes llamados "Módulos")
mkdir -p src/app/modules/auth/pages/login
mkdir -p src/app/modules/dashboard/components
mkdir -p src/app/modules/dashboard/pages/main

# 3. Carpetas Shared
mkdir -p src/app/shared/components
```

### Paso 1.4 — ¿Y el CoreModule? ¡Ya no lo necesitas!

En la guía anterior con NgModule, creábamos un `CoreModule` con el patrón `@Optional() @SkipSelf()` para evitar múltiples instancias. **En standalone, esto ya no es necesario:**

| Antes (NgModule) | Ahora (Standalone) |
|---|----|
| `CoreModule` con `@Optional() @SkipSelf()` | No necesario — `providedIn: 'root'` garantiza singleton |
| Importar `CoreModule` en `AppModule` | No necesario — servicios se inyectan directamente |
| `SharedModule` exportando componentes | No necesario — cada componente importa lo que necesita |

> [!TIP]
> La carpeta `core/` sigue existiendo como **organización lógica** de tu código, pero ya no contiene un archivo `.module.ts`. Los servicios con `providedIn: 'root'` son singleton automáticamente en toda la aplicación.

---

## BLOQUE 2 — Core: Modelos, Servicio y Guard Funcional (20 min)

### Paso 2.1 — Crear el modelo de Usuario

Crea el archivo `src/app/core/models/user.model.ts`:

```typescript
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'Docente' | 'Estudiante' | 'Administrador';
  avatar?: string;
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

### Paso 2.2 — Crear el AuthService

```bash
ng generate service core/services/auth --skip-tests
```

Abre `src/app/core/services/auth.service.ts` y reemplaza con:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'   // ← Singleton automático, NO necesita CoreModule
})
export class AuthService {

  // ✅ Angular 21: Usamos Signals en vez de BehaviorSubject
  private currentUserSignal = signal<User | null>(null);

  // Signal de solo lectura para exponer al exterior
  public readonly currentUser = this.currentUserSignal.asReadonly();

  // Signal computado: deriva automáticamente si está autenticado
  public readonly isLoggedIn = computed(() => this.currentUser() !== null);

  // Token almacenado en localStorage
  private readonly TOKEN_KEY = 'huertas_token';

  constructor(private router: Router) {
    // Al iniciar, revisa si ya hay un token guardado
    this.checkStoredToken();
  }

  /**
   * Simula el login contra un backend.
   * En producción, aquí iría un HttpClient.post()
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const mockResponse: LoginResponse = {
      token: 'jwt-token-simulado-' + Date.now(),
      user: {
        id: 1,
        nombre: 'Mónica',
        email: credentials.email,
        rol: 'Docente',
        avatar: ''
      }
    };

    // of() crea un Observable, delay() simula latencia de red
    return of(mockResponse).pipe(
      delay(1000),
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        this.currentUserSignal.set(response.user); // ← .set() en vez de .next()
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Revisa si hay token al iniciar la app
   */
  private checkStoredToken(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.currentUserSignal.set({
        id: 1,
        nombre: 'Mónica',
        email: 'monica@huertas.com',
        rol: 'Docente'
      });
    }
  }
}
```

> [!TIP]
> **¿Por qué Signals en vez de BehaviorSubject?**
> - `signal()` es nativo de Angular, no requiere RxJS.
> - `computed()` auto-deriva valores — como `isLoggedIn` que se actualiza solo cuando cambia `currentUser`.
> - No necesitas `.subscribe()` en los templates — solo llamas `currentUser()` como una función.
> - Mejor rendimiento: Angular sabe exactamente qué componentes re-renderizar.

### Paso 2.3 — Crear el AuthGuard (Guard Funcional)

```bash
ng generate guard core/guards/auth --skip-tests
```

> [!WARNING]
> **Angular 21 NO usa guards basados en clases** (`implements CanActivate`). Ahora los guards son **funciones simples**, más ligeras y fáciles de testear.

Abre `src/app/core/guards/auth.guard.ts` y reemplaza con:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional — Angular 21 estándar.
 * Ya no es una clase con @Injectable, es una simple función.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);  // ← inject() en vez de constructor
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // ✅ Puede pasar
  }

  // ❌ No autenticado → redirige al login
  return router.createUrlTree(['/auth/login']);
};
```

**Diferencias clave con el guard anterior:**

| Antes (Clase) | Ahora (Función) |
|---|---|
| `@Injectable({ providedIn: 'root' })` | No necesita decorator |
| `class AuthGuard implements CanActivate` | `const authGuard: CanActivateFn = ...` |
| `constructor(private authService: AuthService)` | `const authService = inject(AuthService)` |
| `canActivate(): boolean` | Arrow function directa |

---

## BLOQUE 3 — Feature Auth: Pantalla de Login (35 min)

### Paso 3.1 — Generar el componente Login (Standalone)

```bash
ng generate component modules/auth/pages/login --skip-tests
```

> [!NOTE]
> En Angular 21, `ng generate component` crea componentes **standalone por defecto**. No necesitas agregar `--standalone` ni crear un módulo separado.
> ⚠️ **Ya no ejecutamos `ng generate module modules/auth`.** No necesitamos `AuthModule`.

### Paso 3.2 — Crear el componente Login (TypeScript)

Abre `src/app/modules/auth/pages/login/login.ts`:

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],  // ← Se importa AQUÍ, no en un módulo
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {

  loginForm!: FormGroup;
  isLoading = signal(false);        // ← signal en vez de propiedad simple
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Construir el formulario con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getter para acceder fácil a los controles del form
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage.set('Credenciales incorrectas. Intenta de nuevo.');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
```

> [!NOTE]
> **Diferencias clave respecto a NgModule:**
> - `ReactiveFormsModule` se importa directamente en `@Component({ imports: [...] })`, no en un módulo padre.
> - El nombre del componente es `Login`, no `LoginComponent` (convención Angular 21).
> - El archivo se llama `login.ts`, no `login.component.ts` (convención Angular 21).
> - `isLoading` y `errorMessage` usan `signal()` para reactividad granular.

### Paso 3.3 — Crear el HTML del Login

Abre `src/app/modules/auth/pages/login/login.html`:

```html
<div class="login-container">
  <div class="login-card">

    <!-- Logo y título -->
    <div class="login-header">
      <div class="logo">🌱</div>
      <h1>Huertas Comunitarias</h1>
      <p>Gestión ODS 2 — Hambre Cero</p>
    </div>

    <!-- Formulario -->
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

      <!-- Campo Email -->
      <div class="form-group">
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          placeholder="correo@ejemplo.com"
          [class.input-error]="f['email'].touched && f['email'].invalid"
        />
        <!-- ✅ Angular 21: @if en vez de *ngIf -->
        @if (f['email'].touched && f['email'].errors?.['required']) {
          <span class="error-text">El correo es obligatorio</span>
        }
        @if (f['email'].touched && f['email'].errors?.['email']) {
          <span class="error-text">Ingresa un correo válido</span>
        }
      </div>

      <!-- Campo Password -->
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          placeholder="Mínimo 6 caracteres"
          [class.input-error]="f['password'].touched && f['password'].invalid"
        />
        @if (f['password'].touched && f['password'].errors?.['required']) {
          <span class="error-text">La contraseña es obligatoria</span>
        }
        @if (f['password'].touched && f['password'].errors?.['minlength']) {
          <span class="error-text">Mínimo 6 caracteres</span>
        }
      </div>

      <!-- Mensaje de error general -->
      @if (errorMessage()) {
        <div class="error-banner">
          ⚠️ {{ errorMessage() }}
        </div>
      }

      <!-- Botón Submit -->
      <button
        type="submit"
        class="btn-login"
        [disabled]="isLoading()"
      >
        @if (!isLoading()) {
          <span>Iniciar Sesión</span>
        } @else {
          <span>Cargando...</span>
        }
      </button>

    </form>
  </div>
</div>
```

> [!IMPORTANT]
> **Angular 21 usa `@if` / `@else` / `@for` en vez de `*ngIf` / `*ngFor`.**
> - Antes: `<span *ngIf="errorMessage">{{ errorMessage }}</span>`
> - Ahora: `@if (errorMessage()) { <span>{{ errorMessage() }}</span> }`
>
> Los signals se llaman como funciones: `errorMessage()` en vez de `errorMessage`.

### Paso 3.4 — Crear los estilos del Login (SCSS)

Abre `src/app/modules/auth/pages/login/login.scss`:

```scss
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #43a047, #66bb6a, #a5d6a7);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;

  .logo {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  h1 {
    font-size: 1.5rem;
    color: #2e7d32;
    margin: 0 0 0.25rem;
    font-weight: 700;
  }

  p {
    color: #757575;
    font-size: 0.875rem;
    margin: 0;
  }
}

.form-group {
  margin-bottom: 1.25rem;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #424242;
    margin-bottom: 0.4rem;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #43a047;
    }

    &.input-error {
      border-color: #e53935;
    }
  }
}

.error-text {
  display: block;
  color: #e53935;
  font-size: 0.75rem;
  margin-top: 0.3rem;
}

.error-banner {
  background: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-align: center;
}

.btn-login {
  width: 100%;
  padding: 0.85rem;
  background: #43a047;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;

  &:hover:not(:disabled) {
    background: #388e3c;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

### Paso 3.5 — Estilos globales

Abre `src/styles.scss` y agrega:

```scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: #f5f5f5;
  color: #212121;
}
```

---

## BLOQUE 4 — Feature Dashboard: Vista Principal (35 min)

### Paso 4.1 — Generar los componentes standalone

```bash
# Página principal del dashboard
ng generate component modules/dashboard/pages/main --skip-tests

# Componentes reutilizables del dashboard
ng generate component modules/dashboard/components/sidebar --skip-tests
ng generate component modules/dashboard/components/header --skip-tests
ng generate component modules/dashboard/components/stats-card --skip-tests
```

> [!NOTE]
> **Ya no ejecutamos `ng generate module modules/dashboard`.** Cada componente es standalone e importa lo que necesita directamente. No necesitamos `DashboardModule` ni `DashboardRoutingModule`.

### Paso 4.2 — Componente Sidebar

**`sidebar.ts`:**

```typescript
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

  // ✅ Angular 21: output() en vez de @Output() + EventEmitter
  menuSelected = output<string>();

  menuItems = [
    { icon: '📊', label: 'Dashboard', route: 'dashboard' },
    { icon: '🌿', label: 'Mis Huertas', route: 'huertas' },
    { icon: '🌱', label: 'Cultivos', route: 'cultivos' },
    { icon: '🤝', label: 'Voluntarios', route: 'voluntarios' },
    { icon: '📋', label: 'Tareas', route: 'tareas' },
    { icon: '📈', label: 'Reportes', route: 'reportes' },
    { icon: '⚙️', label: 'Configuración', route: 'config' },
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
<aside class="sidebar">
  <div class="sidebar-logo">
    <span class="logo-icon">🌱</span>
    <span class="logo-text">Huertas Comunitarias</span>
  </div>

  <nav class="sidebar-nav">
    <!-- ✅ @for en vez de *ngFor -->
    @for (item of menuItems; track item.route) {
      <a
        class="nav-item"
        [class.active]="activeItem === item.route"
        (click)="selectItem(item.route)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    }
  </nav>
</aside>
```

> [!TIP]
> **`@for` requiere `track`** — es obligatorio. Esto reemplaza `trackBy` de `*ngFor` y ayuda a Angular a optimizar el rendering. Usamos `track item.route` porque es un identificador único para cada elemento del menú.

**`sidebar.scss`:**

```scss
.sidebar {
  width: 220px;
  height: 100vh;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem;
  background: #43a047;
  color: white;

  .logo-icon { font-size: 1.5rem; }
  .logo-text { font-weight: 700; font-size: 0.95rem; }
}

.sidebar-nav {
  padding: 0.75rem 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1.25rem;
  cursor: pointer;
  color: #616161;
  font-size: 0.9rem;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    background: #f1f8e9;
    color: #2e7d32;
  }

  &.active {
    background: #e8f5e9;
    color: #2e7d32;
    font-weight: 600;
    border-left: 3px solid #43a047;
  }
}
```

### Paso 4.3 — Componente Header

**`header.ts`:**

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  // ✅ Angular 21: inject() en vez de inyección por constructor
  private authService = inject(AuthService);

  // ✅ Accedemos al signal directamente, no necesitamos subscribe
  user = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
  }
}
```

> [!NOTE]
> **Observa lo simplificado que es con Signals:**
> - No hay `ngOnInit`, ni `subscribe()`, ni `OnDestroy` para limpiar suscripciones.
> - `this.authService.currentUser` es un signal — el template lo llama como `user()` y se actualiza automáticamente.

**`header.html`:**

```html
<header class="header">
  <h2 class="header-title">Dashboard Principal: Gestión ODS 2</h2>

  <div class="header-actions">
    <button class="btn-icon" title="Notificaciones">🔔</button>
    @if (user()) {
      <div class="user-info">
        <div class="user-avatar">{{ user()!.nombre.charAt(0) }}</div>
        <div class="user-details">
          <span class="user-name">{{ user()!.nombre }}</span>
          <span class="user-role">{{ user()!.rol }}</span>
        </div>
        <button class="btn-logout" (click)="logout()" title="Cerrar sesión">🚪</button>
      </div>
    }
  </div>
</header>
```

**`header.scss`:**

```scss
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212121;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover { background: #f5f5f5; }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #43a047;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  .user-name { font-weight: 600; font-size: 0.85rem; }
  .user-role { font-size: 0.75rem; color: #757575; }
}

.btn-logout {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 6px;

  &:hover { background: #ffebee; }
}
```

### Paso 4.4 — Componente StatsCard (reutilizable)

**`stats-card.ts`:**

```typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.scss'
})
export class StatsCard {
  // ✅ Angular 21: input() en vez de @Input()
  title = input('');
  value = input<string | number>(0);
  icon = input('');
}
```

> [!NOTE]
> **`input()` reemplaza a `@Input()`** — Es type-safe, inmutable por defecto, y se integra con el sistema de Signals. En el template accedes con `title()`, `value()`, `icon()`.

**`stats-card.html`:**

```html
<div class="stats-card">
  <div class="stats-icon">{{ icon() }}</div>
  <div class="stats-info">
    <span class="stats-label">{{ title() }}</span>
    <span class="stats-value">{{ value() }}</span>
  </div>
</div>
```

**`stats-card.scss`:**

```scss
.stats-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.stats-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5e9;
  border-radius: 12px;
}

.stats-info {
  display: flex;
  flex-direction: column;

  .stats-label {
    font-size: 0.8rem;
    color: #757575;
  }

  .stats-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #2e7d32;
  }
}
```

### Paso 4.5 — Página Principal del Dashboard

**`main.ts`:**

```typescript
import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Header } from '../../components/header/header';
import { StatsCard } from '../../components/stats-card/stats-card';

@Component({
  selector: 'app-main',
  // ✅ Standalone: importamos los componentes que usamos directamente aquí
  imports: [Sidebar, Header, StatsCard],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main {

  stats = [
    { title: 'Total Huertas Activas', value: 5, icon: '🌿' },
    { title: 'Cosechas Próximas', value: 3, icon: '🌾' },
    { title: 'Voluntarios Hoy', value: 12, icon: '🤝' },
  ];

  tareas = [
    { tarea: 'Riego Diario', asignado: 'Ana R.', fecha: 'Hoy', estado: 'Pendiente' },
    { tarea: 'Siembra Lechuga', asignado: 'Juan P.', fecha: '14 Mayo', estado: 'En Proceso' },
  ];

  cultivos = [
    { nombre: 'Tomate Cherry', estado: 'Fruición', color: '#e53935' },
    { nombre: 'Zanahoria', estado: 'Crecimiento', color: '#fb8c00' },
    { nombre: 'Acelga', estado: 'Lista para cosechar', color: '#43a047' },
  ];
}
```

> [!IMPORTANT]
> **Esto es la clave de Standalone:** El componente `Main` importa `Sidebar`, `Header` y `StatsCard` directamente en su decorator. No hay un módulo intermediario. Cada componente declara exactamente lo que necesita.

**`main.html`:**

```html
<div class="dashboard-layout">
  <!-- Sidebar -->
  <app-sidebar />

  <!-- Contenido principal -->
  <div class="dashboard-content">
    <!-- Header -->
    <app-header />

    <!-- Cuerpo del dashboard -->
    <main class="dashboard-body">

      <!-- Resumen Mensual -->
      <section class="section-title">Resumen Mensual</section>
      <div class="stats-grid">
        @for (stat of stats; track stat.title) {
          <app-stats-card
            [title]="stat.title"
            [value]="stat.value"
            [icon]="stat.icon"
          />
        }
      </div>

      <!-- Grid de widgets -->
      <div class="widgets-grid">

        <!-- Tareas Prioritarias -->
        <div class="widget-card">
          <h3>Tareas Prioritarias</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Asignado A</th>
                <th>Fecha Límite</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tareas; track t.tarea) {
                <tr>
                  <td>{{ t.tarea }}</td>
                  <td>{{ t.asignado }}</td>
                  <td>{{ t.fecha }}</td>
                  <td>
                    <span class="badge" [class]="'badge-' + t.estado.toLowerCase().replace(' ', '-')">
                      {{ t.estado }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Estado de Cultivos -->
        <div class="widget-card">
          <h3>Estado de Cultivos</h3>
          <div class="cultivo-list">
            @for (c of cultivos; track c.nombre) {
              <div class="cultivo-item">
                <div class="cultivo-info">
                  <strong>{{ c.nombre }}</strong>
                  <small>Estado: {{ c.estado }}</small>
                </div>
                <span class="badge" [style.background]="c.color" style="color: white">
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

> [!TIP]
> **Observa la sintaxis de los tags:** `<app-sidebar />` — Angular 21 soporta **self-closing tags** para componentes sin contenido hijo. Es más limpio que `<app-sidebar></app-sidebar>`.

**`main.scss`:**

```scss
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-content {
  flex: 1;
  margin-left: 220px; // Ancho del sidebar
  display: flex;
  flex-direction: column;
}

.dashboard-body {
  padding: 1.5rem;
  flex: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #424242;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.widget-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: #424242;
    margin-bottom: 1rem;
  }
}

// Tabla de datos
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  th {
    text-align: left;
    padding: 0.6rem 0.5rem;
    color: #757575;
    font-weight: 600;
    border-bottom: 2px solid #e0e0e0;
  }

  td {
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid #f0f0f0;
    color: #424242;
  }
}

// Badges de estado
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-pendiente {
  background: #fff3e0;
  color: #e65100;
}

.badge-en-proceso {
  background: #e3f2fd;
  color: #1565c0;
}

// Lista de cultivos
.cultivo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cultivo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem;
  border-radius: 8px;
  background: #fafafa;

  .cultivo-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    strong { font-size: 0.9rem; color: #212121; }
    small { font-size: 0.75rem; color: #757575; }
  }
}
```

---

## BLOQUE 5 — Routing Principal y Pruebas (15 min)

### Paso 5.1 — Configurar las rutas con Lazy Loading (por componente)

Abre `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    // ✅ loadComponent en vez de loadChildren + módulo
    loadComponent: () =>
      import('./modules/auth/pages/login/login').then(c => c.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./modules/dashboard/pages/main/main').then(c => c.Main),
    canActivate: [authGuard]  // ← Guard funcional (minúscula, es una función)
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
```

> [!IMPORTANT]
> **`loadComponent` reemplaza a `loadChildren`.**
> - Antes: `loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)`
> - Ahora: `loadComponent: () => import('./modules/auth/pages/login/login').then(c => c.Login)`
>
> **Ya no hay módulos intermediarios.** Cada componente se carga directamente con lazy loading.

**Diferencias clave en el routing:**

| Antes (NgModule) | Ahora (Standalone) |
|---|---|
| `app-routing.module.ts` con `@NgModule` | `app.routes.ts` — simple array exportado |
| `RouterModule.forRoot(routes)` | `provideRouter(routes)` en `app.config.ts` |
| `loadChildren` → carga un módulo completo | `loadComponent` → carga un componente directamente |
| `canActivate: [AuthGuard]` (clase) | `canActivate: [authGuard]` (función) |

### Paso 5.2 — Configurar SSR (rutas del servidor)

Abre `src/app/app.routes.server.ts` y asegúrate de que tenga:

```typescript
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
```

### Paso 5.3 — Limpiar el template del componente raíz

Abre `src/app/app.html` y reemplaza TODO el contenido con:

```html
<router-outlet />
```

### Paso 5.4 — Levantar la aplicación

```bash
ng serve
```

Abre el navegador en `http://localhost:4200`

### Paso 5.5 — Verificar el flujo completo

| # | Prueba | Resultado Esperado |
|---|--------|--------------------|
| 1 | Ir a `localhost:4200` | Redirige a `/auth/login` |
| 2 | Ir a `localhost:4200/dashboard` sin login | Redirige a `/auth/login` (authGuard bloquea) |
| 3 | Ingresar email y password válidos | Botón muestra "Cargando...", luego redirige a `/dashboard` |
| 4 | Ver el Dashboard | Se muestra sidebar, header con usuario, stats y widgets |
| 5 | Hacer clic en botón de logout (🚪) | Redirige a `/auth/login` |

---

## 📁 Resumen de Archivos Creados

```
src/app/
├── core/                                           ← Solo carpetas, SIN .module.ts
│   ├── guards/
│   │   └── auth.guard.ts                           ← Guard FUNCIONAL (función)
│   ├── interceptors/                               ← (vacío, para próxima clase)
│   ├── models/
│   │   └── user.model.ts                           ← Interfaces TypeScript
│   └── services/
│       └── auth.service.ts                         ← Servicio con Signals
├── modules/
│   ├── auth/                                       ← SIN auth.module.ts
│   │   └── pages/login/
│   │       ├── login.ts                            ← Componente standalone
│   │       ├── login.html                          ← Template con @if/@for
│   │       └── login.scss                          ← Estilos
│   └── dashboard/                                  ← SIN dashboard.module.ts
│       ├── components/
│       │   ├── sidebar/                            ← Componente standalone
│       │   ├── header/                             ← Componente standalone
│       │   └── stats-card/                         ← Componente standalone con input()
│       └── pages/main/
│           ├── main.ts                             ← Importa componentes directamente
│           ├── main.html                           ← Template con @for y self-closing tags
│           └── main.scss                           ← Estilos del dashboard
├── shared/
│   └── components/                                 ← (vacío, para componentes comunes)
├── app.ts                                          ← Componente raíz standalone
├── app.html                                        ← Solo <router-outlet />
├── app.scss                                        ← Estilos del componente raíz
├── app.config.ts                                   ← ⭐ Reemplaza a AppModule
├── app.config.server.ts                            ← Config SSR
├── app.routes.ts                                   ← ⭐ Rutas con loadComponent
└── app.routes.server.ts                            ← Rutas SSR
```

---

## 🎯 Conceptos Clave — Angular 21 Standalone

| Concepto | Dónde se aplicó | Diferencia con NgModule |
|----------|-----------------|------------------------|
| **Standalone Components** | Todos los componentes | No necesitan `declarations` en un módulo |
| **`app.config.ts`** | Configuración global | Reemplaza a `AppModule` |
| **`loadComponent`** | `app.routes.ts` | Reemplaza `loadChildren` + módulos |
| **Guard Funcional** | `authGuard` como función | Reemplaza clase `AuthGuard` |
| **Signals** | `AuthService`, `Login` | Reemplaza `BehaviorSubject` y propiedades |
| **`input()` / `output()`** | `StatsCard`, `Sidebar` | Reemplaza `@Input()` / `@Output()` |
| **`inject()`** | `Header`, `authGuard` | Alternativa a inyección por constructor |
| **`@if` / `@for`** | Todos los templates | Reemplaza `*ngIf` / `*ngFor` |
| **Reactive Forms** | Login con `FormBuilder` | Se importa en `@Component`, no en módulo |
| **Self-closing tags** | `<app-sidebar />` | Sintaxis más limpia |

---

## 🔄 Migración Rápida — Cheat Sheet

Si vienes de un proyecto con NgModule, aquí tienes las equivalencias:

```typescript
// ❌ ANTES (NgModule)
@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, ReactiveFormsModule],
})
export class AuthModule { }

// ✅ AHORA (Standalone)
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],  // ← Directo en el componente
  templateUrl: './login.html',
})
export class Login { }
```

```typescript
// ❌ ANTES (Guard con clase)
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  canActivate(): boolean { ... }
}

// ✅ AHORA (Guard funcional)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
```

```typescript
// ❌ ANTES (BehaviorSubject)
private currentUser$ = new BehaviorSubject<User | null>(null);
// Template: {{ currentUser$ | async }}

// ✅ AHORA (Signal)
private currentUser = signal<User | null>(null);
// Template: {{ currentUser() }}
```

```html
<!-- ❌ ANTES (*ngIf / *ngFor) -->
<div *ngIf="isLoading">Cargando...</div>
<div *ngFor="let item of items">{{ item }}</div>

<!-- ✅ AHORA (@if / @for) -->
@if (isLoading()) { <div>Cargando...</div> }
@for (item of items; track item) { <div>{{ item }}</div> }
```

---

> [!TIP]
> **Para la próxima clase:** Conectar el `AuthService` con un backend real usando `provideHttpClient()` en `app.config.ts` y crear un **interceptor funcional** con `withInterceptors()` para enviar el JWT en cada request automáticamente.
