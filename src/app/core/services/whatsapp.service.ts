import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IWhatsappStatus, IConexionResponse } from '../models/whatsapp-status.model';

@Injectable({
  providedIn: 'root',
})
export class WhatsappService {
  private apiUrl = `${environment.apiUrl}/whatsapp`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el estado de todas las instancias de WhatsApp
   */
  getAllStatus(): Observable<IWhatsappStatus[]> {
    return this.http.get<IWhatsappStatus[]>(`${this.apiUrl}/status`);
  }

  /**
   * Obtiene el estado de una instancia especifica
   */
  getStatus(puntoId: number): Observable<IWhatsappStatus> {
    return this.http.get<IWhatsappStatus>(`${this.apiUrl}/status/${puntoId}`);
  }

  /**
   * Inicia la conexion de WhatsApp para un punto
   */
  connect(puntoId: number): Observable<IConexionResponse> {
    return this.http.post<IConexionResponse>(
      `${this.apiUrl}/connect/${puntoId}`,
      {},
    );
  }

  /**
   * Desconecta WhatsApp de un punto
   */
  disconnect(puntoId: number): Observable<IConexionResponse> {
    return this.http.post<IConexionResponse>(
      `${this.apiUrl}/disconnect/${puntoId}`,
      {},
    );
  }

  /**
   * Obtiene el QR actual o solicita uno nuevo
   */
  getQr(puntoId: number): Observable<IConexionResponse> {
    return this.http.get<IConexionResponse>(`${this.apiUrl}/qr/${puntoId}`);
  }

  /**
   * Envia un mensaje a traves de WhatsApp
   */
  sendMessage(
    puntoId: number,
    telefono: string,
    contenido: string,
  ): Observable<{ success: boolean; mensaje: string; messageId?: string }> {
    return this.http.post<{ success: boolean; mensaje: string; messageId?: string }>(
      `${this.apiUrl}/send`,
      {
        punto_id: puntoId,
        telefono,
        contenido,
      },
    );
  }
}
