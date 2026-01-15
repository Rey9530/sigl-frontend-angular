import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ICliente,
  IClienteListResponse,
  IClienteEstadisticas,
  IEstadisticasGlobales,
  IHistorialPaquetesResponse,
  IBuscarClientesParams,
  IHistorialPaquetesParams,
  IEditarCliente,
  IRechazarCliente,
  IResetPassword,
  IResetPasswordResponse,
  IClienteOperationResponse,
} from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/clientes`;

  /**
   * Lista clientes con filtros y paginación
   */
  getAll(params?: IBuscarClientesParams): Observable<IClienteListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.busqueda) httpParams = httpParams.set('busqueda', params.busqueda);
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
      if (params.fecha_desde) httpParams = httpParams.set('fecha_desde', params.fecha_desde);
      if (params.fecha_hasta) httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);
      if (params.ordenar_por) httpParams = httpParams.set('ordenar_por', params.ordenar_por);
      if (params.orden) httpParams = httpParams.set('orden', params.orden);
      if (params.pagina) httpParams = httpParams.set('pagina', params.pagina.toString());
      if (params.limite) httpParams = httpParams.set('limite', params.limite.toString());
    }

    return this.http.get<IClienteListResponse>(this.baseUrl, { params: httpParams });
  }

  /**
   * Obtiene un cliente por ID
   */
  getById(id: number): Observable<ICliente> {
    return this.http.get<ICliente>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene estadísticas globales de clientes
   */
  getEstadisticas(): Observable<IEstadisticasGlobales> {
    return this.http.get<IEstadisticasGlobales>(`${this.baseUrl}/estadisticas`);
  }

  /**
   * Obtiene estadísticas de un cliente específico
   */
  getEstadisticasCliente(id: number): Observable<IClienteEstadisticas> {
    return this.http.get<IClienteEstadisticas>(`${this.baseUrl}/${id}/estadisticas`);
  }

  /**
   * Obtiene historial de paquetes de un cliente
   */
  getPaquetesCliente(
    id: number,
    params?: IHistorialPaquetesParams
  ): Observable<IHistorialPaquetesResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
      if (params.fecha_desde) httpParams = httpParams.set('fecha_desde', params.fecha_desde);
      if (params.fecha_hasta) httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);
      if (params.pagina) httpParams = httpParams.set('pagina', params.pagina.toString());
      if (params.limite) httpParams = httpParams.set('limite', params.limite.toString());
    }

    return this.http.get<IHistorialPaquetesResponse>(`${this.baseUrl}/${id}/paquetes`, {
      params: httpParams,
    });
  }

  /**
   * Edita información del cliente
   */
  update(id: number, data: IEditarCliente): Observable<IClienteOperationResponse> {
    return this.http.patch<IClienteOperationResponse>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Aprueba un cliente pendiente
   */
  aprobar(id: number, notas?: string): Observable<IClienteOperationResponse> {
    return this.http.patch<IClienteOperationResponse>(`${this.baseUrl}/${id}/aprobar`, {
      notas,
    });
  }

  /**
   * Rechaza un cliente pendiente
   */
  rechazar(id: number, data: IRechazarCliente): Observable<IClienteOperationResponse> {
    return this.http.patch<IClienteOperationResponse>(`${this.baseUrl}/${id}/rechazar`, data);
  }

  /**
   * Activa un cliente suspendido/rechazado
   */
  activar(id: number): Observable<IClienteOperationResponse> {
    return this.http.patch<IClienteOperationResponse>(`${this.baseUrl}/${id}/activar`, {});
  }

  /**
   * Suspende un cliente activo
   */
  suspender(id: number, motivo?: string): Observable<IClienteOperationResponse> {
    return this.http.patch<IClienteOperationResponse>(`${this.baseUrl}/${id}/suspender`, {
      motivo,
    });
  }

  /**
   * Resetea la contraseña de un cliente
   */
  resetPassword(id: number, data?: IResetPassword): Observable<IResetPasswordResponse> {
    return this.http.post<IResetPasswordResponse>(`${this.baseUrl}/${id}/reset-password`, data || {});
  }
}
