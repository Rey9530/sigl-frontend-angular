# Normas de Desarrollo - Frontend Angular

Este documento establece las reglas y convenciones que se deben seguir para el desarrollo del frontend del Sistema Logistico.

---

## 1. Modales para Formularios CRUD

**REGLA:** Los formularios de crear y editar registros deben implementarse como modales dentro del mismo componente de lista, NO como componentes separados.

### Por que?
- Evita navegacion innecesaria entre paginas
- Mantiene el codigo centralizado en un solo archivo
- Facilita la lectura y mantenimiento del codigo
- Mejora la experiencia de usuario

### Implementacion

#### 1.1 Estructura del Componente

```typescript
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ejemplo-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ejemplo-list.html',
  styleUrl: './ejemplo-list.scss'
})
export class EjemploList implements OnInit {
  @ViewChild('ejemploModal') ejemploModal!: TemplateRef<any>;

  private modal = inject(NgbModal);

  // Variables para el modal
  form: FormGroup;
  isEditMode = false;
  registroId: number | null = null;
  submitting = false;
  modalRef: NgbModalRef | null = null;

  constructor() {
    this.form = new FormGroup({
      campo1: new FormControl('', [Validators.required]),
      campo2: new FormControl('', [Validators.required]),
    });
  }

  // Abrir modal para nuevo registro
  nuevoRegistro(): void {
    this.isEditMode = false;
    this.registroId = null;
    this.form.reset();
    this.modalRef = this.modal.open(this.ejemploModal, { centered: true, size: 'lg' });
  }

  // Abrir modal para editar
  editarRegistro(id: number): void {
    this.isEditMode = true;
    this.registroId = id;
    this.form.reset();

    // Cargar datos del registro
    this.servicio.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.modalRef = this.modal.open(this.ejemploModal, { centered: true, size: 'lg' });
      },
      error: () => this.toast.error('Error al cargar registro')
    });
  }

  // Guardar (crear o actualizar)
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const data = { ...this.form.value };

    const request = this.isEditMode
      ? this.servicio.update(this.registroId!, data)
      : this.servicio.create(data);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'Actualizado' : 'Creado');
        this.modalRef?.close();
        this.loadRegistros();
        this.submitting = false;
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Error al guardar');
        this.submitting = false;
      }
    });
  }

  cerrarModal(): void {
    this.modalRef?.close();
  }
}
```

#### 1.2 Estructura del Template HTML

```html
<!-- Lista de registros -->
<div class="container-fluid">
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5>Titulo</h5>
      <button class="btn btn-primary" (click)="nuevoRegistro()">
        <i class="fa fa-plus me-2"></i>Nuevo
      </button>
    </div>
    <div class="card-body">
      <!-- Tabla con registros -->
    </div>
  </div>
</div>

<!-- Modal del formulario -->
<ng-template #ejemploModal>
  <div class="modal-header">
    <h5 class="modal-title">{{ isEditMode ? 'Editar' : 'Nuevo' }}</h5>
    <button type="button" class="btn-close" (click)="cerrarModal()"></button>
  </div>
  <div class="modal-body">
    <form [formGroup]="form">
      <!-- Campos del formulario -->
    </form>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
    <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="submitting">
      @if (submitting) {
        <span class="spinner-border spinner-border-sm me-1"></span>
      }
      {{ isEditMode ? 'Actualizar' : 'Crear' }}
    </button>
  </div>
</ng-template>
```

#### 1.3 Opciones del Modal

```typescript
// Modal centrado y grande
this.modal.open(this.ejemploModal, { centered: true, size: 'lg' });

// Modal extra grande
this.modal.open(this.ejemploModal, { centered: true, size: 'xl' });

// Modal que no se cierra al hacer clic fuera
this.modal.open(this.ejemploModal, { centered: true, backdrop: 'static' });
```

### Ejemplos en el Proyecto

- `usuarios-list.ts` / `usuarios-list.html` - CRUD de usuarios con modal
- `puntos-list.ts` / `puntos-list.html` - CRUD de puntos con modal

---

## 2. Selectores con Busqueda (Select2)

**REGLA:** Para campos de seleccion que requieran busqueda o contengan muchas opciones, se debe usar el componente `ng-select2-component` en lugar de `<select>` nativo.

### Por que?
- Permite busqueda rapida entre opciones
- Mejor experiencia de usuario con muchos datos
- Interfaz consistente en toda la aplicacion
- Soporte para datos dinamicos desde el backend

### Implementacion

#### 2.1 Importar el Modulo

```typescript
import { Select2Module, Select2Data } from 'ng-select2-component';

@Component({
  selector: 'app-ejemplo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Select2Module],
  // ...
})
```

#### 2.2 Preparar los Datos

Los datos deben transformarse al formato `Select2Data`:

```typescript
// En el componente
datos: Select2Data = [];

// Cargar datos desde el backend
loadDatos(): void {
  this.servicio.getActivos().subscribe({
    next: (data) => {
      // Transformar al formato Select2Data
      this.datos = data.map(item => ({
        value: item.id,
        label: `${item.codigo} - ${item.nombre}`
      }));
    }
  });
}
```

#### 2.3 Uso en el Template

```html
<div class="mb-3">
  <label class="form-label">Campo de Seleccion</label>
  <select2
    [data]="datos"
    [value]="form.get('campo_id')?.value"
    [placeholder]="'Seleccione una opcion'"
    (update)="onCampoChange($event)"
  ></select2>
  <small class="text-muted">Descripcion del campo</small>
</div>
```

#### 2.4 Manejar el Cambio de Valor

```typescript
onCampoChange(value: any): void {
  const id = value.value ? Number(value.value) : null;
  this.form.patchValue({ campo_id: id });
}
```

### Cuando Usar Select2

| Escenario | Usar Select2 | Usar Select Nativo |
|-----------|--------------|-------------------|
| Datos del backend (usuarios, puntos, etc.) | Si | No |
| Mas de 10 opciones | Si | No |
| Necesita busqueda | Si | No |
| Opciones estaticas simples (< 10) | No | Si |
| Enums con pocas opciones | No | Si |

### Ejemplos en el Proyecto

- `usuarios-list.ts` - Selector de puntos asignados
- Endpoint usado: `GET /puntos/activos` (retorna solo puntos activos para selectores)

---

## 3. Proximas Normas

(Agregar nuevas normas aqui conforme se definan)

---

## Historial de Cambios

| Fecha | Descripcion |
|-------|-------------|
| 2026-01-09 | Agregada norma de modales para CRUD |
| 2026-01-09 | Agregada norma de selectores con Select2 |
