import { Routes } from "@angular/router";
import { roleGuard } from "../../core/guards/role.guard";
import { Rol } from "../../core/models/usuario.model";

export const content: Routes = [
  {
    path: "home",
    data: {
      title: "Inicio",
      breadcrumb: "Inicio",
    },
    loadComponent: () =>
      import("../../components/home/home").then((m) => m.Home),
  },
  {
    path: "usuarios",
    data: {
      title: "Usuarios",
      breadcrumb: "Usuarios",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])],
    loadComponent: () =>
      import("../../components/usuarios/usuarios-list/usuarios-list").then((m) => m.UsuariosList),
  },
  {
    path: "usuarios/nuevo",
    data: {
      title: "Nuevo Usuario",
      breadcrumb: "Nuevo Usuario",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])],
    loadComponent: () =>
      import("../../components/usuarios/usuario-form/usuario-form").then((m) => m.UsuarioForm),
  },
  {
    path: "usuarios/editar/:id",
    data: {
      title: "Editar Usuario",
      breadcrumb: "Editar Usuario",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])],
    loadComponent: () =>
      import("../../components/usuarios/usuario-form/usuario-form").then((m) => m.UsuarioForm),
  },
  // Puntos routes
  {
    path: "puntos",
    data: {
      title: "Puntos de Servicio",
      breadcrumb: "Puntos",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])],
    loadComponent: () =>
      import("../../components/puntos/puntos-list/puntos-list").then((m) => m.PuntosList),
  },
  {
    path: "puntos/nuevo",
    data: {
      title: "Nuevo Punto",
      breadcrumb: "Nuevo Punto",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])],
    loadComponent: () =>
      import("../../components/puntos/punto-form/punto-form").then((m) => m.PuntoForm),
  },
  {
    path: "puntos/editar/:id",
    data: {
      title: "Editar Punto",
      breadcrumb: "Editar Punto",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])],
    loadComponent: () =>
      import("../../components/puntos/punto-form/punto-form").then((m) => m.PuntoForm),
  },
];
