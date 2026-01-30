import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { PaquetesService } from '../../../core/services/paquetes.service';
import { PuntosService } from '../../../core/services/puntos.service';
import {
  IPaquete,
  IPaqueteEstadisticas,
  EstadoPaquete,
  EstadoPaqueteLabels,
  EstadoPaqueteColors,
  ICambiarEstadoMasivo,
  IResultadoCambioMasivo
} from '../../../core/models/paquete.model';
import { IPuntoActivo } from '../../../core/models/punto.model';

// Transiciones válidas entre estados
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
  selector: 'app-paquetes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paquetes-list.html',
  styleUrl: './paquetes-list.scss'
})
export class PaquetesList implements OnInit {
  @ViewChild('imagenModal') imagenModal!: TemplateRef<any>;
  @ViewChild('cambioEstadoMasivoModal') cambioEstadoMasivoModal!: TemplateRef<any>;

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

  // Selección múltiple
  paquetesSeleccionados = new Set<number>();
  seleccionarTodos = false;

  // Modal cambio masivo
  estadosDisponiblesMasivo: EstadoPaquete[] = [];
  nuevoEstadoMasivo: EstadoPaquete | null = null;
  comentarioMasivo = '';
  procesandoCambioMasivo = false;
  resultadosMasivos: IResultadoCambioMasivo | null = null;

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

  // =====================
  // Selección múltiple
  // =====================

  toggleSeleccion(paquete: IPaquete): void {
    if (this.paquetesSeleccionados.has(paquete.id_paquete)) {
      this.paquetesSeleccionados.delete(paquete.id_paquete);
    } else {
      this.paquetesSeleccionados.add(paquete.id_paquete);
    }
    this.actualizarSeleccionarTodos();
  }

  toggleSeleccionarTodos(): void {
    if (this.seleccionarTodos) {
      this.paquetesSeleccionados.clear();
    } else {
      this.paquetes
        .filter(p => TRANSICIONES_VALIDAS[p.estado_actual].length > 0)
        .forEach(p => this.paquetesSeleccionados.add(p.id_paquete));
    }
    this.seleccionarTodos = !this.seleccionarTodos;
  }

  private actualizarSeleccionarTodos(): void {
    const seleccionables = this.paquetes.filter(p => TRANSICIONES_VALIDAS[p.estado_actual].length > 0);
    this.seleccionarTodos = seleccionables.length > 0 &&
      seleccionables.every(p => this.paquetesSeleccionados.has(p.id_paquete));
  }

  isSeleccionado(paquete: IPaquete): boolean {
    return this.paquetesSeleccionados.has(paquete.id_paquete);
  }

  puedeSeleccionar(paquete: IPaquete): boolean {
    return TRANSICIONES_VALIDAS[paquete.estado_actual].length > 0;
  }

  limpiarSeleccion(): void {
    this.paquetesSeleccionados.clear();
    this.seleccionarTodos = false;
  }

  getPaqueteById(id: number): IPaquete | undefined {
    return this.paquetes.find(p => p.id_paquete === id);
  }

  // =====================
  // Cambio masivo
  // =====================

  abrirModalCambioMasivo(): void {
    this.calcularEstadosDisponiblesMasivo();

    if (this.estadosDisponiblesMasivo.length === 0) {
      this.toast.warning('Los paquetes seleccionados no tienen estados destino en común');
      return;
    }

    this.nuevoEstadoMasivo = null;
    this.comentarioMasivo = '';
    this.resultadosMasivos = null;
    this.modalRef = this.modal.open(this.cambioEstadoMasivoModal, { centered: true, size: 'lg' });
  }

  private calcularEstadosDisponiblesMasivo(): void {
    const seleccionados = this.paquetes.filter(p => this.paquetesSeleccionados.has(p.id_paquete));

    if (seleccionados.length === 0) {
      this.estadosDisponiblesMasivo = [];
      return;
    }

    // Intersección de estados válidos
    let estadosComunes: Set<EstadoPaquete> | null = null;

    for (const paquete of seleccionados) {
      const estados = new Set(TRANSICIONES_VALIDAS[paquete.estado_actual]);
      if (estadosComunes === null) {
        estadosComunes = estados;
      } else {
        estadosComunes = new Set([...estadosComunes].filter((e: EstadoPaquete) => estados.has(e)));
      }
    }

    this.estadosDisponiblesMasivo = estadosComunes ? [...estadosComunes] : [];
  }

  confirmarCambioMasivo(): void {
    if (!this.nuevoEstadoMasivo) {
      this.toast.warning('Seleccione un estado');
      return;
    }

    const cantidad = this.paquetesSeleccionados.size;
    const estadoLabel = EstadoPaqueteLabels[this.nuevoEstadoMasivo];

    Swal.fire({
      title: 'Confirmar Cambio Masivo',
      html: `<p>¿Cambiar <strong>${cantidad}</strong> paquete(s) a <strong>${estadoLabel}</strong>?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarCambioMasivo();
      }
    });
  }

  private ejecutarCambioMasivo(): void {
    this.procesandoCambioMasivo = true;

    const data: ICambiarEstadoMasivo = {
      ids_paquete: Array.from(this.paquetesSeleccionados),
      nuevo_estado: this.nuevoEstadoMasivo!,
      comentario: this.comentarioMasivo || undefined
    };

    this.paquetesService.cambiarEstadoMasivo(data).subscribe({
      next: (resultado) => {
        this.resultadosMasivos = resultado;
        this.procesandoCambioMasivo = false;

        if (resultado.exitosos > 0) {
          this.toast.success(`${resultado.exitosos} paquete(s) actualizados`);
        }
        if (resultado.fallidos > 0) {
          this.toast.warning(`${resultado.fallidos} paquete(s) no pudieron actualizarse`);
        }

        this.limpiarSeleccion();
        this.loadPaquetes();
        this.loadEstadisticas();
      },
      error: () => {
        this.toast.error('Error al procesar el cambio masivo');
        this.procesandoCambioMasivo = false;
      }
    });
  }

  cerrarModalMasivo(): void {
    this.modalRef?.close();
    this.resultadosMasivos = null;
  }
}
