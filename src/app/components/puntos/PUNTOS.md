# Modulo: Puntos de Servicio (Frontend Angular)

## Descripcion
Gestion de puntos de servicio (sucursales) del sistema logistico SIGL.
Cada punto representa una ubicacion fisica donde se reciben/entregan paquetes.

## Estructura de Archivos

```
src/app/
├── core/
│   ├── models/
│   │   └── punto.model.ts          # Interfaces y tipos
│   └── services/
│       └── puntos.service.ts       # Servicio HTTP
└── components/
    └── puntos/
        ├── puntos-list/
        │   ├── puntos-list.ts      # Componente lista
        │   ├── puntos-list.html    # Template
        │   └── puntos-list.scss    # Estilos
        ├── punto-form/
        │   ├── punto-form.ts       # Componente formulario
        │   ├── punto-form.html     # Template
        │   └── punto-form.scss     # Estilos
        └── PUNTOS.md               # Esta documentacion
```

## Rutas

| Ruta | Componente | Roles | Descripcion |
|------|------------|-------|-------------|
| `/puntos` | PuntosList | ADMIN+ | Listado de puntos |
| `/puntos/nuevo` | PuntoForm | ADMIN+ | Crear nuevo punto |
| `/puntos/editar/:id` | PuntoForm | ADMIN+ | Editar punto existente |

## Interfaces (punto.model.ts)

### IPunto
```typescript
interface IPunto {
  id_punto: number;
  nombre: string;
  codigo: string;
  direccion: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  horario?: string;
  activo: boolean;
  creado_en: string;
  _count?: {
    usuarios: number;
    paquetes_origen?: number;
    paquetes_destino?: number;
  };
}
```

### IPuntoActivo (para selects/combos)
```typescript
interface IPuntoActivo {
  id_punto: number;
  nombre: string;
  codigo: string;
  ciudad?: string;
  departamento?: string;
}
```

### ICreatePunto / IUpdatePunto
DTOs para crear y actualizar puntos.

## Servicio (puntos.service.ts)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `getAll()` | GET /api/puntos | Lista todos los puntos |
| `getActivos()` | GET /api/puntos/activos | Solo puntos activos |
| `getById(id)` | GET /api/puntos/:id | Detalle de un punto |
| `create(data)` | POST /api/puntos | Crear punto |
| `update(id, data)` | PUT /api/puntos/:id | Actualizar punto |
| `delete(id)` | DELETE /api/puntos/:id | Desactivar punto |
| `activate(id)` | PATCH /api/puntos/:id/activar | Reactivar punto |

## Componentes

### PuntosList
Lista todos los puntos de servicio en una tabla con:
- Codigo (badge)
- Nombre
- Ciudad
- Departamento
- Telefono
- Cantidad de usuarios asignados
- Estado (Activo/Inactivo)
- Acciones (Editar, Activar/Desactivar)

**Permisos:**
- Solo SUPER_ADMIN y ADMINISTRADOR pueden acceder
- Solo SUPER_ADMIN puede eliminar (desactivar)

### PuntoForm
Formulario para crear/editar puntos con los campos:
- Nombre* (requerido, min 2 caracteres)
- Codigo* (requerido, min 2, max 10 caracteres)
- Direccion* (requerido, min 5 caracteres)
- Ciudad (opcional)
- Departamento (select con 14 departamentos de El Salvador)
- Telefono (opcional)
- Email (opcional, validacion de formato)
- Horario de atencion (opcional)
- Latitud/Longitud (opcional, coordenadas GPS)

## Departamentos de El Salvador

El sistema incluye los 14 departamentos:
- San Salvador
- Santa Ana
- San Miguel
- La Libertad
- Usulutan
- Sonsonate
- La Union
- La Paz
- Chalatenango
- Cuscatlan
- Ahuachapan
- Morazan
- San Vicente
- Cabanas

## Menu de Navegacion

El modulo aparece en el sidebar bajo "Administracion" con icono `map-pin`.

## Dependencias

- CommonModule
- ReactiveFormsModule
- Router, ActivatedRoute
- ToastrService (ngx-toastr)
- HttpClient (via PuntosService)
- AuthService (para verificar roles)
