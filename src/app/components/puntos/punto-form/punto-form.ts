import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PuntosService } from '../../../core/services/puntos.service';
import { Departamentos } from '../../../core/models/punto.model';

@Component({
  selector: 'app-punto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './punto-form.html',
  styleUrl: './punto-form.scss'
})
export class PuntoForm implements OnInit {
  private puntosService = inject(PuntosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastrService);

  form: FormGroup;
  isEditMode = false;
  puntoId: number | null = null;
  loading = false;
  submitting = false;

  departamentos = Departamentos;

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
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.puntoId = +id;
      this.loadPunto();
    }
  }

  loadPunto(): void {
    if (!this.puntoId) return;

    this.loading = true;
    this.puntosService.getById(this.puntoId).subscribe({
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
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar punto');
        this.router.navigate(['/puntos']);
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
        this.router.navigate(['/puntos']);
      },
      error: (error) => {
        const message = error.error?.message || 'Error al guardar punto';
        this.toast.error(message);
        this.submitting = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/puntos']);
  }
}
