import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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

export interface User {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  pais?: string;
  profile_image?: string | null;
  profile_image_path?: string | null;
  es_administrador?: boolean;
  fecha_creacion?: string;
  role?: string;
}

export interface ProfileImageData {
  profile_image: string;
  profile_image_path: string;
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
    this.clearSession();
    
    console.log('✅ AuthService - Sesión limpiada, redirigiendo...');
    
    // Redirigir al login
    this.router.navigate(['/auth/login']).then(() => {
      console.log('✅ AuthService - Redirección completada');
    });
  }

  private clearSession(): void {
    // Limpiar localStorage/sessionStorage (solo en el navegador)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.userKey);
    }
    
    // Actualizar el subject
    this.currentUserSubject.next(null);
    
    console.log('🧹 Sesión limpiada (tokens y datos eliminados)');
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

    // Verificar si el token ha expirado
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
      
      // Si el token ha expirado, limpiar la sesión
      if (!isValid) {
        console.log('⏰ Token expirado, limpiando sesión...');
        this.clearSession();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error al verificar token:', error);
      // Si hay error parseando el token, limpiar la sesión
      this.clearSession();
      return false;
    }
  }

  getToken(): string | null {
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      return null;
    }
    
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
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      return;
    }
    
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
    // Verificar si estamos en el navegador antes de acceder a localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
      if (userStr && this.isAuthenticated()) {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      }
    }
  }

  // Métodos para gestión de perfil
  updateProfile(profileData: any): Observable<any> {
    console.log('📝 Actualizando perfil del usuario...');
    
    return this.http.put(`${this.apiUrl}auth/perfil/`, profileData).pipe(
      tap((response: any) => {
        console.log('✅ Perfil actualizado exitosamente:', response);
        
        // Actualizar los datos del usuario en el storage y subject
        if (response.user || response) {
          const currentUser = this.getCurrentUser();
          const userData = response.user || response;
          const updatedUser = { ...currentUser, ...userData };
          
          // Actualizar en el storage que esté siendo usado (solo en el navegador)
          if (typeof window !== 'undefined') {
            const userStr = JSON.stringify(updatedUser);
            if (localStorage.getItem(this.userKey)) {
              localStorage.setItem(this.userKey, userStr);
            } else if (sessionStorage.getItem(this.userKey)) {
              sessionStorage.setItem(this.userKey, userStr);
            }
          }
          
          // Actualizar el subject
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  // Método específico para actualizar imagen de perfil
  updateProfileImage(imageData: ProfileImageData | { profile_image: null, profile_image_path: null }): Observable<any> {
    console.log('🖼️ Actualizando imagen de perfil:', imageData);
    
    return this.http.put(`${this.apiUrl}auth/perfil/`, imageData).pipe(
      tap((response: any) => {
        console.log('✅ Imagen de perfil actualizada:', response);
        
        // Actualizar los datos del usuario con la nueva imagen
        if (response.user || response) {
          const currentUser = this.getCurrentUser();
          const userData = response.user || response;
          const updatedUser = { 
            ...currentUser, 
            profile_image: imageData.profile_image,
            profile_image_path: imageData.profile_image_path
          };
          
          // Actualizar en el storage (solo en el navegador)
          if (typeof window !== 'undefined') {
            const userStr = JSON.stringify(updatedUser);
            if (localStorage.getItem(this.userKey)) {
              localStorage.setItem(this.userKey, userStr);
            } else if (sessionStorage.getItem(this.userKey)) {
              sessionStorage.setItem(this.userKey, userStr);
            }
          }
          
          // Actualizar el subject
          this.currentUserSubject.next(updatedUser);
        }
      }),
      catchError((error) => {
        console.error('❌ Error actualizando imagen de perfil:', error);
        return throwError(() => error);
      })
    );
  }

  changePassword(passwordData: { currentPassword: string, newPassword: string }): Observable<any> {
    console.log('🔒 Cambiando contraseña del usuario...', {
      hasCurrentPassword: !!passwordData.currentPassword,
      hasNewPassword: !!passwordData.newPassword,
      currentPasswordLength: passwordData.currentPassword?.length,
      newPasswordLength: passwordData.newPassword?.length
    });
    
    const requestBody = {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      confirm_new_password: passwordData.newPassword  // El backend requiere confirmación
    };
    
    console.log('📡 Enviando request de cambio de contraseña:', {
      url: `${this.apiUrl}auth/cambiar-password/`,
      method: 'PUT',
      body: {
        current_password: '[OCULTA - ' + passwordData.currentPassword?.length + ' caracteres]',
        new_password: '[OCULTA - ' + passwordData.newPassword?.length + ' caracteres]',
        confirm_new_password: '[OCULTA - ' + passwordData.newPassword?.length + ' caracteres]',
        bodyKeys: Object.keys(requestBody)
      }
    });
    
    return this.http.put(`${this.apiUrl}auth/cambiar-password/`, requestBody).pipe(
      tap((response: any) => {
        console.log('✅ Contraseña cambiada exitosamente:', response);
      }),
      catchError((error: any) => {
        console.log('❌ Error al cambiar contraseña:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url
        });
        return throwError(() => error);
      })
    );
    
    // Opción 2: Si existe un endpoint específico, descomenta esto:
    // return this.http.put(`${this.apiUrl}auth/change-password/`, passwordData).pipe(
    //   tap((response: any) => {
    //     console.log('✅ Contraseña cambiada exitosamente:', response);
    //   })
    // );
  }

  getUserProfile(): Observable<any> {
    console.log('👤 Obteniendo datos del perfil del usuario...');
    
    return this.http.get(`${this.apiUrl}auth/perfil/`).pipe(
      tap((response: any) => {
        console.log('✅ Perfil obtenido exitosamente:', response);
        
        // Actualizar los datos del usuario si vienen en la respuesta
        if (response.user || response) {
          const userData = response.user || response;
          const currentUser = this.getCurrentUser();
          const updatedUser = { ...currentUser, ...userData };
          
          // Actualizar en el storage que esté siendo usado (solo en el navegador)
          if (typeof window !== 'undefined') {
            const userStr = JSON.stringify(updatedUser);
            if (localStorage.getItem(this.userKey)) {
              localStorage.setItem(this.userKey, userStr);
            } else if (sessionStorage.getItem(this.userKey)) {
              sessionStorage.setItem(this.userKey, userStr);
            }
          }
          
          // Actualizar el subject
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }
}