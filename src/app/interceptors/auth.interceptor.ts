import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Agregar token JWT a las requests del admin
    const token = this.authService.getToken();
    const isAdminReq = this.isAdminRequest(request.url);
    const isFastApiReq = request.url.includes('fastapi-railway-ihky.onrender.com');
    
    console.log('🔐 Interceptor - Request DETALLADA:', {
      url: request.url,
      isAdminRequest: isAdminReq,
      isFastApiRequest: isFastApiReq,
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? token.substring(0, 50) + '...' : 'No token'
    });
    
    // Si es request a FastAPI Y tenemos token, agregarlo siempre
    if (token && (isAdminReq || isFastApiReq)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Token agregado a la request FastAPI');
    } else if ((isAdminReq || isFastApiReq) && !token) {
      console.log('❌ Request de admin/FastAPI sin token!');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('🔍 Error interceptado:', error);
        
        // Si el token ha expirado o es inválido
        if (error.status === 401 && this.isAdminRequest(request.url)) {
          console.log('🔐 Token expirado, redirigiendo al login');
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
        
        return throwError(() => error);
      })
    );
  }

  private isAdminRequest(url: string): boolean {
    // Verificar si la request es hacia endpoints que requieren autenticación
    const isAdmin = url.includes('/admin/') || 
           url.includes('/auth/logout') || 
           url.includes('/auth/refresh') ||
           url.includes('/auth/perfil') ||
           url.includes('auth/perfil') ||  // Sin barra inicial
           url.includes('/usuarios/') ||
           url.includes('/users/') ||
           url.includes('registrar-paises') ||
           (url.includes('billetes') && !url.includes('public'));
    
    console.log('🔍 Verificando si es request de admin:', {
      url: url,
      isAdminRequest: isAdmin,
      checks: {
        hasAuthPerfil: url.includes('/auth/perfil'),
        hasAuthPerfilNoSlash: url.includes('auth/perfil'),
        fullUrl: url
      }
    });
    
    return isAdmin;
  }
}