import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Rol, RolLabels } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss'
})
export class UsuarioForm implements OnInit {
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastrService);

  form: FormGroup;
  isEditMode = false;
  usuarioId: number | null = null;
  loading = false;
  submitting = false;

  roles = Object.values(Rol);
  readonly RolLabels = RolLabels;

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
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.usuarioId = +id;
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.loadUsuario();
    }
  }

  loadUsuario(): void {
    if (!this.usuarioId) return;

    this.loading = true;
    this.usuariosService.getById(this.usuarioId).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          telefono: usuario.telefono || '',
          punto_id: usuario.punto_id
        });
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar usuario');
        this.router.navigate(['/usuarios']);
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
        this.router.navigate(['/usuarios']);
      },
      error: (error) => {
        const message = error.error?.message || 'Error al guardar usuario';
        this.toast.error(message);
        this.submitting = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }
}
