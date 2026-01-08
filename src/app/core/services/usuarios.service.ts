import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IUsuario, ICreateUsuario, IUpdateUsuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  getAll(): Observable<IUsuario[]> {
    return this.http.get<IUsuario[]>(this.baseUrl);
  }

  getById(id: number): Observable<IUsuario> {
    return this.http.get<IUsuario>(`${this.baseUrl}/${id}`);
  }

  create(data: ICreateUsuario): Observable<IUsuario> {
    return this.http.post<IUsuario>(this.baseUrl, data);
  }

  update(id: number, data: IUpdateUsuario): Observable<IUsuario> {
    return this.http.put<IUsuario>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<IUsuario> {
    return this.http.delete<IUsuario>(`${this.baseUrl}/${id}`);
  }

  activate(id: number): Observable<IUsuario> {
    return this.http.patch<IUsuario>(`${this.baseUrl}/${id}/activar`, {});
  }
}
