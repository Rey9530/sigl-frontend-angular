# Sistema Logistico - Frontend Angular

Frontend del Sistema Logistico desarrollado con Angular 20.

## Requisitos

- Node.js 18+
- Angular CLI 20.1.0

## Instalacion

```bash
npm install
```

## Servidor de Desarrollo

```bash
ng serve
```

Abrir navegador en `http://localhost:4200/`

## Build de Produccion

```bash
ng build
```

Los archivos se generan en el directorio `dist/`.

## Estructura del Proyecto

```
src/app/
├── core/                    # Servicios, modelos, guards, interceptors
│   ├── models/              # Interfaces y tipos
│   ├── services/            # Servicios HTTP
│   ├── guards/              # Guards de rutas
│   └── interceptors/        # Interceptors HTTP
├── components/              # Componentes de la aplicacion
│   ├── usuarios/            # Modulo de usuarios
│   ├── puntos/              # Modulo de puntos de servicio
│   └── ...
├── shared/                  # Componentes y utilidades compartidas
└── layouts/                 # Layouts de la aplicacion
```

## Modulos Principales

- **Usuarios**: Gestion de usuarios del sistema (CRUD con modal)
- **Puntos**: Gestion de puntos de servicio (CRUD con modal)

## Documentacion

- [Normas de Desarrollo](./NORMAS_DESARROLLO.md) - Reglas y convenciones para el desarrollo
