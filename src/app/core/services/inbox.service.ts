import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  IConversacion,
  IConversacionPaginada,
  IMensaje,
  IMensajePaginado,
  IInboxStats,
  EstadoConversacion,
} from '../models/conversacion.model';

@Injectable({
  providedIn: 'root',
})
export class InboxService {
  private apiUrl = `${environment.apiUrl}/inbox`;

  constructor(private http: HttpClient) {}

  // ==================== CONVERSACIONES ====================

  getConversaciones(params?: {
    punto_id?: number;
    estado?: EstadoConversacion;
    telefono_cliente?: string;
    pagina?: number;
    limite?: number;
  }): Observable<IConversacionPaginada> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.punto_id) {
        httpParams = httpParams.set('punto_id', params.punto_id.toString());
      }
      if (params.estado) {
        httpParams = httpParams.set('estado', params.estado);
      }
      if (params.telefono_cliente) {
        httpParams = httpParams.set('telefono_cliente', params.telefono_cliente);
      }
      if (params.pagina) {
        httpParams = httpParams.set('pagina', params.pagina.toString());
      }
      if (params.limite) {
        httpParams = httpParams.set('limite', params.limite.toString());
      }
    }

    return this.http.get<IConversacionPaginada>(`${this.apiUrl}/conversaciones`, {
      params: httpParams,
    });
  }

  getConversacion(id: number): Observable<IConversacion> {
    return this.http.get<IConversacion>(`${this.apiUrl}/conversaciones/${id}`);
  }

  actualizarConversacion(
    id: number,
    data: { estado?: EstadoConversacion; usuario_asignado_id?: number },
  ): Observable<IConversacion> {
    return this.http.patch<IConversacion>(
      `${this.apiUrl}/conversaciones/${id}`,
      data,
    );
  }

  transferirAHumano(id: number): Observable<IConversacion> {
    return this.http.patch<IConversacion>(
      `${this.apiUrl}/conversaciones/${id}/transferir-humano`,
      {},
    );
  }

  transferirABot(id: number): Observable<IConversacion> {
    return this.http.patch<IConversacion>(
      `${this.apiUrl}/conversaciones/${id}/transferir-bot`,
      {},
    );
  }

  // ==================== MENSAJES ====================

  getMensajes(
    conversacionId: number,
    params?: { pagina?: number; limite?: number },
  ): Observable<IMensajePaginado> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pagina) {
        httpParams = httpParams.set('pagina', params.pagina.toString());
      }
      if (params.limite) {
        httpParams = httpParams.set('limite', params.limite.toString());
      }
    }

    return this.http.get<IMensajePaginado>(
      `${this.apiUrl}/conversaciones/${conversacionId}/mensajes`,
      { params: httpParams },
    );
  }

  enviarMensaje(
    conversacionId: number,
    contenido: string,
  ): Observable<{ mensaje: IMensaje; punto_id: number; telefono_cliente: string }> {
    return this.http.post<{
      mensaje: IMensaje;
      punto_id: number;
      telefono_cliente: string;
    }>(`${this.apiUrl}/conversaciones/${conversacionId}/mensajes`, { contenido });
  }

  // ==================== ESTADISTICAS ====================

  getEstadisticas(puntoId?: number): Observable<IInboxStats> {
    const url = puntoId
      ? `${this.apiUrl}/stats/${puntoId}`
      : `${this.apiUrl}/stats`;
    return this.http.get<IInboxStats>(url);
  }
}
