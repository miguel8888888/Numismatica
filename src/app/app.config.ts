import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS, HttpInterceptorFn } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { DebugInterceptor } from './interceptors/debug.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          console.log('🚀 INTERCEPTOR FUNCIONAL - Procesando request:', {
            url: req.url,
            method: req.method
          });

          // Si es request a FastAPI, agregar token
          if (req.url.includes('fastapi-railway-ihky.onrender.com')) {
            console.log('🎯 Request a FastAPI detectada!');
            
            // Obtener token desde sessionStorage directamente
            let token: string | null = null;
            if (typeof window !== 'undefined') {
              token = sessionStorage.getItem('numismatica_token') || localStorage.getItem('numismatica_token');
            }
            
            console.log('🔍 Token encontrado:', {
              hasToken: !!token,
              tokenLength: token?.length,
              tokenPreview: token ? token.substring(0, 50) + '...' : 'No token'
            });

            if (token) {
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              console.log('✅ Headers agregados al request FastAPI');
            } else {
              console.log('❌ No se encontró token para request FastAPI');
            }
            
            console.log('📡 Request final con headers:', {
              Authorization: req.headers.get('Authorization'),
              'Content-Type': req.headers.get('Content-Type'),
              url: req.url
            });
          }

          return next(req);
        }
      ])
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DebugInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideClientHydration(withEventReplay())
  ]
};
