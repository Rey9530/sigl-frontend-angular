import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PaquetesService } from '../../../core/services/paquetes.service';
import { PuntosService } from '../../../core/services/puntos.service';
import {
  IPaquete,
  IPaqueteEstadisticas,
  EstadoPaquete,
  EstadoPaqueteLabels,
  EstadoPaqueteColors
} from '../../../core/models/paquete.model';
import { IPuntoActivo } from '../../../core/models/punto.model';

@Component({
  selector: 'app-paquetes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paquetes-list.html',
  styleUrl: './paquetes-list.scss'
})
export class PaquetesList implements OnInit {
  @ViewChild('imagenModal') imagenModal!: TemplateRef<any>;

  private paquetesService = inject(PaquetesService);
  private puntosService = inject(PuntosService);
  private toast = inject(ToastrService);
  private modal = inject(NgbModal);
  private router = inject(Router);

  paquetes: IPaquete[] = [];
  estadisticas: IPaqueteEstadisticas | null = null;
  puntosServicio: IPuntoActivo[] = [];
  loading = false;

  // Filtros
  filtroEstado: EstadoPaquete | '' = '';
  filtroPuntoOrigen: number | null = null;
  filtroPuntoDestino: number | null = null;
  filtroCodigo = '';

  // Modal imagen
  modalRef: NgbModalRef | null = null;
  imagenSeleccionada: string | null = null;

  readonly EstadoPaquete = EstadoPaquete;
  readonly EstadoPaqueteLabels = EstadoPaqueteLabels;
  readonly EstadoPaqueteColors = EstadoPaqueteColors;

  ngOnInit(): void {
    this.loadPuntosServicio();
    this.loadPaquetes();
    this.loadEstadisticas();
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

  loadPaquetes(): void {
    this.loading = true;
    const params: any = {};

    if (this.filtroEstado) {
      params.estado = this.filtroEstado;
    }
    if (this.filtroPuntoOrigen) {
      params.punto_origen_id = this.filtroPuntoOrigen;
    }
    if (this.filtroPuntoDestino) {
      params.punto_destino_id = this.filtroPuntoDestino;
    }
    if (this.filtroCodigo.trim()) {
      params.codigo_rastreo = this.filtroCodigo.trim();
    }

    this.paquetesService.getAll(Object.keys(params).length > 0 ? params : undefined).subscribe({
      next: (data) => {
        this.paquetes = data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar paquetes');
        this.loading = false;
      }
    });
  }

  loadEstadisticas(): void {
    this.paquetesService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
      },
      error: () => {
        // Estadisticas opcionales
      }
    });
  }

  onFiltroChange(): void {
    this.loadPaquetes();
  }

  buscarPorCodigo(): void {
    this.loadPaquetes();
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroPuntoOrigen = null;
    this.filtroPuntoDestino = null;
    this.filtroCodigo = '';
    this.loadPaquetes();
  }

  verDetalle(paquete: IPaquete): void {
    this.router.navigate(['/paquetes', paquete.id_paquete]);
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

  getEstadisticaPorEstado(estado: EstadoPaquete): number {
    if (!this.estadisticas) return 0;
    const item = this.estadisticas.por_estado.find(e => e.estado === estado);
    return item?.cantidad || 0;
  }
}
