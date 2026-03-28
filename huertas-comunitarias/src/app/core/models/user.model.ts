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
