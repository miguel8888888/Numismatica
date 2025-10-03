import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class DebugInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo loggear requests a nuestro API
    if (request.url.includes('fastapi-railway-ihky.onrender.com')) {
      console.log('🚀 HTTP Request DEBUG:', {
        method: request.method,
        url: request.url,
        headers: {
          Authorization: request.headers.get('Authorization'),
          'Content-Type': request.headers.get('Content-Type'),
          allHeaders: request.headers.keys().map(key => `${key}: ${request.headers.get(key)}`)
        },
        body: request.body
      });
    }

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (request.url.includes('fastapi-railway-ihky.onrender.com')) {
            console.log('📥 HTTP Response DEBUG:', {
              url: request.url,
              event: event
            });
          }
        },
        error: (error) => {
          if (request.url.includes('fastapi-railway-ihky.onrender.com')) {
            console.log('❌ HTTP Error DEBUG:', {
              url: request.url,
              status: error.status,
              message: error.message,
              error: error
            });
          }
        }
      })
    );
  }
}