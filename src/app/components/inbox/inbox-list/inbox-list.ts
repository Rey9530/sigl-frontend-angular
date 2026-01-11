import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InboxService } from '../../../core/services/inbox.service';
import { PuntosService } from '../../../core/services/puntos.service';
import { InboxWebsocketService } from '../../../core/services/inbox-websocket.service';
import {
  IConversacion,
  IMensaje,
  EstadoConversacion,
  EstadoConversacionLabels,
  EstadoConversacionColors,
  TipoRemitenteLabels,
} from '../../../core/models/conversacion.model';
import { IPuntoActivo } from '../../../core/models/punto.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inbox-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inbox-list.html',
  styleUrl: './inbox-list.scss',
})
export class InboxList implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private inboxService = inject(InboxService);
  private puntosService = inject(PuntosService);
  private wsService = inject(InboxWebsocketService);
  private router = inject(Router);
  private toast = inject(ToastrService);

  conversaciones: IConversacion[] = [];
  puntos: IPuntoActivo[] = [];
  loading = false;

  // Filtros
  filtroPunto: number | null = null;
  filtroEstado: EstadoConversacion | null = null;
  filtroTelefono: string = '';

  // Paginacion
  pagina = 1;
  limite = 20;
  total = 0;
  totalPaginas = 0;

  // Stats
  stats = { total: 0, en_bot: 0, en_humano: 0, nuevas_hoy: 0 };

  // WebSocket subscriptions
  private subscriptions: Subscription[] = [];
  private mensajesSubscription: Subscription | null = null;

  // Conversacion seleccionada y mensajes
  selectedConversacion: IConversacion | null = null;
  mensajes: IMensaje[] = [];
  loadingMensajes = false;
  enviando = false;
  nuevoMensaje = '';

  // UI State
  showFiltros = false;
  isMobile = false;

  readonly EstadoConversacionLabels = EstadoConversacionLabels;
  readonly EstadoConversacionColors = EstadoConversacionColors;
  readonly TipoRemitenteLabels = TipoRemitenteLabels;
  readonly Math = Math;

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  ngOnInit(): void {
    this.checkMobile();
    this.loadPuntos();
    this.loadConversaciones();
    this.loadStats();
    this.conectarWebSocket();
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.wsService.desconectar();
  }

  loadPuntos(): void {
    this.puntosService.getActivos().subscribe({
      next: (data) => {
        this.puntos = data;
      },
      error: () => {
        this.toast.error('Error al cargar puntos');
      },
    });
  }

  loadConversaciones(): void {
    this.loading = true;

    const params: any = {
      pagina: this.pagina,
      limite: this.limite,
    };

    if (this.filtroPunto) {
      params.punto_id = this.filtroPunto;
    }
    if (this.filtroEstado) {
      params.estado = this.filtroEstado;
    }
    if (this.filtroTelefono) {
      params.telefono_cliente = this.filtroTelefono;
    }

    this.inboxService.getConversaciones(params).subscribe({
      next: (response) => {
        this.conversaciones = response.data;
        this.total = response.meta.total;
        this.totalPaginas = response.meta.totalPaginas;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar conversaciones');
        this.loading = false;
      },
    });
  }

  loadStats(): void {
    this.inboxService.getEstadisticas(this.filtroPunto || undefined).subscribe({
      next: (data) => {
        this.stats = data;
      },
    });
  }

  conectarWebSocket(): void {
    this.wsService.conectar();

    // Escuchar nuevas conversaciones de todos los puntos
    if (this.puntos.length > 0) {
      this.puntos.forEach((punto) => {
        const sub = this.wsService
          .escucharNuevaConversacion<IConversacion>(punto.id_punto)
          .subscribe((conv) => {
            this.conversaciones.unshift(conv);
            this.toast.info('Nueva conversacion recibida');
          });
        this.subscriptions.push(sub);
      });
    }
  }

  onFiltroChange(): void {
    this.pagina = 1;
    this.loadConversaciones();
    this.loadStats();
  }

  seleccionarConversacion(conv: IConversacion): void {
    if (this.selectedConversacion?.id_conversacion === conv.id_conversacion) {
      return;
    }

    this.selectedConversacion = conv;
    this.nuevoMensaje = '';
    this.loadMensajes(conv.id_conversacion);
    this.suscribirMensajesConversacion(conv);
  }

  cerrarDetalle(): void {
    this.selectedConversacion = null;
    this.mensajes = [];
    this.mensajesSubscription?.unsubscribe();
  }

  loadMensajes(conversacionId: number): void {
    this.loadingMensajes = true;
    this.inboxService.getMensajes(conversacionId, { limite: 100 }).subscribe({
      next: (response) => {
        this.mensajes = response.data;
        this.loadingMensajes = false;
        this.scrollToBottom();
      },
      error: () => {
        this.toast.error('Error al cargar mensajes');
        this.loadingMensajes = false;
      },
    });
  }

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim() || !this.selectedConversacion) return;

    this.enviando = true;
    const conversacionId = this.selectedConversacion.id_conversacion;

    this.inboxService.enviarMensaje(conversacionId, this.nuevoMensaje).subscribe({
      next: (response) => {
        this.mensajes.push(response.mensaje);
        this.nuevoMensaje = '';
        this.enviando = false;
        this.scrollToBottom();
        this.actualizarUltimoMensaje(conversacionId, response.mensaje);
      },
      error: () => {
        this.toast.error('Error al enviar mensaje');
        this.enviando = false;
      },
    });
  }

  private actualizarUltimoMensaje(conversacionId: number, mensaje: IMensaje): void {
    const conv = this.conversaciones.find((c) => c.id_conversacion === conversacionId);
    if (conv) {
      conv.ultimo_mensaje = mensaje;
      conv.ultimo_mensaje_en = mensaje.timestamp;
    }
  }

  private suscribirMensajesConversacion(conv: IConversacion): void {
    this.mensajesSubscription?.unsubscribe();

    if (conv.punto_id) {
      this.mensajesSubscription = this.wsService
        .escucharNuevoMensaje<IMensaje>(conv.punto_id)
        .subscribe((mensaje) => {
          if (mensaje.conversacion_id === conv.id_conversacion) {
            this.mensajes.push(mensaje);
            this.scrollToBottom();
            this.actualizarUltimoMensaje(conv.id_conversacion, mensaje);
          }
        });
      this.subscriptions.push(this.mensajesSubscription);
    }
  }

  transferirAHumano(): void {
    if (!this.selectedConversacion) return;

    const id = this.selectedConversacion.id_conversacion;
    this.inboxService.transferirAHumano(id).subscribe({
      next: () => {
        if (this.selectedConversacion) {
          this.selectedConversacion.estado = 'HUMAN';
          const conv = this.conversaciones.find((c) => c.id_conversacion === id);
          if (conv) conv.estado = 'HUMAN';
        }
        this.toast.success('Conversacion transferida');
        this.loadStats();
      },
      error: () => this.toast.error('Error al transferir'),
    });
  }

  transferirABot(): void {
    if (!this.selectedConversacion) return;

    const id = this.selectedConversacion.id_conversacion;
    this.inboxService.transferirABot(id).subscribe({
      next: () => {
        if (this.selectedConversacion) {
          this.selectedConversacion.estado = 'BOT';
          const conv = this.conversaciones.find((c) => c.id_conversacion === id);
          if (conv) conv.estado = 'BOT';
        }
        this.toast.success('Conversacion devuelta al bot');
        this.loadStats();
      },
      error: () => this.toast.error('Error al transferir'),
    });
  }

  toggleFiltros(): void {
    this.showFiltros = !this.showFiltros;
  }

  getInitials(telefono: string): string {
    return telefono.slice(-2);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  formatearHora(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('es-SV', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.pagina = pagina;
      this.loadConversaciones();
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return date.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer ' + date.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-SV', { day: '2-digit', month: 'short' });
    }
  }

  formatearTelefono(telefono: string): string {
    if (telefono.length === 11 && telefono.startsWith('503')) {
      return `+503 ${telefono.slice(3, 7)}-${telefono.slice(7)}`;
    }
    return telefono;
  }
}
