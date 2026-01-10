import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);

  /**
   * Observable para estado de conexion
   */
  get isConnected$(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  /**
   * Obtiene la URL base para WebSocket (sin /api)
   */
  private getBaseUrl(): string {
    // Quitar /api del apiUrl para obtener base
    return environment.apiUrl.replace('/api', '');
  }

  /**
   * Conecta al namespace de recepciones
   */
  conectarRecepciones(): void {
    if (this.socket?.connected) {
      return;
    }

    const baseUrl = this.getBaseUrl();
    this.socket = io(`${baseUrl}/recepciones`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('[WebSocket] Conectado a recepciones');
      this.connectionStatus.next(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Desconectado:', reason);
      this.connectionStatus.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Error de conexion:', error.message);
      this.connectionStatus.next(false);
    });
  }

  /**
   * Desconecta del WebSocket
   */
  desconectar(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus.next(false);
    }
  }

  /**
   * Escucha un evento especifico
   */
  escuchar<T>(evento: string): Observable<T> {
    const subject = new Subject<T>();

    if (this.socket) {
      this.socket.on(evento, (data: T) => {
        subject.next(data);
      });
    }

    return subject.asObservable();
  }

  /**
   * Escucha nueva recepcion para un punto especifico
   */
  escucharNuevaRecepcion<T>(puntoId: number): Observable<T> {
    return this.escuchar<T>(`punto:${puntoId}:nueva`);
  }

  /**
   * Escucha recepcion actualizada para un punto especifico
   */
  escucharRecepcionActualizada<T>(puntoId: number): Observable<T> {
    return this.escuchar<T>(`punto:${puntoId}:actualizada`);
  }

  /**
   * Escucha recepcion convertida para un punto especifico
   */
  escucharRecepcionConvertida<T>(puntoId: number): Observable<T> {
    return this.escuchar<T>(`punto:${puntoId}:convertida`);
  }

  /**
   * Escucha recepcion descartada para un punto especifico
   */
  escucharRecepcionDescartada<T>(puntoId: number): Observable<T> {
    return this.escuchar<T>(`punto:${puntoId}:descartada`);
  }

  /**
   * Deja de escuchar un evento especifico
   */
  dejarDeEscuchar(evento: string): void {
    if (this.socket) {
      this.socket.off(evento);
    }
  }

  /**
   * Limpia listeners para un punto especifico
   */
  limpiarListenersPunto(puntoId: number): void {
    this.dejarDeEscuchar(`punto:${puntoId}:nueva`);
    this.dejarDeEscuchar(`punto:${puntoId}:actualizada`);
    this.dejarDeEscuchar(`punto:${puntoId}:convertida`);
    this.dejarDeEscuchar(`punto:${puntoId}:descartada`);
  }
}
