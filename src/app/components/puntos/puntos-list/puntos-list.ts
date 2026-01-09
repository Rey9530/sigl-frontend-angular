import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PuntosService } from '../../../core/services/puntos.service';
import { IPunto } from '../../../core/models/punto.model';
import { AuthService } from '../../../core/services/auth.service';
import { Rol } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-puntos-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './puntos-list.html',
  styleUrl: './puntos-list.scss'
})
export class PuntosList implements OnInit {
  private puntosService = inject(PuntosService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastrService);

  puntos: IPunto[] = [];
  loading = false;
  currentUserRol: string = '';

  readonly Rol = Rol;

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
    this.router.navigate(['/puntos/nuevo']);
  }

  editarPunto(id: number): void {
    this.router.navigate(['/puntos/editar', id]);
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
