import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IPunto, IPuntoActivo, ICreatePunto, IUpdatePunto } from '../models/punto.model';

@Injectable({
  providedIn: 'root'
})
export class PuntosService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/puntos`;

  getAll(): Observable<IPunto[]> {
    return this.http.get<IPunto[]>(this.baseUrl);
  }

  getActivos(): Observable<IPuntoActivo[]> {
    return this.http.get<IPuntoActivo[]>(`${this.baseUrl}/activos`);
  }

  getById(id: number): Observable<IPunto> {
    return this.http.get<IPunto>(`${this.baseUrl}/${id}`);
  }

  create(data: ICreatePunto): Observable<IPunto> {
    return this.http.post<IPunto>(this.baseUrl, data);
  }

  update(id: number, data: IUpdatePunto): Observable<IPunto> {
    return this.http.put<IPunto>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<IPunto> {
    return this.http.delete<IPunto>(`${this.baseUrl}/${id}`);
  }

  activate(id: number): Observable<IPunto> {
    return this.http.patch<IPunto>(`${this.baseUrl}/${id}/activar`, {});
  }
}
