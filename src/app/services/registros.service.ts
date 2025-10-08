import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


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

  obtenerRegistrosBilletes(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'billetes/');
  }

  // Obtener billetes con filtros y paginación
  obtenerBilletes(params?: any): Observable<any> {
    let url = this.apiUrl + 'billetes/';
    if (params) {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key].toString());
        }
      });
      if (queryParams.toString()) {
        url += '?' + queryParams.toString();
      }
    }
    return this.http.get<any>(url);
  }

  // Crear billete
  crearBillete(billete: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'billetes/', billete);
  }

  // Actualizar billete
  actualizarBillete(id: number, billete: any): Observable<any> {
    return this.http.put<any>(this.apiUrl + `billetes/${id}`, billete);
  }

  // Eliminar billete
  eliminarBillete(id: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl + `billetes/${id}`);
  }

  // Obtener billete por ID
  obtenerBilletePorId(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + `billetes/${id}`);
  }

  // Toggle destacado (PATCH - más eficiente)
  toggleDestacado(id: number, destacado: boolean): Observable<any> {
    return this.http.patch<any>(this.apiUrl + `billetes/${id}/destacado`, { destacado });
  }

  // Toggle vendido (PATCH - más eficiente)
  toggleVendido(id: number, vendido: boolean): Observable<any> {
    return this.http.patch<any>(this.apiUrl + `billetes/${id}/vendido`, { vendido });
  }

  // Obtener estadísticas (endpoint correcto según v1.3.0)
  obtenerEstadisticas(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'billetes/stats');
  }

  //CARACTERÍSTICAS

  // Obtener características (endpoint actualizado según v1.3.0)
  obtenerCaracteristicas(activo: boolean = true): Observable<any> {
    const params = activo ? '?activo=true' : '';
    return this.http.get<any>(this.apiUrl + 'billetes/caracteristicas/' + params);
  }

  // Crear característica
  crearCaracteristica(caracteristica: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'billetes/caracteristicas/', caracteristica);
  }

  // Actualizar característica
  actualizarCaracteristica(id: number, caracteristica: any): Observable<any> {
    return this.http.put<any>(this.apiUrl + `billetes/caracteristicas/${id}`, caracteristica);
  }

  // Eliminar característica
  eliminarCaracteristica(id: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl + `billetes/caracteristicas/${id}`);
  }

  //USUARIOS

  // Obtener perfil del usuario (nuevo endpoint)
  obtenerPerfilUsuario(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'users/me');
  }

  //PAISES

  // prueba sin cache
  obtenerRegistrosPaises(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'paises/');
  }

  crearRegistroPais(pais: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'paises/', pais);
  }

  // CARGAR IMAGENES
  subirImagen(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'upload/', formData);
  }
}
