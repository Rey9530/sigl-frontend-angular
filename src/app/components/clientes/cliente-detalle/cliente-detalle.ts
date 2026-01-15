import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ClientesService } from '../../../core/services/clientes.service';
import {
  ICliente,
  IClienteEstadisticas,
  IPaqueteResumen,
  IPaginationMeta,
  EstadoCliente,
  EstadoClienteLabels,
  EstadoClienteColors,
  EstadoPaquete,
  IHistorialPaquetesParams,
} from '../../../core/models/cliente.model';
import { EstadoPaqueteLabels, EstadoPaqueteColors } from '../../../core/models/paquete.model';

@Component({
  selector: 'app-cliente-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-detalle.html',
  styleUrl: './cliente-detalle.scss',
})
export class ClienteDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientesService = inject(ClientesService);
  private toast = inject(ToastrService);

  // Data
  cliente: ICliente | null = null;
  estadisticas: IClienteEstadisticas | null = null;
  paquetes: IPaqueteResumen[] = [];
  paquetesMeta: IPaginationMeta | null = null;

  // Loading states
  loadingCliente = false;
  loadingEstadisticas = false;
  loadingPaquetes = false;

  // Enums para template
  readonly EstadoCliente = EstadoCliente;
  readonly EstadoClienteLabels = EstadoClienteLabels;
  readonly EstadoClienteColors = EstadoClienteColors;
  readonly EstadoPaquete = EstadoPaquete;
  readonly EstadoPaqueteLabels = EstadoPaqueteLabels;
  readonly EstadoPaqueteColors = EstadoPaqueteColors;
  readonly estadosPaquete = Object.values(EstadoPaquete);

  // Filtros paquetes
  filtroPaqueteEstado: EstadoPaquete | '' = '';
  paginaPaquetes = 1;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadCliente(+id);
      this.loadEstadisticas(+id);
      this.loadPaquetes(+id);
    }
  }

  loadCliente(id: number): void {
    this.loadingCliente = true;
    this.clientesService.getById(id).subscribe({
      next: (data) => {
        this.cliente = data;
        this.loadingCliente = false;
      },
      error: () => {
        this.toast.error('Error al cargar cliente');
        this.loadingCliente = false;
        this.router.navigate(['/clientes']);
      },
    });
  }

  loadEstadisticas(id: number): void {
    this.loadingEstadisticas = true;
    this.clientesService.getEstadisticasCliente(id).subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.loadingEstadisticas = false;
      },
      error: () => {
        this.loadingEstadisticas = false;
      },
    });
  }

  loadPaquetes(id?: number): void {
    const clienteId = id || this.cliente?.id_cliente;
    if (!clienteId) return;

    this.loadingPaquetes = true;
    const params: IHistorialPaquetesParams = {
      pagina: this.paginaPaquetes,
      limite: 10,
    };

    if (this.filtroPaqueteEstado) {
      params.estado = this.filtroPaqueteEstado;
    }

    this.clientesService.getPaquetesCliente(clienteId, params).subscribe({
      next: (response) => {
        this.paquetes = response.data;
        this.paquetesMeta = response.meta;
        this.loadingPaquetes = false;
      },
      error: () => {
        this.toast.error('Error al cargar paquetes');
        this.loadingPaquetes = false;
      },
    });
  }

  onFiltroPaqueteChange(): void {
    this.paginaPaquetes = 1;
    this.loadPaquetes();
  }

  cambiarPaginaPaquetes(pagina: number): void {
    this.paginaPaquetes = pagina;
    this.loadPaquetes();
  }

  // Acciones
  aprobar(): void {
    if (!this.cliente) return;
    Swal.fire({
      title: 'Aprobar Cliente',
      text: `¿Está seguro de aprobar a ${this.cliente.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientesService.aprobar(this.cliente!.id_cliente).subscribe({
          next: (response) => {
            this.toast.success(response.message);
            this.loadCliente(this.cliente!.id_cliente);
          },
          error: (error) => {
            this.toast.error(error.error?.message || 'Error');
          },
        });
      }
    });
  }

  rechazar(): void {
    if (!this.cliente) return;
    Swal.fire({
      title: 'Rechazar Cliente',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Ingrese el motivo (mínimo 10 caracteres)...',
      inputAttributes: {
        minlength: '10',
      },
      inputValidator: (value) => {
        if (!value || value.length < 10) {
          return 'El motivo debe tener al menos 10 caracteres';
        }
        return null;
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.clientesService
          .rechazar(this.cliente!.id_cliente, { motivo: result.value })
          .subscribe({
            next: (response) => {
              this.toast.success(response.message);
              this.loadCliente(this.cliente!.id_cliente);
            },
            error: (error) => {
              this.toast.error(error.error?.message || 'Error');
            },
          });
      }
    });
  }

  activar(): void {
    if (!this.cliente) return;
    Swal.fire({
      title: 'Activar Cliente',
      text: `¿Está seguro de activar a ${this.cliente.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientesService.activar(this.cliente!.id_cliente).subscribe({
          next: (response) => {
            this.toast.success(response.message);
            this.loadCliente(this.cliente!.id_cliente);
          },
          error: (error) => {
            this.toast.error(error.error?.message || 'Error');
          },
        });
      }
    });
  }

  suspender(): void {
    if (!this.cliente) return;
    Swal.fire({
      title: 'Suspender Cliente',
      input: 'textarea',
      inputLabel: 'Motivo (opcional)',
      inputPlaceholder: 'Ingrese el motivo de la suspensión...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Suspender',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientesService.suspender(this.cliente!.id_cliente, result.value).subscribe({
          next: (response) => {
            this.toast.success(response.message);
            this.loadCliente(this.cliente!.id_cliente);
          },
          error: (error) => {
            this.toast.error(error.error?.message || 'Error');
          },
        });
      }
    });
  }

  resetPassword(): void {
    if (!this.cliente) return;
    Swal.fire({
      title: 'Resetear Contraseña',
      text: `¿Generar nueva contraseña para ${this.cliente.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      confirmButtonText: 'Generar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientesService.resetPassword(this.cliente!.id_cliente).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Nueva Contraseña',
              html: `
                <div class="alert alert-warning">Esta contraseña solo se mostrará una vez.</div>
                <div class="bg-light p-3 rounded">
                  <code style="font-size: 1.5rem;">${response.password_temporal}</code>
                </div>
              `,
              icon: 'success',
              confirmButtonText: 'Copiar y Cerrar',
            }).then(() => {
              navigator.clipboard.writeText(response.password_temporal);
              this.toast.success('Contraseña copiada');
            });
          },
          error: (error) => {
            this.toast.error(error.error?.message || 'Error');
          },
        });
      }
    });
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }

  verPaquete(paquete: IPaqueteResumen): void {
    this.router.navigate(['/paquetes', paquete.id_paquete]);
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

  getPaginasPaquetes(): number[] {
    if (!this.paquetesMeta) return [];
    const paginas: number[] = [];
    for (let i = 1; i <= this.paquetesMeta.total_paginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }
}
