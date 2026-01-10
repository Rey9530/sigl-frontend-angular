import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PaquetesService } from '../../../core/services/paquetes.service';
import {
  IPaqueteDetalle,
  IUpdateEstado,
  EstadoPaquete,
  EstadoPaqueteLabels,
  EstadoPaqueteColors
} from '../../../core/models/paquete.model';

// Transiciones validas de estado
const TRANSICIONES_VALIDAS: Record<EstadoPaquete, EstadoPaquete[]> = {
  [EstadoPaquete.RECIBIDO_ORIGEN]: [EstadoPaquete.EN_TRANSITO, EstadoPaquete.CANCELADO],
  [EstadoPaquete.EN_TRANSITO]: [EstadoPaquete.LLEGO_DESTINO, EstadoPaquete.EN_DEVOLUCION],
  [EstadoPaquete.LLEGO_DESTINO]: [EstadoPaquete.ENTREGADO, EstadoPaquete.EN_DEVOLUCION],
  [EstadoPaquete.ENTREGADO]: [],
  [EstadoPaquete.EN_DEVOLUCION]: [EstadoPaquete.DEVUELTO],
  [EstadoPaquete.DEVUELTO]: [],
  [EstadoPaquete.CANCELADO]: []
};

@Component({
  selector: 'app-paquete-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paquete-detalle.html',
  styleUrl: './paquete-detalle.scss'
})
export class PaqueteDetalle implements OnInit {
  @ViewChild('cambiarEstadoModal') cambiarEstadoModal!: TemplateRef<any>;
  @ViewChild('imagenModal') imagenModal!: TemplateRef<any>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paquetesService = inject(PaquetesService);
  private toast = inject(ToastrService);
  private modal = inject(NgbModal);

  paquete: IPaqueteDetalle | null = null;
  loading = true;
  cambiandoEstado = false;

  modalRef: NgbModalRef | null = null;

  // Modal cambiar estado
  nuevoEstado: EstadoPaquete | null = null;
  comentarioEstado = '';
  estadosDisponibles: EstadoPaquete[] = [];

  readonly EstadoPaquete = EstadoPaquete;
  readonly EstadoPaqueteLabels = EstadoPaqueteLabels;
  readonly EstadoPaqueteColors = EstadoPaqueteColors;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadPaquete(id);
    } else {
      this.router.navigate(['/paquetes']);
    }
  }

  loadPaquete(id: number): void {
    this.loading = true;
    this.paquetesService.getById(id).subscribe({
      next: (data) => {
        this.paquete = data;
        this.actualizarEstadosDisponibles();
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar paquete');
        this.router.navigate(['/paquetes']);
      }
    });
  }

  actualizarEstadosDisponibles(): void {
    if (this.paquete) {
      this.estadosDisponibles = TRANSICIONES_VALIDAS[this.paquete.estado_actual] || [];
    }
  }

  volver(): void {
    this.router.navigate(['/paquetes']);
  }

  abrirModalCambiarEstado(): void {
    this.nuevoEstado = null;
    this.comentarioEstado = '';
    this.modalRef = this.modal.open(this.cambiarEstadoModal, { centered: true });
  }

  confirmarCambioEstado(): void {
    if (!this.paquete || !this.nuevoEstado) {
      this.toast.warning('Seleccione un estado');
      return;
    }

    this.cambiandoEstado = true;
    const data: IUpdateEstado = {
      nuevo_estado: this.nuevoEstado,
      comentario: this.comentarioEstado || undefined
    };

    this.paquetesService.cambiarEstado(this.paquete.id_paquete, data).subscribe({
      next: () => {
        this.toast.success('Estado actualizado');
        this.modalRef?.close();
        this.loadPaquete(this.paquete!.id_paquete);
        this.cambiandoEstado = false;
      },
      error: (error) => {
        const message = error.error?.message || 'Error al cambiar estado';
        this.toast.error(message);
        this.cambiandoEstado = false;
      }
    });
  }

  cerrarModal(): void {
    this.modalRef?.close();
  }

  abrirImagenModal(): void {
    this.modalRef = this.modal.open(this.imagenModal, {
      centered: true,
      size: 'xl',
      modalDialogClass: 'modal-fullscreen-lg-down'
    });
  }

  cerrarImagenModal(): void {
    this.modalRef?.close();
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

  formatDateLong(dateString: string): string {
    return new Date(dateString).toLocaleString('es-SV', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  puedeEditarEstado(): boolean {
    if (!this.paquete) return false;
    return this.estadosDisponibles.length > 0;
  }

  getIconoEstado(estado: EstadoPaquete): string {
    const iconos: Record<EstadoPaquete, string> = {
      [EstadoPaquete.RECIBIDO_ORIGEN]: 'fa-inbox',
      [EstadoPaquete.EN_TRANSITO]: 'fa-truck',
      [EstadoPaquete.LLEGO_DESTINO]: 'fa-map-marker-alt',
      [EstadoPaquete.ENTREGADO]: 'fa-check-circle',
      [EstadoPaquete.EN_DEVOLUCION]: 'fa-undo',
      [EstadoPaquete.DEVUELTO]: 'fa-arrow-left',
      [EstadoPaquete.CANCELADO]: 'fa-times-circle'
    };
    return iconos[estado] || 'fa-circle';
  }
}
