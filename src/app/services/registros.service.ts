import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';


export interface Pais {
  id: number;
  pais: string;
  bandera: string;
}
@Injectable({
  providedIn: 'root'
})
export class RegistrosService {
  private apiUrl = `${environment.fastAPI}`;

  constructor(private http: HttpClient) {}

  //BILLETES

  // obtenerRegistrosBilletes(): Observable<any> {
  //   return this.http.get<any>(this.apiUrl + 'billetes/billetes-select-jPaises');
  // }

  //PAISES

  obtenerRegistrosPaises(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'paises');
  }

  crearRegistroPais(pais: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'paises/paises-insert', pais);
  }
}
