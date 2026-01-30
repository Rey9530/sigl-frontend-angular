import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { IUser } from '../../core/models/user.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit {
  private authService = inject(AuthService);
  private toast = inject(ToastrService);

  currentUser: IUser | null = null;

  // Formulario de nombre
  profileForm: FormGroup;
  submittingProfile = false;

  // Formulario de contraseña
  passwordForm: FormGroup;
  submittingPassword = false;
  showCurrentPassword = false;
  showNewPassword = false;

  constructor() {
    this.profileForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(2)])
    });

    this.passwordForm = new FormGroup({
      password_actual: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password_nueva: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmar_password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({ nombre: user.nombre });
      }
    });
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.submittingProfile = true;
    const { nombre } = this.profileForm.value;

    this.authService.actualizarPerfil({ nombre }).subscribe({
      next: () => {
        this.toast.success('Nombre actualizado correctamente');
        this.submittingProfile = false;
      },
      error: (error) => {
        const message = error.error?.message || 'Error al actualizar el nombre';
        this.toast.error(message);
        this.submittingProfile = false;
      }
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { password_actual, password_nueva, confirmar_password } = this.passwordForm.value;

    if (password_nueva !== confirmar_password) {
      this.toast.warning('Las contraseñas no coinciden');
      return;
    }

    this.submittingPassword = true;

    this.authService.cambiarPassword({ password_actual, password_nueva }).subscribe({
      next: () => {
        this.toast.success('Contraseña actualizada correctamente');
        this.passwordForm.reset();
        this.submittingPassword = false;
      },
      error: (error) => {
        const message = error.error?.message || 'Error al cambiar la contraseña';
        this.toast.error(message);
        this.submittingPassword = false;
      }
    });
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }
}
