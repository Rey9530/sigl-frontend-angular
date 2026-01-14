import { Component, OnInit, OnDestroy, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

import { CajaService } from '../../../core/services/caja.service';
import { IResumenCaja } from '../../../core/models/caja.model';

@Component({
  selector: 'app-caja-monitoreo',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule, DecimalPipe],
  templateUrl: './caja-monitoreo.html',
})
export class CajaMonitoreo implements OnInit, OnDestroy {
  @ViewChild('cierreModal') cierreModal!: TemplateRef<any>;
  @ViewChild('detalleModal') detalleModal!: TemplateRef<any>;

  private cajaService = inject(CajaService);
  private modal = inject(NgbModal);
  private toast = inject(ToastrService);

  resumenUsuarios: IResumenCaja[] = [];
  loading = false;
  puntoIdFiltro?: number;

  // Modal de cierre
  usuarioSeleccionado: IResumenCaja | null = null;
  notasCierre = '';
  realizandoCierre = false;

  // Totales
  totalGeneral = 0;
  totalPaquetes = 0;

  private destroy$ = new Subject<void>();
  private refreshInterval: any;

  ngOnInit(): void {
    this.cargarResumen();
    // Actualizar cada 30 segundos
    this.refreshInterval = setInterval(() => this.cargarResumen(true), 30000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  cargarResumen(silencioso = false): void {
    if (!silencioso) {
      this.loading = true;
    }

    this.cajaService.getResumen(this.puntoIdFiltro).subscribe({
      next: (data) => {
        this.resumenUsuarios = data;
        this.calcularTotales();
        this.loading = false;
      },
      error: (err) => {
        if (!silencioso) {
          this.toast.error('Error al cargar resumen de caja');
        }
        this.loading = false;
      },
    });
  }

  calcularTotales(): void {
    this.totalGeneral = this.resumenUsuarios.reduce(
      (sum, u) => sum + u.total_pendiente,
      0
    );
    this.totalPaquetes = this.resumenUsuarios.reduce(
      (sum, u) => sum + u.cantidad_paquetes,
      0
    );
  }

  abrirModalCierre(usuario: IResumenCaja): void {
    this.usuarioSeleccionado = usuario;
    this.notasCierre = '';
    this.modal.open(this.cierreModal, { centered: true });
  }

  realizarCierre(): void {
    if (!this.usuarioSeleccionado) return;

    this.realizandoCierre = true;
    this.cajaService
      .realizarCierreUsuario(
        this.usuarioSeleccionado.usuario_id,
        this.usuarioSeleccionado.punto_id,
        this.notasCierre || undefined
      )
      .subscribe({
        next: (cierre) => {
          this.toast.success(
            `Cierre realizado: $${cierre.total_recaudado.toFixed(2)} de ${cierre.cantidad_paquetes} paquetes`
          );
          this.modal.dismissAll();
          this.cargarResumen();
          this.realizandoCierre = false;
        },
        error: (error) => {
          this.toast.error(error.error?.message || 'Error al realizar cierre');
          this.realizandoCierre = false;
        },
      });
  }

  onFiltroChange(): void {
    this.cargarResumen();
  }
}
