import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    role: string;
  };
  // Propiedades opcionales para compatibilidad
  success?: boolean;
  token?: string;
  message?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.fastAPI}`;
  private tokenKey = 'numismatica_token';
  private userKey = 'numismatica_user';
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verificar si hay un usuario guardado al inicializar
    this.loadStoredUser();
    
    // Test de conectividad
    this.testConnection();
  }
  
  private testConnection(): void {
    console.log('🔍 Probando conectividad a:', this.apiUrl);
    
    this.http.get(`${this.apiUrl}`).subscribe({
      next: (response) => {
        console.log('✅ Servidor accesible:', response);
        
        // Probar endpoint específico de login con OPTIONS
        this.http.options(`${this.apiUrl}auth/login/`).subscribe({
          next: (optionsResponse) => {
            console.log('✅ Endpoint auth/login/ accesible via OPTIONS:', optionsResponse);
          },
          error: (optionsError) => {
            console.log('⚠️ OPTIONS no disponible (normal):', optionsError.status);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error de conectividad:', error);
      }
    });
  }

  login(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    const loginData = { email, password };
    
    console.log('🔐 Intentando login con:', { 
      email, 
      apiUrl: `${this.apiUrl}auth/login/`,
      fullUrl: `${this.apiUrl}auth/login/`,
      loginData 
    });
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Primero intentamos con la URL principal
    return this.http.post<LoginResponse>(`${this.apiUrl}auth/login/`, loginData, { headers }).pipe(
      tap(response => {
        console.log('✅ Respuesta del login:', response);
        // Adaptar la respuesta del backend al formato esperado
        if (response.access_token && response.user) {
          // Crear un objeto compatible con setSession
          const adaptedResponse = {
            ...response,
            success: true,
            token: response.access_token
          };
          this.setSession(adaptedResponse, rememberMe);
        }
      })
    );
  }

  logout(): void {
    console.log('🚪 AuthService - Iniciando proceso de logout...');
    
    // Limpiar localStorage/sessionStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    
    // Actualizar el subject
    this.currentUserSubject.next(null);
    
    console.log('✅ AuthService - Sesión limpiada, redirigiendo...');
    
    // Redirigir al login
    this.router.navigate(['/auth/login']).then(() => {
      console.log('✅ AuthService - Redirección completada');
    });
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}auth/forgot-password/`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/reset-password/`, { token, new_password: newPassword });
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log('🔍 Verificando autenticación:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenStart: token?.substring(0, 20) + '...'
    });
    
    if (!token) {
      console.log('❌ No hay token disponible');
      return false;
    }

    // Verificar si el token ha expirado (opcional)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // JWT expiry is in seconds
      const isValid = Date.now() < expiry;
      
      console.log('🔍 Token payload:', {
        sub: payload.sub,
        exp: new Date(expiry),
        isValid,
        timeLeft: Math.round((expiry - Date.now()) / 1000 / 60) + ' minutos'
      });
      
      return isValid;
    } catch (error) {
      console.error('❌ Error al verificar token:', error);
      return false;
    }
  }

  getToken(): string | null {
    const localToken = localStorage.getItem(this.tokenKey);
    const sessionToken = sessionStorage.getItem(this.tokenKey);
    const token = localToken || sessionToken;
    
    console.log('🔍 Obteniendo token:', {
      fromLocalStorage: !!localToken,
      fromSessionStorage: !!sessionToken,
      finalToken: !!token
    });
    
    return token;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  private setSession(authResult: LoginResponse & { token?: string }, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Usar access_token o token según lo que esté disponible
    const token = authResult.token || authResult.access_token;
    if (token) {
      storage.setItem(this.tokenKey, token);
      storage.setItem(this.userKey, JSON.stringify(authResult.user));
      
      this.currentUserSubject.next(authResult.user);
      console.log('🔐 Sesión establecida correctamente con token:', token.substring(0, 20) + '...');
    } else {
      console.error('❌ No se encontró token en la respuesta:', authResult);
    }
  }

  private loadStoredUser(): void {
    const userStr = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
    if (userStr && this.isAuthenticated()) {
      const user = JSON.parse(userStr);
      this.currentUserSubject.next(user);
    }
  }
}