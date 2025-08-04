import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrosService {
  private apiUrl = 'https://catalogo-back.vercel.app/api/index';

  constructor(private http: HttpClient) {}

  obtenerRegistros(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
