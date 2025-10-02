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
    
    if (token && this.isAdminRequest(request.url)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
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
    return url.includes('/admin/') || 
           url.includes('/auth/logout') || 
           url.includes('/auth/refresh') ||
           url.includes('/usuarios/') ||
           url.includes('registrar-paises') ||
           url.includes('billetes') && !url.includes('public');
  }
}