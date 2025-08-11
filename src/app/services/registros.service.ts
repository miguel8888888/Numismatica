import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrosService {
  private apiUrl = 'https://catalogo-back.vercel.app/api/';

  constructor(private http: HttpClient) {}

  obtenerRegistrosPaises(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'paises/paises-select');
  }
  obtenerRegistrosBilletes(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'billetes/billetes-select-jPaises');
  }
}
