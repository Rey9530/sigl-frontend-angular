import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InboxWebsocketService implements OnDestroy {
  private socket: Socket | null = null;
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private listeners: Map<string, Subject<any>> = new Map();

  isConnected$ = this.isConnectedSubject.asObservable();

  constructor() {}

  /**
   * Conecta al namespace de inbox
   */
  conectar(): void {
    if (this.socket?.connected) return;

    const url = environment.apiUrl.replace('/api', '');

    this.socket = io(`${url}/inbox`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Conectado a Inbox WebSocket');
      this.isConnectedSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado de Inbox WebSocket');
      this.isConnectedSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexion Inbox WebSocket:', error);
      this.isConnectedSubject.next(false);
    });
  }

  /**
   * Conecta al namespace de WhatsApp
   */
  conectarWhatsApp(): Socket | null {
    const url = environment.apiUrl.replace('/api', '');

    const whatsappSocket = io(`${url}/whatsapp`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    return whatsappSocket;
  }

  /**
   * Desconecta del WebSocket
   */
  desconectar(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  /**
   * Escucha eventos genericos
   */
  escuchar<T>(evento: string): Observable<T> {
    if (!this.listeners.has(evento)) {
      const subject = new Subject<T>();
      this.listeners.set(evento, subject);

      this.socket?.on(evento, (data: T) => {
        subject.next(data);
      });
    }

    return this.listeners.get(evento)!.asObservable();
  }

  /**
   * Escucha nuevos mensajes de un punto
   */
  escucharNuevoMensaje<T>(puntoId: number): Observable<T> {
    return this.escuchar<T>(`punto:${puntoId}:nuevo-mensaje`);
  }

  /**
   * Escucha nuevas conversaciones de un punto
   */
  escucharNuevaConversacion<T>(puntoId: number): Observable<T> {
    return this.escuchar<T>(`punto:${puntoId}:nueva-conversacion`);
  }

  /**
   * Escucha conversaciones actualizadas de un punto
   */
  escucharConversacionActualizada<T>(puntoId: number): Observable<T> {
    return this.escuchar<T>(`punto:${puntoId}:conversacion-actualizada`);
  }

  /**
   * Escucha transferencias a humano de un punto
   */
  escucharTransferenciaHumano<T>(puntoId: number): Observable<T> {
    return this.escuchar<T>(`punto:${puntoId}:transferencia-humano`);
  }

  /**
   * Escucha cambios de estado de WhatsApp de un punto
   */
  escucharEstadoWhatsApp<T>(puntoId: number): Observable<T> {
    return this.escuchar<T>(`punto:${puntoId}:whatsapp-estado`);
  }

  /**
   * Escucha QR codes de un punto
   */
  escucharQrCode<T>(puntoId: number): Observable<T> {
    return this.escuchar<T>(`punto:${puntoId}:qr-code`);
  }

  /**
   * Deja de escuchar un evento
   */
  dejarDeEscuchar(evento: string): void {
    if (this.listeners.has(evento)) {
      this.listeners.get(evento)?.complete();
      this.listeners.delete(evento);
      this.socket?.off(evento);
    }
  }

  /**
   * Limpia todos los listeners de un punto
   */
  limpiarListenersPunto(puntoId: number): void {
    const eventos = [
      `punto:${puntoId}:nuevo-mensaje`,
      `punto:${puntoId}:nueva-conversacion`,
      `punto:${puntoId}:conversacion-actualizada`,
      `punto:${puntoId}:transferencia-humano`,
      `punto:${puntoId}:whatsapp-estado`,
      `punto:${puntoId}:qr-code`,
    ];

    eventos.forEach((evento) => this.dejarDeEscuchar(evento));
  }

  ngOnDestroy(): void {
    this.desconectar();
  }
}
