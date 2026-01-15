import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ClientesService } from '../../../core/services/clientes.service';
import {
  ICliente,
  IEstadisticasGlobales,
  EstadoCliente,
  EstadoClienteLabels,
  EstadoClienteColors,
  IBuscarClientesParams,
  IPaginationMeta,
} from '../../../core/models/cliente.model';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clientes-list.html',
  styleUrl: './clientes-list.scss',
})
export class ClientesList implements OnInit {
  @ViewChild('editModal') editModal!: TemplateRef<any>;
  @ViewChild('rechazarModal') rechazarModal!: TemplateRef<any>;
  @ViewChild('passwordModal') passwordModal!: TemplateRef<any>;

  private clientesService = inject(ClientesService);
  private router = inject(Router);
  private modal = inject(NgbModal);
  private toast = inject(ToastrService);

  // Data
  clientes: ICliente[] = [];
  estadisticas: IEstadisticasGlobales | null = null;
  loading = false;
  meta: IPaginationMeta | null = null;

  // Enums para template
  readonly EstadoCliente = EstadoCliente;
  readonly EstadoClienteLabels = EstadoClienteLabels;
  readonly EstadoClienteColors = EstadoClienteColors;
  readonly estados = Object.values(EstadoCliente);
  readonly Math = Math;

  // Filtros
  filtroBusqueda = '';
  filtroEstado: EstadoCliente | '' = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';
  paginaActual = 1;
  limite = 20;

  // Modal editar
  editForm: FormGroup;
  editingCliente: ICliente | null = null;
  submitting = false;
  modalRef: NgbModalRef | null = null;

  // Modal rechazar
  rechazarForm: FormGroup;
  rechazandoCliente: ICliente | null = null;

  // Modal password
  passwordTemporal: string | null = null;

  constructor() {
    this.editForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      telefono: new FormControl('', [Validators.required]),
    });

    this.rechazarForm = new FormGroup({
      motivo: new FormControl('', [Validators.required, Validators.minLength(10)]),
    });
  }

  ngOnInit(): void {
    this.loadClientes();
    this.loadEstadisticas();
  }

  loadClientes(): void {
    this.loading = true;
    const params: IBuscarClientesParams = {
      pagina: this.paginaActual,
      limite: this.limite,
    };

    if (this.filtroBusqueda) params.busqueda = this.filtroBusqueda;
    if (this.filtroEstado) params.estado = this.filtroEstado;
    if (this.filtroFechaDesde) params.fecha_desde = this.filtroFechaDesde;
    if (this.filtroFechaHasta) params.fecha_hasta = this.filtroFechaHasta;

    this.clientesService.getAll(params).subscribe({
      next: (response) => {
        this.clientes = response.data;
        this.meta = response.meta;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar clientes');
        this.loading = false;
      },
    });
  }

  loadEstadisticas(): void {
    this.clientesService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
      },
      error: () => {
        // Silencioso - estadísticas son opcionales
      },
    });
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
    this.loadClientes();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.paginaActual = 1;
    this.loadClientes();
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.loadClientes();
  }

  verDetalle(cliente: ICliente): void {
    this.router.navigate(['/clientes', cliente.id_cliente]);
  }

  // ============ APROBAR ============
  aprobarCliente(cliente: ICliente): void {
    Swal.fire({
      title: 'Aprobar Cliente',
      text: `¿Está seguro de aprobar a ${cliente.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientesService.aprobar(cliente.id_cliente).subscribe({
          next: () => {
            this.toast.success('Cliente aprobado exitosamente');
            this.loadClientes();
            this.loadEstadisticas();
          },
          error: (error) => {
            this.toast.error(error.error?.message || 'Error al aprobar cliente');
          },
        });
      }
    });
  }

  // ============ RECHAZAR ============
  abrirRechazarModal(cliente: ICliente): void {
    this.rechazandoCliente = cliente;
    this.rechazarForm.reset();
    this.modalRef = this.modal.open(this.rechazarModal, { centered: true });
  }

  confirmarRechazo(): void {
    if (this.rechazarForm.invalid || !this.rechazandoCliente) {
      this.rechazarForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const motivo = this.rechazarForm.value.motivo;

    this.clientesService.rechazar(this.rechazandoCliente.id_cliente, { motivo }).subscribe({
      next: () => {
        this.toast.success('Cliente rechazado');
        this.modalRef?.close();
        this.loadClientes();
        this.loadEstadisticas();
        this.submitting = false;
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Error al rechazar cliente');
        this.submitting = false;
      },
    });
  }

  // ============ ACTIVAR ============
  activarCliente(cliente: ICliente): void {
    Swal.fire({
      title: 'Activar Cliente',
      text: `¿Está seguro de activar a ${cliente.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientesService.activar(cliente.id_cliente).subscribe({
          next: () => {
            this.toast.success('Cliente activado exitosamente');
            this.loadClientes();
            this.loadEstadisticas();
          },
          error: (error) => {
            this.toast.error(error.error?.message || 'Error al activar cliente');
          },
        });
      }
    });
  }

  // ============ SUSPENDER ============
  suspenderCliente(cliente: ICliente): void {
    Swal.fire({
      title: 'Suspender Cliente',
      text: `¿Está seguro de suspender a ${cliente.nombre}?`,
      input: 'textarea',
      inputLabel: 'Motivo (opcional)',
      inputPlaceholder: 'Ingrese el motivo de la suspensión...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, suspender',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientesService.suspender(cliente.id_cliente, result.value).subscribe({
          next: () => {
            this.toast.success('Cliente suspendido');
            this.loadClientes();
            this.loadEstadisticas();
          },
          error: (error) => {
            this.toast.error(error.error?.message || 'Error al suspender cliente');
          },
        });
      }
    });
  }

  // ============ EDITAR ============
  abrirEditModal(cliente: ICliente): void {
    this.editingCliente = cliente;
    this.editForm.patchValue({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
    });
    this.modalRef = this.modal.open(this.editModal, { centered: true, size: 'lg' });
  }

  guardarEdicion(): void {
    if (this.editForm.invalid || !this.editingCliente) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const data = this.editForm.value;

    this.clientesService.update(this.editingCliente.id_cliente, data).subscribe({
      next: () => {
        this.toast.success('Cliente actualizado');
        this.modalRef?.close();
        this.loadClientes();
        this.submitting = false;
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Error al actualizar cliente');
        this.submitting = false;
      },
    });
  }

  // ============ RESET PASSWORD ============
  resetPassword(cliente: ICliente): void {
    Swal.fire({
      title: 'Resetear Contraseña',
      text: `¿Generar nueva contraseña para ${cliente.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientesService.resetPassword(cliente.id_cliente).subscribe({
          next: (response) => {
            this.passwordTemporal = response.password_temporal;
            this.modalRef = this.modal.open(this.passwordModal, { centered: true });
          },
          error: (error) => {
            this.toast.error(error.error?.message || 'Error al resetear contraseña');
          },
        });
      }
    });
  }

  copiarPassword(): void {
    if (this.passwordTemporal) {
      navigator.clipboard.writeText(this.passwordTemporal);
      this.toast.success('Contraseña copiada al portapapeles');
    }
  }

  cerrarModal(): void {
    this.modalRef?.close();
  }

  // Helpers
  getPaginas(): number[] {
    if (!this.meta) return [];
    const paginas: number[] = [];
    const total = this.meta.total_paginas;
    const actual = this.meta.pagina;

    let inicio = Math.max(1, actual - 2);
    let fin = Math.min(total, actual + 2);

    if (fin - inicio < 4) {
      if (inicio === 1) {
        fin = Math.min(total, 5);
      } else {
        inicio = Math.max(1, total - 4);
      }
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  formatFecha(fecha: string | null): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
