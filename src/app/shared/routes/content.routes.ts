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
    path: "puntos",
    data: {
      title: "Puntos de Servicio",
      breadcrumb: "Puntos",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])],
    loadComponent: () =>
      import("../../components/puntos/puntos-list/puntos-list").then((m) => m.PuntosList),
  },
];
