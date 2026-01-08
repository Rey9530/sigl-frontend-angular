import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { IUsuario, Rol, RolLabels } from '../../../core/models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.scss'
})
export class UsuariosList implements OnInit {
  private usuariosService = inject(UsuariosService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastrService);

  usuarios: IUsuario[] = [];
  loading = false;
  currentUserRol: string = '';

  readonly RolLabels = RolLabels;
  readonly Rol = Rol;

  ngOnInit(): void {
    this.currentUserRol = this.authService.getCurrentUser()?.rol || '';
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.usuariosService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: (error) => {
        this.toast.error('Error al cargar usuarios');
        this.loading = false;
      }
    });
  }

  nuevoUsuario(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  editarUsuario(id: number): void {
    this.router.navigate(['/usuarios/editar', id]);
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
