import { Component, OnInit, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CajaService } from '../../../core/services/caja.service';
import { ICierreCaja, IRegistroRecaudacion } from '../../../core/models/caja.model';

@Component({
  selector: 'app-caja-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule, NgbPaginationModule, DecimalPipe, DatePipe],
  templateUrl: './caja-historial.html',
})
export class CajaHistorial implements OnInit {
  @ViewChild('detalleModal') detalleModal!: TemplateRef<any>;

  private cajaService = inject(CajaService);
  private modal = inject(NgbModal);
  private toast = inject(ToastrService);

  Math = Math; // Para usar en el template

  cierres: ICierreCaja[] = [];
  loading = false;

  // Paginacion
  pagina = 1;
  limite = 20;
  total = 0;
  totalPaginas = 1;

  // Filtros
  filtroUsuarioId?: number;
  filtroPuntoId?: number;
  filtroFechaDesde?: string;
  filtroFechaHasta?: string;

  // Detalle
  cierreDetalle: (ICierreCaja & { registros: IRegistroRecaudacion[] }) | null = null;
  loadingDetalle = false;

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.loading = true;
    this.cajaService
      .getHistorialCierres({
        usuario_id: this.filtroUsuarioId,
        punto_id: this.filtroPuntoId,
        fecha_desde: this.filtroFechaDesde,
        fecha_hasta: this.filtroFechaHasta,
        pagina: this.pagina,
        limite: this.limite,
      })
      .subscribe({
        next: (response) => {
          this.cierres = response.data;
          this.total = response.meta.total;
          this.totalPaginas = response.meta.totalPaginas;
          this.loading = false;
        },
        error: () => {
          this.toast.error('Error al cargar historial');
          this.loading = false;
        },
      });
  }

  cambiarPagina(nuevaPagina: number): void {
    this.pagina = nuevaPagina;
    this.cargarHistorial();
  }

  limpiarFiltros(): void {
    this.filtroUsuarioId = undefined;
    this.filtroPuntoId = undefined;
    this.filtroFechaDesde = undefined;
    this.filtroFechaHasta = undefined;
    this.pagina = 1;
    this.cargarHistorial();
  }

  verDetalle(cierre: ICierreCaja): void {
    this.cierreDetalle = null;
    this.loadingDetalle = true;
    this.modal.open(this.detalleModal, { size: 'lg', centered: true });

    this.cajaService.getDetalleCierre(cierre.id_cierre).subscribe({
      next: (detalle) => {
        this.cierreDetalle = detalle;
        this.loadingDetalle = false;
      },
      error: () => {
        this.toast.error('Error al cargar detalle');
        this.loadingDetalle = false;
        this.modal.dismissAll();
      },
    });
  }
}
