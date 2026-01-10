import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  IRecepcion,
  IRecepcionEstadisticas,
  IUpdateRecepcion,
  IConvertirPaqueteDto,
  EstadoRecepcion,
  IPaginatedResponse
} from '../models/recepcion.model';

export interface IPaqueteCreado {
  id_paquete: number;
  codigo_rastreo: string;
  estado: string;
  creado_en: string;
}

export interface RecepcionesParams {
  estado?: EstadoRecepcion;
  punto_servicio_id?: number;
  limite?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecepcionesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/recepciones`;

  /**
   * Obtiene lista de recepciones con filtros opcionales
   */
  getAll(params?: RecepcionesParams): Observable<IRecepcion[]> {
    let httpParams = new HttpParams();

    if (params?.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }
    if (params?.punto_servicio_id) {
      httpParams = httpParams.set('punto_servicio_id', params.punto_servicio_id.toString());
    }
    if (params?.limite) {
      httpParams = httpParams.set('limite', params.limite.toString());
    }
    if (params?.offset) {
      httpParams = httpParams.set('pagina', ((params.offset / (params.limite || 20)) + 1).toString());
    }

    return this.http.get<IPaginatedResponse<IRecepcion>>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  /**
   * Obtiene recepciones pendientes de revision
   */
  getPendientes(limite?: number): Observable<IRecepcion[]> {
    let httpParams = new HttpParams();
    if (limite) {
      httpParams = httpParams.set('limite', limite.toString());
    }
    return this.http.get<IPaginatedResponse<IRecepcion>>(`${this.baseUrl}/pendientes`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  /**
   * Obtiene una recepcion por ID
   */
  getById(id: number): Observable<IRecepcion> {
    return this.http.get<IRecepcion>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva recepcion subiendo imagen
   */
  crear(imagen: File, puntoServicioId: number, notas?: string): Observable<IRecepcion> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    formData.append('punto_servicio_id', puntoServicioId.toString());
    if (notas) {
      formData.append('notas', notas);
    }
    return this.http.post<IRecepcion>(this.baseUrl, formData);
  }

  /**
   * Actualiza campos de una recepcion
   */
  actualizar(id: number, data: IUpdateRecepcion): Observable<IRecepcion> {
    return this.http.put<IRecepcion>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Convierte una recepcion en paquete
   */
  convertirAPaquete(id: number, data: IConvertirPaqueteDto): Observable<IPaqueteCreado> {
    return this.http.post<IPaqueteCreado>(`${this.baseUrl}/${id}/convertir`, data);
  }

  /**
   * Descarta una recepcion
   */
  descartar(id: number, motivo: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      body: { motivo }
    });
  }

  /**
   * Obtiene estadisticas de recepciones
   */
  getEstadisticas(): Observable<IRecepcionEstadisticas> {
    return this.http.get<IRecepcionEstadisticas>(`${this.baseUrl}/estadisticas`);
  }
}
