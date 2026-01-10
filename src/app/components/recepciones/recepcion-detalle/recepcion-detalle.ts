import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RecepcionesService, IPaqueteCreado } from '../../../core/services/recepciones.service';
import { PuntosService } from '../../../core/services/puntos.service';
import {
  IRecepcion,
  IUpdateRecepcion,
  IConvertirPaqueteDto,
  EstadoRecepcion,
  EstadoRecepcionLabels,
  CamposOCR
} from '../../../core/models/recepcion.model';
import { IPuntoActivo } from '../../../core/models/punto.model';
import { ConfidenceBadge } from '../../../shared/components/ui/confidence-badge/confidence-badge';

@Component({
  selector: 'app-recepcion-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfidenceBadge],
  templateUrl: './recepcion-detalle.html',
  styleUrl: './recepcion-detalle.scss'
})
export class RecepcionDetalle implements OnInit {
  @ViewChild('convertirModal') convertirModal!: TemplateRef<any>;
  @ViewChild('descartarModal') descartarModal!: TemplateRef<any>;
  @ViewChild('imagenModal') imagenModal!: TemplateRef<any>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recepcionesService = inject(RecepcionesService);
  private puntosService = inject(PuntosService);
  private toast = inject(ToastrService);
  private modal = inject(NgbModal);

  recepcion: IRecepcion | null = null;
  puntosDestino: IPuntoActivo[] = [];
  loading = true;
  saving = false;
  converting = false;
  discarding = false;

  form: FormGroup;
  modalRef: NgbModalRef | null = null;

  // Modal convertir
  puntoDestinoId: number | null = null;
  descripcionPaquete = '';
  notasPaquete = '';

  // Modal descartar
  motivoDescarte = '';

  // Modal imagen
  mostrarImagenModal = false;

  readonly CamposOCR = CamposOCR;
  readonly EstadoRecepcionLabels = EstadoRecepcionLabels;

  constructor() {
    this.form = new FormGroup({
      vendedor: new FormControl(''),
      cliente: new FormControl(''),
      telefono: new FormControl(''),
      dia_entrega: new FormControl(''),
      destino: new FormControl(''),
      encomendista: new FormControl(''),
      precio_producto: new FormControl(null),
      costo_envio: new FormControl(null),
      total: new FormControl(null)
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadRecepcion(id);
      this.loadPuntosDestino();
    } else {
      this.router.navigate(['/recepciones']);
    }
  }

  loadRecepcion(id: number): void {
    this.loading = true;
    this.recepcionesService.getById(id).subscribe({
      next: (data) => {
        this.recepcion = data;
        this.populateForm(data);
        this.loading = false;
      },
      error: (error) => {
        this.toast.error('Error al cargar recepcion');
        this.router.navigate(['/recepciones']);
      }
    });
  }

  loadPuntosDestino(): void {
    this.puntosService.getActivos().subscribe({
      next: (data) => {
        this.puntosDestino = data;
      },
      error: () => {
        this.toast.warning('No se pudieron cargar los puntos de destino');
      }
    });
  }

  populateForm(recepcion: IRecepcion): void {
    this.form.patchValue({
      vendedor: recepcion.vendedor || '',
      cliente: recepcion.cliente || '',
      telefono: recepcion.telefono || '',
      dia_entrega: recepcion.dia_entrega || '',
      destino: recepcion.destino || '',
      encomendista: recepcion.encomendista || '',
      precio_producto: recepcion.precio_producto,
      costo_envio: recepcion.costo_envio,
      total: recepcion.total
    });
  }

  getConfianzaCampo(campo: string): number {
    if (!this.recepcion?.confianza_detalle) return 0;
    return (this.recepcion.confianza_detalle as any)[campo] || 0;
  }

  guardarCambios(): void {
    if (!this.recepcion) return;

    this.saving = true;
    const data: IUpdateRecepcion = {};

    // Solo enviar campos que han cambiado
    CamposOCR.forEach(campo => {
      const value = this.form.get(campo.key)?.value;
      if (value !== null && value !== undefined && value !== '') {
        (data as any)[campo.key] = value;
      }
    });

    this.recepcionesService.actualizar(this.recepcion.id_recepcion, data).subscribe({
      next: (updated) => {
        this.recepcion = updated;
        this.toast.success('Cambios guardados');
        this.saving = false;
      },
      error: (error) => {
        const message = error.error?.message || 'Error al guardar';
        this.toast.error(message);
        this.saving = false;
      }
    });
  }

  abrirModalConvertir(): void {
    this.puntoDestinoId = null;
    this.descripcionPaquete = '';
    this.notasPaquete = '';
    this.modalRef = this.modal.open(this.convertirModal, { centered: true, size: 'lg' });
  }

  confirmarConversion(): void {
    if (!this.recepcion || !this.puntoDestinoId) {
      this.toast.warning('Seleccione un punto de destino');
      return;
    }

    this.converting = true;
    const data: IConvertirPaqueteDto = {
      punto_destino_id: this.puntoDestinoId,
      descripcion: this.descripcionPaquete || undefined,
      notas: this.notasPaquete || undefined,
      remitente_nombre: this.form.get('vendedor')?.value || undefined,
      destinatario_nombre: this.form.get('cliente')?.value || undefined,
      destinatario_telefono: this.form.get('telefono')?.value || undefined,
      costo_envio: this.form.get('costo_envio')?.value || undefined,
      valor_paquete: this.form.get('total')?.value || undefined
    };

    this.recepcionesService.convertirAPaquete(this.recepcion.id_recepcion, data).subscribe({
      next: (paquete: IPaqueteCreado) => {
        this.toast.success(`Paquete creado: ${paquete.codigo_rastreo}`);
        this.modalRef?.close();
        this.router.navigate(['/recepciones']);
      },
      error: (error) => {
        const message = error.error?.message || 'Error al convertir';
        this.toast.error(message);
        this.converting = false;
      }
    });
  }

  abrirModalDescartar(): void {
    this.motivoDescarte = '';
    this.modalRef = this.modal.open(this.descartarModal, { centered: true });
  }

  confirmarDescarte(): void {
    if (!this.recepcion || !this.motivoDescarte.trim()) {
      this.toast.warning('Ingrese el motivo del descarte');
      return;
    }

    this.discarding = true;
    this.recepcionesService.descartar(this.recepcion.id_recepcion, this.motivoDescarte).subscribe({
      next: () => {
        this.toast.success('Recepcion descartada');
        this.modalRef?.close();
        this.router.navigate(['/recepciones']);
      },
      error: (error) => {
        const message = error.error?.message || 'Error al descartar';
        this.toast.error(message);
        this.discarding = false;
      }
    });
  }

  cerrarModal(): void {
    this.modalRef?.close();
  }

  abrirImagenModal(): void {
    this.modalRef = this.modal.open(this.imagenModal, { centered: true, size: 'xl', modalDialogClass: 'modal-fullscreen-lg-down' });
  }

  cerrarImagenModal(): void {
    this.modalRef?.close();
  }

  volver(): void {
    this.router.navigate(['/recepciones']);
  }

  puedeEditar(): boolean {
    if (!this.recepcion) return false;
    return this.recepcion.estado === EstadoRecepcion.PENDIENTE_REVISION ||
           this.recepcion.estado === EstadoRecepcion.REVISION_PARCIAL ||
           this.recepcion.estado === EstadoRecepcion.VALIDADO;
  }

  puedeConvertir(): boolean {
    if (!this.recepcion) return false;
    return this.recepcion.estado !== EstadoRecepcion.CONVERTIDO &&
           this.recepcion.estado !== EstadoRecepcion.DESCARTADO;
  }

  getProgressColor(): string {
    if (!this.recepcion) return 'bg-secondary';
    const conf = this.recepcion.confianza_global;
    if (conf >= 80) return 'bg-success';
    if (conf >= 50) return 'bg-warning';
    return 'bg-danger';
  }
}
