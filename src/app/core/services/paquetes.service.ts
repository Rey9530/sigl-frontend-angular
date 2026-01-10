import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  IPaquete,
  IPaqueteDetalle,
  IPaqueteRastreo,
  ICreatePaquete,
  IUpdatePaquete,
  IUpdateEstado,
  IPaquetesParams,
  IPaginatedPaquetes,
  IPaqueteEstadisticas
} from '../models/paquete.model';

@Injectable({
  providedIn: 'root'
})
export class PaquetesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/paquetes`;

  /**
   * Obtiene lista de paquetes con filtros y paginacion
   */
  getAll(params?: IPaquetesParams): Observable<IPaquete[]> {
    let httpParams = new HttpParams();

    if (params?.codigo_rastreo) {
      httpParams = httpParams.set('codigo_rastreo', params.codigo_rastreo);
    }
    if (params?.remitente_telefono) {
      httpParams = httpParams.set('remitente_telefono', params.remitente_telefono);
    }
    if (params?.destinatario_telefono) {
      httpParams = httpParams.set('destinatario_telefono', params.destinatario_telefono);
    }
    if (params?.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }
    if (params?.punto_origen_id) {
      httpParams = httpParams.set('punto_origen_id', params.punto_origen_id.toString());
    }
    if (params?.punto_destino_id) {
      httpParams = httpParams.set('punto_destino_id', params.punto_destino_id.toString());
    }
    if (params?.pagina) {
      httpParams = httpParams.set('pagina', params.pagina.toString());
    }
    if (params?.limite) {
      httpParams = httpParams.set('limite', params.limite.toString());
    }

    return this.http.get<IPaginatedPaquetes>(this.baseUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  /**
   * Obtiene lista paginada completa con metadata
   */
  getAllPaginated(params?: IPaquetesParams): Observable<IPaginatedPaquetes> {
    let httpParams = new HttpParams();

    if (params?.codigo_rastreo) {
      httpParams = httpParams.set('codigo_rastreo', params.codigo_rastreo);
    }
    if (params?.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }
    if (params?.punto_origen_id) {
      httpParams = httpParams.set('punto_origen_id', params.punto_origen_id.toString());
    }
    if (params?.punto_destino_id) {
      httpParams = httpParams.set('punto_destino_id', params.punto_destino_id.toString());
    }
    if (params?.pagina) {
      httpParams = httpParams.set('pagina', params.pagina.toString());
    }
    if (params?.limite) {
      httpParams = httpParams.set('limite', params.limite.toString());
    }

    return this.http.get<IPaginatedPaquetes>(this.baseUrl, { params: httpParams });
  }

  /**
   * Obtiene un paquete por ID con detalle completo
   */
  getById(id: number): Observable<IPaqueteDetalle> {
    return this.http.get<IPaqueteDetalle>(`${this.baseUrl}/${id}`);
  }

  /**
   * Rastrear paquete por codigo (endpoint publico)
   */
  rastrear(codigo: string): Observable<IPaqueteRastreo> {
    return this.http.get<IPaqueteRastreo>(`${this.baseUrl}/rastreo/${codigo}`);
  }

  /**
   * Crea un nuevo paquete
   */
  crear(data: ICreatePaquete): Observable<IPaquete> {
    return this.http.post<IPaquete>(this.baseUrl, data);
  }

  /**
   * Actualiza datos de un paquete
   */
  actualizar(id: number, data: IUpdatePaquete): Observable<IPaquete> {
    return this.http.put<IPaquete>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Cambia el estado de un paquete
   */
  cambiarEstado(id: number, data: IUpdateEstado): Observable<IPaquete> {
    return this.http.patch<IPaquete>(`${this.baseUrl}/${id}/estado`, data);
  }

  /**
   * Obtiene estadisticas de paquetes
   */
  getEstadisticas(puntoId?: number): Observable<IPaqueteEstadisticas> {
    let httpParams = new HttpParams();
    if (puntoId) {
      httpParams = httpParams.set('punto_id', puntoId.toString());
    }
    return this.http.get<IPaqueteEstadisticas>(`${this.baseUrl}/estadisticas`, { params: httpParams });
  }
}
