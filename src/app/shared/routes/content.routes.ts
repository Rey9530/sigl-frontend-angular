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
  {
    path: "recepciones",
    data: {
      title: "Recepciones",
      breadcrumb: "Recepciones",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.EMPLEADO_PUNTO])],
    loadComponent: () =>
      import("../../components/recepciones/recepciones-list/recepciones-list").then((m) => m.RecepcionesList),
  },
  {
    path: "recepciones/:id",
    data: {
      title: "Detalle Recepcion",
      breadcrumb: "Detalle",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.EMPLEADO_PUNTO])],
    loadComponent: () =>
      import("../../components/recepciones/recepcion-detalle/recepcion-detalle").then((m) => m.RecepcionDetalle),
  },
  {
    path: "paquetes",
    data: {
      title: "Paquetes",
      breadcrumb: "Paquetes",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.EMPLEADO_PUNTO])],
    loadComponent: () =>
      import("../../components/paquetes/paquetes-list/paquetes-list").then((m) => m.PaquetesList),
  },
  {
    path: "paquetes/:id",
    data: {
      title: "Detalle Paquete",
      breadcrumb: "Detalle",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.EMPLEADO_PUNTO])],
    loadComponent: () =>
      import("../../components/paquetes/paquete-detalle/paquete-detalle").then((m) => m.PaqueteDetalle),
  },
  // WhatsApp Chatbot
  {
    path: "whatsapp",
    data: {
      title: "WhatsApp",
      breadcrumb: "WhatsApp",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])],
    loadComponent: () =>
      import("../../components/whatsapp/whatsapp-dashboard/whatsapp-dashboard").then((m) => m.WhatsappDashboard),
  },
  {
    path: "inbox",
    data: {
      title: "Bandeja de Mensajes",
      breadcrumb: "Inbox",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.EMPLEADO_PUNTO])],
    loadComponent: () =>
      import("../../components/inbox/inbox-list/inbox-list").then((m) => m.InboxList),
  },
  {
    path: "inbox/:id",
    data: {
      title: "Conversacion",
      breadcrumb: "Detalle",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.EMPLEADO_PUNTO])],
    loadComponent: () =>
      import("../../components/inbox/conversation-detail/conversation-detail").then((m) => m.ConversationDetail),
  },
  {
    path: "faqs",
    data: {
      title: "Preguntas Frecuentes",
      breadcrumb: "FAQs",
    },
    canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])],
    loadComponent: () =>
      import("../../components/faqs/faqs-list/faqs-list").then((m) => m.FaqsList),
  },
];
