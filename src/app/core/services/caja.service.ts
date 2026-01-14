import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  IResumenCaja,
  ICierreCaja,
  IRegistroRecaudacion,
  ICajaHistorialParams,
  IPaginatedCierres,
} from '../models/caja.model';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/caja`;

  /**
   * Obtiene resumen de caja por usuario (monitoreo admin)
   */
  getResumen(puntoId?: number): Observable<IResumenCaja[]> {
    let params = new HttpParams();
    if (puntoId) {
      params = params.set('punto_id', puntoId.toString());
    }
    return this.http.get<IResumenCaja[]>(`${this.baseUrl}/resumen`, { params });
  }

  /**
   * Obtiene total de un usuario específico
   */
  getTotalUsuario(
    usuarioId: number,
    puntoId?: number
  ): Observable<{
    total: number;
    precio_producto: number;
    costo_envio: number;
    cantidad_paquetes: number;
  }> {
    let params = new HttpParams();
    if (puntoId) {
      params = params.set('punto_id', puntoId.toString());
    }
    return this.http.get<any>(`${this.baseUrl}/usuario/${usuarioId}/total`, {
      params,
    });
  }

  /**
   * Obtiene paquetes pendientes de un usuario
   */
  getPendientesUsuario(
    usuarioId: number,
    puntoId?: number,
    pagina = 1,
    limite = 20
  ): Observable<{
    data: IRegistroRecaudacion[];
    meta: { total: number; pagina: number; limite: number; totalPaginas: number };
  }> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());
    if (puntoId) {
      params = params.set('punto_id', puntoId.toString());
    }
    return this.http.get<any>(`${this.baseUrl}/usuario/${usuarioId}/pendientes`, {
      params,
    });
  }

  /**
   * Realiza cierre de caja de otro usuario
   */
  realizarCierreUsuario(
    usuarioId: number,
    puntoId: number,
    notas?: string
  ): Observable<ICierreCaja> {
    return this.http.post<ICierreCaja>(
      `${this.baseUrl}/cierre/${usuarioId}?punto_id=${puntoId}`,
      { notas }
    );
  }

  /**
   * Obtiene historial de cierres
   */
  getHistorialCierres(params: ICajaHistorialParams): Observable<IPaginatedCierres> {
    let httpParams = new HttpParams();

    if (params.usuario_id) {
      httpParams = httpParams.set('usuario_id', params.usuario_id.toString());
    }
    if (params.punto_id) {
      httpParams = httpParams.set('punto_id', params.punto_id.toString());
    }
    if (params.fecha_desde) {
      httpParams = httpParams.set('fecha_desde', params.fecha_desde);
    }
    if (params.fecha_hasta) {
      httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);
    }
    if (params.pagina) {
      httpParams = httpParams.set('pagina', params.pagina.toString());
    }
    if (params.limite) {
      httpParams = httpParams.set('limite', params.limite.toString());
    }

    return this.http.get<IPaginatedCierres>(`${this.baseUrl}/historial`, {
      params: httpParams,
    });
  }

  /**
   * Obtiene detalle de un cierre específico
   */
  getDetalleCierre(cierreId: number): Observable<ICierreCaja & { registros: IRegistroRecaudacion[] }> {
    return this.http.get<any>(`${this.baseUrl}/historial/${cierreId}`);
  }
}
