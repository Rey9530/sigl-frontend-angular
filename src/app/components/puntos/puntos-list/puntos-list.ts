import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PuntosService } from '../../../core/services/puntos.service';
import { IPunto, Departamentos } from '../../../core/models/punto.model';
import { AuthService } from '../../../core/services/auth.service';
import { Rol } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-puntos-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './puntos-list.html',
  styleUrl: './puntos-list.scss'
})
export class PuntosList implements OnInit {
  @ViewChild('puntoModal') puntoModal!: TemplateRef<any>;

  private puntosService = inject(PuntosService);
  private authService = inject(AuthService);
  private modal = inject(NgbModal);
  private toast = inject(ToastrService);

  puntos: IPunto[] = [];
  loading = false;
  currentUserRol: string = '';

  // Modal form
  form: FormGroup;
  isEditMode = false;
  puntoId: number | null = null;
  submitting = false;
  modalRef: NgbModalRef | null = null;

  departamentos = Departamentos;
  readonly Rol = Rol;

  constructor() {
    this.form = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
      codigo: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]),
      direccion: new FormControl('', [Validators.required, Validators.minLength(5)]),
      telefono: new FormControl(''),
      email: new FormControl('', [Validators.email]),
      ciudad: new FormControl(''),
      departamento: new FormControl(''),
      latitud: new FormControl(null),
      longitud: new FormControl(null),
      horario: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.currentUserRol = this.authService.getCurrentUser()?.rol || '';
    this.loadPuntos();
  }

  loadPuntos(): void {
    this.loading = true;
    this.puntosService.getAll().subscribe({
      next: (data) => {
        this.puntos = data;
        this.loading = false;
      },
      error: (error) => {
        this.toast.error('Error al cargar puntos');
        this.loading = false;
      }
    });
  }

  nuevoPunto(): void {
    this.isEditMode = false;
    this.puntoId = null;
    this.form.reset();
    this.modalRef = this.modal.open(this.puntoModal, { centered: true, size: 'lg' });
  }

  editarPunto(id: number): void {
    this.isEditMode = true;
    this.puntoId = id;
    this.form.reset();

    this.puntosService.getById(id).subscribe({
      next: (punto) => {
        this.form.patchValue({
          nombre: punto.nombre,
          codigo: punto.codigo,
          direccion: punto.direccion,
          telefono: punto.telefono || '',
          email: punto.email || '',
          ciudad: punto.ciudad || '',
          departamento: punto.departamento || '',
          latitud: punto.latitud,
          longitud: punto.longitud,
          horario: punto.horario || ''
        });
        this.modalRef = this.modal.open(this.puntoModal, { centered: true, size: 'lg' });
      },
      error: () => {
        this.toast.error('Error al cargar punto');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const data = { ...this.form.value };

    // Remove empty optional fields
    const optionalFields = ['telefono', 'email', 'ciudad', 'departamento', 'latitud', 'longitud', 'horario'];
    optionalFields.forEach(field => {
      if (!data[field] && data[field] !== 0) {
        delete data[field];
      }
    });

    const request = this.isEditMode
      ? this.puntosService.update(this.puntoId!, data)
      : this.puntosService.create(data);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'Punto actualizado' : 'Punto creado');
        this.modalRef?.close();
        this.loadPuntos();
        this.submitting = false;
      },
      error: (error) => {
        const message = error.error?.message || 'Error al guardar punto';
        this.toast.error(message);
        this.submitting = false;
      }
    });
  }

  cerrarModal(): void {
    this.modalRef?.close();
  }

  toggleEstado(punto: IPunto): void {
    if (punto.activo) {
      this.puntosService.delete(punto.id_punto).subscribe({
        next: () => {
          this.toast.success('Punto desactivado');
          this.loadPuntos();
        },
        error: () => this.toast.error('Error al desactivar punto')
      });
    } else {
      this.puntosService.activate(punto.id_punto).subscribe({
        next: () => {
          this.toast.success('Punto activado');
          this.loadPuntos();
        },
        error: () => this.toast.error('Error al activar punto')
      });
    }
  }

  canDelete(): boolean {
    return this.currentUserRol === Rol.SUPER_ADMIN;
  }

  canEdit(): boolean {
    return this.currentUserRol === Rol.SUPER_ADMIN || this.currentUserRol === Rol.ADMINISTRADOR;
  }
}
