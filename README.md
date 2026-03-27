# 🌱 Guía Paso a Paso — Angular: Login y Dashboard
## Aplicación "Huertas Comunitarias" — Gestión ODS 2

**Duración total:** 2 horas  
**Fecha:** 27 de Marzo, 2026  
**Tecnologías:** Angular 17+, TypeScript, SCSS  
**Arquitectura:** Core Architecture  

---

## 📋 Distribución del Tiempo

| Bloque | Actividad | Duración |
|--------|-----------|----------|
| 1 | Crear proyecto Angular + estructura Core | 15 min |
| 2 | Módulo Core (modelos, servicios, guards) | 20 min |
| 3 | Módulo Auth — Login de acceso | 35 min |
| 4 | Módulo Dashboard — Vista principal | 35 min |
| 5 | Routing, pruebas y ajustes finales | 15 min |

---

## 🏗️ Arquitectura Core — ¿Qué es?

```
src/app/
├── core/                    ← Servicios globales, guards, interceptors (se carga UNA vez)
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
├── modules/                 ← Módulos de funcionalidad (lazy loading)
│   ├── auth/
│   │   ├── pages/
│   │   │   └── login/
│   │   └── auth.module.ts
│   └── dashboard/
│       ├── components/
│       ├── pages/
│       │   └── main/
│       └── dashboard.module.ts
├── shared/                  ← Componentes reutilizables, pipes, directivas
│   ├── components/
│   └── shared.module.ts
├── app.component.ts
├── app.module.ts
└── app-routing.module.ts
```

> [!IMPORTANT]
> **Regla de oro:** `core/` se importa SOLO en `AppModule`. `shared/` se importa donde se necesite. Los `modules/` son independientes.

---

## BLOQUE 1 — Crear Proyecto + Estructura Core (15 min)

### Paso 1.1 — Crear el proyecto Angular

Abre tu terminal y ejecuta:

```bash
ng new huertas-comunitarias --routing --style=scss --skip-tests
```

> **¿Qué hace cada flag?**
> - `--routing` → Crea el archivo de rutas automáticamente
> - `--style=scss` → Usa SCSS en vez de CSS plano
> - `--skip-tests` → No genera archivos `.spec.ts` (para ahorrar tiempo en clase)

```bash
cd huertas-comunitarias
```

### Paso 1.2 — Crear la estructura de carpetas

Ejecuta estos comandos **en orden**:

```bash
# 1. Carpetas del Core
mkdir -p src/app/core/guards
mkdir -p src/app/core/interceptors
mkdir -p src/app/core/models
mkdir -p src/app/core/services

# 2. Carpetas de Módulos
mkdir -p src/app/modules/auth/pages/login
mkdir -p src/app/modules/dashboard/components
mkdir -p src/app/modules/dashboard/pages/main

# 3. Carpetas Shared
mkdir -p src/app/shared/components
```

### Paso 1.3 — Generar el CoreModule

```bash
ng generate module core
```

Abre `src/app/core/core.module.ts` y reemplaza con:

```typescript
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class CoreModule {
  // Este constructor IMPIDE que CoreModule se importe más de una vez
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule ya está cargado. Importalo SOLO en AppModule.');
    }
  }
}
```

> [!NOTE]
> El patrón `@Optional() @SkipSelf()` es una buena práctica. Si alguien intenta importar CoreModule en otro módulo que no sea AppModule, Angular lanzará un error claro.

### Paso 1.4 — Importar CoreModule en AppModule

Abre `src/app/app.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule      // ← SOLO aquí
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## BLOQUE 2 — Módulo Core: Modelos, Servicio y Guard (20 min)

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
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // BehaviorSubject guarda el último valor emitido
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

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
    // Simulación: usuario válido
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
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Revisa si hay token al iniciar la app
   */
  private checkStoredToken(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      // En producción: validar token con el backend
      this.currentUserSubject.next({
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
> `BehaviorSubject` es mejor que `Subject` aquí porque siempre mantiene el último valor. Así, cuando un componente se suscribe tarde, igual recibe el estado actual del usuario.

### Paso 2.3 — Crear el AuthGuard

```bash
ng generate guard core/guards/auth --skip-tests
```

Cuando Angular pregunte qué interfaz, selecciona **CanActivate**.

Abre `src/app/core/guards/auth.guard.ts` y reemplaza con:

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return true; // ✅ Puede pasar
    }
    // ❌ No autenticado → redirige al login
    return this.router.createUrlTree(['/auth/login']);
  }
}
```

---

## BLOQUE 3 — Módulo Auth: Pantalla de Login (35 min)

### Paso 3.1 — Generar el módulo Auth con routing

```bash
ng generate module modules/auth --routing
```

### Paso 3.2 — Generar el componente Login

```bash
ng generate component modules/auth/pages/login --skip-tests
```

### Paso 3.3 — Configurar las rutas del AuthModule

Abre `src/app/modules/auth/auth-routing.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
```

### Paso 3.4 — Configurar el AuthModule

Abre `src/app/modules/auth/auth.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,  // ← Para formularios reactivos
    AuthRoutingModule
  ]
})
export class AuthModule { }
```

### Paso 3.5 — Crear el componente Login (TypeScript)

Abre `src/app/modules/auth/pages/login/login.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

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
    // Si el form es inválido, marcar todos los campos como tocados
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Credenciales incorrectas. Intenta de nuevo.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
```

### Paso 3.6 — Crear el HTML del Login

Abre `src/app/modules/auth/pages/login/login.component.html`:

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
        <span class="error-text" *ngIf="f['email'].touched && f['email'].errors?.['required']">
          El correo es obligatorio
        </span>
        <span class="error-text" *ngIf="f['email'].touched && f['email'].errors?.['email']">
          Ingresa un correo válido
        </span>
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
        <span class="error-text" *ngIf="f['password'].touched && f['password'].errors?.['required']">
          La contraseña es obligatoria
        </span>
        <span class="error-text" *ngIf="f['password'].touched && f['password'].errors?.['minlength']">
          Mínimo 6 caracteres
        </span>
      </div>

      <!-- Mensaje de error general -->
      <div class="error-banner" *ngIf="errorMessage">
        ⚠️ {{ errorMessage }}
      </div>

      <!-- Botón Submit -->
      <button
        type="submit"
        class="btn-login"
        [disabled]="isLoading"
      >
        <span *ngIf="!isLoading">Iniciar Sesión</span>
        <span *ngIf="isLoading">Cargando...</span>
      </button>

    </form>
  </div>
</div>
```

### Paso 3.7 — Crear los estilos del Login (SCSS)

Abre `src/app/modules/auth/pages/login/login.component.scss`:

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

### Paso 3.8 — Estilos globales

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

## BLOQUE 4 — Módulo Dashboard: Vista Principal (35 min)

### Paso 4.1 — Generar el módulo Dashboard con routing

```bash
ng generate module modules/dashboard --routing
```

### Paso 4.2 — Generar los componentes necesarios

```bash
# Página principal del dashboard
ng generate component modules/dashboard/pages/main --skip-tests

# Componentes reutilizables del dashboard
ng generate component modules/dashboard/components/sidebar --skip-tests
ng generate component modules/dashboard/components/header --skip-tests
ng generate component modules/dashboard/components/stats-card --skip-tests
```

### Paso 4.3 — Configurar rutas del Dashboard

Abre `src/app/modules/dashboard/dashboard-routing.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
```

### Paso 4.4 — Configurar DashboardModule

Abre `src/app/modules/dashboard/dashboard.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MainComponent } from './pages/main/main.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { StatsCardComponent } from './components/stats-card/stats-card.component';

@NgModule({
  declarations: [
    MainComponent,
    SidebarComponent,
    HeaderComponent,
    StatsCardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
```

### Paso 4.5 — Componente Sidebar

**`sidebar.component.ts`:**

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  @Output() menuSelected = new EventEmitter<string>();

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

**`sidebar.component.html`:**

```html
<aside class="sidebar">
  <div class="sidebar-logo">
    <span class="logo-icon">🌱</span>
    <span class="logo-text">Huertas Comunitarias</span>
  </div>

  <nav class="sidebar-nav">
    <a
      *ngFor="let item of menuItems"
      class="nav-item"
      [class.active]="activeItem === item.route"
      (click)="selectItem(item.route)"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </a>
  </nav>
</aside>
```

**`sidebar.component.scss`:**

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

### Paso 4.6 — Componente Header

**`header.component.ts`:**

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
```

**`header.component.html`:**

```html
<header class="header">
  <h2 class="header-title">Dashboard Principal: Gestión ODS 2</h2>

  <div class="header-actions">
    <button class="btn-icon" title="Notificaciones">🔔</button>
    <div class="user-info" *ngIf="user">
      <div class="user-avatar">{{ user.nombre.charAt(0) }}</div>
      <div class="user-details">
        <span class="user-name">{{ user.nombre }}</span>
        <span class="user-role">{{ user.rol }}</span>
      </div>
      <button class="btn-logout" (click)="logout()" title="Cerrar sesión">🚪</button>
    </div>
  </div>
</header>
```

**`header.component.scss`:**

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

### Paso 4.7 — Componente StatsCard (reutilizable)

**`stats-card.component.ts`:**

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() title = '';
  @Input() value: string | number = 0;
  @Input() icon = '';
}
```

**`stats-card.component.html`:**

```html
<div class="stats-card">
  <div class="stats-icon">{{ icon }}</div>
  <div class="stats-info">
    <span class="stats-label">{{ title }}</span>
    <span class="stats-value">{{ value }}</span>
  </div>
</div>
```

**`stats-card.component.scss`:**

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

### Paso 4.8 — Página Principal del Dashboard

**`main.component.ts`:**

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

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

**`main.component.html`:**

```html
<div class="dashboard-layout">
  <!-- Sidebar -->
  <app-sidebar></app-sidebar>

  <!-- Contenido principal -->
  <div class="dashboard-content">
    <!-- Header -->
    <app-header></app-header>

    <!-- Cuerpo del dashboard -->
    <main class="dashboard-body">

      <!-- Resumen Mensual -->
      <section class="section-title">Resumen Mensual</section>
      <div class="stats-grid">
        <app-stats-card
          *ngFor="let stat of stats"
          [title]="stat.title"
          [value]="stat.value"
          [icon]="stat.icon"
        ></app-stats-card>
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
              <tr *ngFor="let t of tareas">
                <td>{{ t.tarea }}</td>
                <td>{{ t.asignado }}</td>
                <td>{{ t.fecha }}</td>
                <td>
                  <span class="badge" [class]="'badge-' + t.estado.toLowerCase().replace(' ', '-')">
                    {{ t.estado }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estado de Cultivos -->
        <div class="widget-card">
          <h3>Estado de Cultivos</h3>
          <div class="cultivo-list">
            <div class="cultivo-item" *ngFor="let c of cultivos">
              <div class="cultivo-info">
                <strong>{{ c.nombre }}</strong>
                <small>Estado: {{ c.estado }}</small>
              </div>
              <span class="badge" [style.background]="c.color" style="color: white">
                {{ c.estado }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</div>
```

**`main.component.scss`:**

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

### Paso 5.1 — Configurar el Routing Principal con Lazy Loading

Abre `src/app/app-routing.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]  // ← Protegido por el guard
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth'  // ← Cualquier ruta no encontrada → login
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

> [!IMPORTANT]
> **Lazy Loading** significa que Angular NO carga el módulo de Dashboard hasta que el usuario navegue a `/dashboard`. Esto mejora el rendimiento inicial de la app.

### Paso 5.2 — Limpiar el AppComponent

Abre `src/app/app.component.html` y reemplaza TODO el contenido con:

```html
<router-outlet></router-outlet>
```

### Paso 5.3 — Levantar la aplicación

```bash
ng serve
```

Abre el navegador en `http://localhost:4200`

### Paso 5.4 — Verificar el flujo completo

| # | Prueba | Resultado Esperado |
|---|--------|--------------------|
| 1 | Ir a `localhost:4200` | Redirige a `/auth/login` |
| 2 | Ir a `localhost:4200/dashboard` sin login | Redirige a `/auth/login` (AuthGuard bloquea) |
| 3 | Ingresar email y password válidos | Botón muestra "Cargando...", luego redirige a `/dashboard` |
| 4 | Ver el Dashboard | Se muestra sidebar, header con usuario, stats y widgets |
| 5 | Hacer clic en botón de logout (🚪) | Redirige a `/auth/login` |

---

## 📁 Resumen de Archivos Creados

```
src/app/
├── core/
│   ├── core.module.ts                              ← Módulo singleton
│   ├── guards/
│   │   └── auth.guard.ts                           ← Protege rutas
│   ├── models/
│   │   └── user.model.ts                           ← Interfaces
│   └── services/
│       └── auth.service.ts                         ← Lógica de autenticación
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts                          ← Módulo Auth
│   │   ├── auth-routing.module.ts                  ← Rutas Auth
│   │   └── pages/login/
│   │       ├── login.component.ts                  ← Lógica del login
│   │       ├── login.component.html                ← Vista del login
│   │       └── login.component.scss                ← Estilos del login
│   └── dashboard/
│       ├── dashboard.module.ts                     ← Módulo Dashboard
│       ├── dashboard-routing.module.ts             ← Rutas Dashboard
│       ├── components/
│       │   ├── sidebar/                            ← Menú lateral
│       │   ├── header/                             ← Barra superior
│       │   └── stats-card/                         ← Tarjeta de estadísticas
│       └── pages/main/
│           ├── main.component.ts                   ← Lógica principal
│           ├── main.component.html                 ← Vista principal
│           └── main.component.scss                 ← Estilos del dashboard
├── app.module.ts                                   ← Importa CoreModule
├── app-routing.module.ts                           ← Lazy loading + Guard
└── app.component.html                              ← Solo <router-outlet>
```

---

## 🎯 Conceptos Clave Repasados en Clase

| Concepto | Dónde se aplicó |
|----------|----------------|
| **Arquitectura Core** | `CoreModule` con singleton pattern |
| **Lazy Loading** | `loadChildren` en `app-routing.module.ts` |
| **Guards** | `AuthGuard` protege `/dashboard` |
| **Reactive Forms** | `FormBuilder` + `Validators` en Login |
| **BehaviorSubject** | Estado del usuario en `AuthService` |
| **@Input / @Output** | `StatsCardComponent`, `SidebarComponent` |
| **Servicios Inyectables** | `AuthService` con `providedIn: 'root'` |
| **localStorage** | Persistencia del token JWT |

---

> [!TIP]
> **Para la próxima clase:** Conectar el `AuthService` con un backend real usando `HttpClient` y crear un `TokenInterceptor` en `core/interceptors/` para enviar el JWT en cada request automáticamente.
