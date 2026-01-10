import { Component, inject, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { RecepcionesService, IPaqueteCreado } from '../../../core/services/recepciones.service';
import { PuntosService } from '../../../core/services/puntos.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import {
  IRecepcion,
  IRecepcionEstadisticas,
  EstadoRecepcion,
  EstadoRecepcionLabels,
  EstadoRecepcionColors
} from '../../../core/models/recepcion.model';
import { IPuntoActivo } from '../../../core/models/punto.model';
import { ConfidenceBadge } from '../../../shared/components/ui/confidence-badge/confidence-badge';

@Component({
  selector: 'app-recepciones-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfidenceBadge],
  templateUrl: './recepciones-list.html',
  styleUrl: './recepciones-list.scss'
})
export class RecepcionesList implements OnInit, OnDestroy {
  @ViewChild('descartarModal') descartarModal!: TemplateRef<any>;
  @ViewChild('imagenModal') imagenModal!: TemplateRef<any>;

  private recepcionesService = inject(RecepcionesService);
  private puntosService = inject(PuntosService);
  private wsService = inject(WebSocketService);
  private toast = inject(ToastrService);
  private modal = inject(NgbModal);
  private router = inject(Router);

  recepciones: IRecepcion[] = [];
  estadisticas: IRecepcionEstadisticas | null = null;
  puntosServicio: IPuntoActivo[] = [];
  loading = false;
  filtroEstado: EstadoRecepcion | '' = '';
  filtroPuntoServicio: number | null = null;

  // Modal descartar
  modalRef: NgbModalRef | null = null;
  recepcionADescartar: IRecepcion | null = null;
  motivoDescarte = '';
  descartando = false;

  // Modal imagen
  imagenSeleccionada: string | null = null;

  // WebSocket
  private wsSubscriptions: Subscription[] = [];
  private currentPuntoId: number | null = null;
  wsConnected = false;

  readonly EstadoRecepcion = EstadoRecepcion;
  readonly EstadoRecepcionLabels = EstadoRecepcionLabels;
  readonly EstadoRecepcionColors = EstadoRecepcionColors;

  ngOnInit(): void {
    this.loadPuntosServicio();
    this.loadRecepciones();
    this.loadEstadisticas();
    this.conectarWebSocket();
  }

  ngOnDestroy(): void {
    this.desconectarWebSocket();
  }

  private conectarWebSocket(): void {
    this.wsService.conectarRecepciones();

    // Suscribirse al estado de conexion
    const connSub = this.wsService.isConnected$.subscribe(connected => {
      this.wsConnected = connected;
    });
    this.wsSubscriptions.push(connSub);
  }

  private desconectarWebSocket(): void {
    // Limpiar subscripciones
    this.wsSubscriptions.forEach(sub => sub.unsubscribe());
    this.wsSubscriptions = [];

    // Limpiar listeners del punto actual
    if (this.currentPuntoId) {
      this.wsService.limpiarListenersPunto(this.currentPuntoId);
    }

    this.wsService.desconectar();
  }

  private suscribirEventosPunto(puntoId: number): void {
    // Limpiar listeners anteriores si cambia el punto
    if (this.currentPuntoId && this.currentPuntoId !== puntoId) {
      this.wsService.limpiarListenersPunto(this.currentPuntoId);
    }

    this.currentPuntoId = puntoId;

    // Nueva recepcion
    const nuevaSub = this.wsService.escucharNuevaRecepcion<IRecepcion>(puntoId).subscribe(recepcion => {
      this.toast.info(`Nueva recepcion recibida`, 'Actualizacion');
      // Agregar al inicio de la lista
      this.recepciones = [recepcion, ...this.recepciones];
      this.loadEstadisticas();
    });
    this.wsSubscriptions.push(nuevaSub);

    // Recepcion actualizada
    const actualizadaSub = this.wsService.escucharRecepcionActualizada<IRecepcion>(puntoId).subscribe(recepcion => {
      // Actualizar en la lista
      const index = this.recepciones.findIndex(r => r.id_recepcion === recepcion.id_recepcion);
      if (index !== -1) {
        this.recepciones[index] = recepcion;
        this.recepciones = [...this.recepciones]; // Trigger change detection
      }
    });
    this.wsSubscriptions.push(actualizadaSub);

    // Recepcion convertida
    const convertidaSub = this.wsService.escucharRecepcionConvertida<any>(puntoId).subscribe(data => {
      this.toast.success(`Recepcion convertida a paquete`, 'Convertida');
      // Remover de la lista
      this.recepciones = this.recepciones.filter(r => r.id_recepcion !== data.recepcion_id);
      this.loadEstadisticas();
    });
    this.wsSubscriptions.push(convertidaSub);

    // Recepcion descartada
    const descartadaSub = this.wsService.escucharRecepcionDescartada<any>(puntoId).subscribe(data => {
      // Remover de la lista
      this.recepciones = this.recepciones.filter(r => r.id_recepcion !== data.recepcion_id);
      this.loadEstadisticas();
    });
    this.wsSubscriptions.push(descartadaSub);
  }

  loadPuntosServicio(): void {
    this.puntosService.getActivos().subscribe({
      next: (data) => {
        this.puntosServicio = data;
      },
      error: () => {
        this.toast.warning('No se pudieron cargar los puntos de servicio');
      }
    });
  }

  loadRecepciones(): void {
    this.loading = true;
    const params: any = {};

    if (this.filtroEstado) {
      params.estado = this.filtroEstado;
    }
    if (this.filtroPuntoServicio) {
      params.punto_servicio_id = this.filtroPuntoServicio;
    }

    this.recepcionesService.getAll(Object.keys(params).length > 0 ? params : undefined).subscribe({
      next: (data) => {
        this.recepciones = data;
        this.loading = false;
      },
      error: (error) => {
        this.toast.error('Error al cargar recepciones');
        this.loading = false;
      }
    });
  }

  loadEstadisticas(): void {
    this.recepcionesService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
      },
      error: () => {
        // No mostrar error, las estadisticas son opcionales
      }
    });
  }

  onFiltroChange(): void {
    this.loadRecepciones();
  }

  onFiltroPuntoChange(): void {
    this.loadRecepciones();

    // Suscribirse a eventos del nuevo punto
    if (this.filtroPuntoServicio) {
      this.suscribirEventosPunto(this.filtroPuntoServicio);
    } else if (this.currentPuntoId) {
      // Si se deselecciona el punto, limpiar listeners
      this.wsService.limpiarListenersPunto(this.currentPuntoId);
      this.currentPuntoId = null;
    }
  }

  verDetalle(recepcion: IRecepcion): void {
    this.router.navigate(['/recepciones', recepcion.id_recepcion]);
  }

  abrirModalDescartar(recepcion: IRecepcion): void {
    this.recepcionADescartar = recepcion;
    this.motivoDescarte = '';
    this.modalRef = this.modal.open(this.descartarModal, { centered: true });
  }

  confirmarDescarte(): void {
    if (!this.recepcionADescartar || !this.motivoDescarte.trim()) {
      this.toast.warning('Ingrese el motivo del descarte');
      return;
    }

    this.descartando = true;
    this.recepcionesService.descartar(this.recepcionADescartar.id_recepcion, this.motivoDescarte).subscribe({
      next: () => {
        this.toast.success('Recepcion descartada');
        this.modalRef?.close();
        this.loadRecepciones();
        this.loadEstadisticas();
        this.descartando = false;
      },
      error: (error) => {
        const message = error.error?.message || 'Error al descartar';
        this.toast.error(message);
        this.descartando = false;
      }
    });
  }

  cerrarModal(): void {
    this.modalRef?.close();
    this.recepcionADescartar = null;
  }

  abrirImagenModal(url: string): void {
    this.imagenSeleccionada = url;
    this.modalRef = this.modal.open(this.imagenModal, { centered: true, size: 'xl' });
  }

  cerrarImagenModal(): void {
    this.modalRef?.close();
    this.imagenSeleccionada = null;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-SV', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  puedeEditar(recepcion: IRecepcion): boolean {
    return recepcion.estado === EstadoRecepcion.PENDIENTE_REVISION ||
           recepcion.estado === EstadoRecepcion.REVISION_PARCIAL ||
           recepcion.estado === EstadoRecepcion.VALIDADO;
  }
}
