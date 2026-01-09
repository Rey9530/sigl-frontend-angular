import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Select2Module, Select2Data } from 'ng-select2-component';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { PuntosService } from '../../../core/services/puntos.service';
import { IUsuario, Rol, RolLabels } from '../../../core/models/usuario.model';
import { IPuntoActivo } from '../../../core/models/punto.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Select2Module],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.scss'
})
export class UsuariosList implements OnInit {
  @ViewChild('usuarioModal') usuarioModal!: TemplateRef<any>;

  private usuariosService = inject(UsuariosService);
  private puntosService = inject(PuntosService);
  private authService = inject(AuthService);
  private modal = inject(NgbModal);
  private toast = inject(ToastrService);

  usuarios: IUsuario[] = [];
  loading = false;
  currentUserRol: string = '';

  // Modal form
  form: FormGroup;
  isEditMode = false;
  usuarioId: number | null = null;
  submitting = false;
  modalRef: NgbModalRef | null = null;

  // Select data
  roles = Object.values(Rol);
  readonly RolLabels = RolLabels;
  readonly Rol = Rol;
  puntosActivos: IPuntoActivo[] = [];
  puntosSelect2Data: Select2Data = [];

  constructor() {
    this.form = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rol: new FormControl('', [Validators.required]),
      telefono: new FormControl(''),
      punto_id: new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.currentUserRol = this.authService.getCurrentUser()?.rol || '';
    this.loadUsuarios();
    this.loadPuntosActivos();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.usuariosService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar usuarios');
        this.loading = false;
      }
    });
  }

  loadPuntosActivos(): void {
    this.puntosService.getActivos().subscribe({
      next: (data) => {
        this.puntosActivos = data;
        this.puntosSelect2Data = data.map(punto => ({
          value: punto.id_punto,
          label: `${punto.codigo} - ${punto.nombre}${punto.ciudad ? ` (${punto.ciudad})` : ''}`
        }));
      },
      error: () => {
        this.toast.error('Error al cargar puntos');
      }
    });
  }

  nuevoUsuario(): void {
    this.isEditMode = false;
    this.usuarioId = null;
    this.form.reset();
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();
    this.modalRef = this.modal.open(this.usuarioModal, { centered: true, size: 'lg' });
  }

  editarUsuario(id: number): void {
    this.isEditMode = true;
    this.usuarioId = id;
    this.form.reset();
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();

    this.usuariosService.getById(id).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          telefono: usuario.telefono || '',
          punto_id: usuario.punto_id
        });
        this.modalRef = this.modal.open(this.usuarioModal, { centered: true, size: 'lg' });
      },
      error: () => {
        this.toast.error('Error al cargar usuario');
      }
    });
  }

  onPuntoChange(value: any): void {
    const puntoId = value.value ? Number(value.value) : null;
    this.form.patchValue({ punto_id: puntoId });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const data = { ...this.form.value };

    if (this.isEditMode && !data.password) {
      delete data.password;
    }

    if (!data.punto_id) {
      delete data.punto_id;
    }

    if (!data.telefono) {
      delete data.telefono;
    }

    const request = this.isEditMode
      ? this.usuariosService.update(this.usuarioId!, data)
      : this.usuariosService.create(data);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'Usuario actualizado' : 'Usuario creado');
        this.modalRef?.close();
        this.loadUsuarios();
        this.submitting = false;
      },
      error: (error) => {
        const message = error.error?.message || 'Error al guardar usuario';
        this.toast.error(message);
        this.submitting = false;
      }
    });
  }

  cerrarModal(): void {
    this.modalRef?.close();
  }

  toggleEstado(usuario: IUsuario): void {
    if (usuario.activo) {
      this.usuariosService.delete(usuario.id_usuario).subscribe({
        next: () => {
          this.toast.success('Usuario desactivado');
          this.loadUsuarios();
        },
        error: () => this.toast.error('Error al desactivar usuario')
      });
    } else {
      this.usuariosService.activate(usuario.id_usuario).subscribe({
        next: () => {
          this.toast.success('Usuario activado');
          this.loadUsuarios();
        },
        error: () => this.toast.error('Error al activar usuario')
      });
    }
  }

  canDelete(): boolean {
    return this.currentUserRol === Rol.SUPER_ADMIN;
  }
}
