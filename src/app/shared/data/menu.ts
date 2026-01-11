import { BehaviorSubject } from "rxjs";

import { IMenu } from "../interface/menu";

export const menuItems: IMenu[] = [
  {
    main_title: "General",
  },
  {
    title: "Inicio",
    icon: "home",
    type: "link",
    path: "/home",
    level: 1,
    active: true,
  },
  // {
  //   main_title: "",
  // },

  {
    title: 'Operaciones',
    id: 'operaciones',
    icon: 'package',
    type: 'sub',
    active: false,
    level: 1,
    children: [
      {
        title: "Recepciones", 
        path: "/recepciones",
        id: 'general-widgets',
      },
      {
        title: "Paquetes", 
        path: "/paquetes",
        id: 'chart-widgets',
      },
    ],
  },
  // {
  //   main_title: "Sistema",
  // },
  {
    title: 'WhatsApp',
    id: 'whatsapp',
    icon: 'chat',
    type: 'sub',
    active: false,
    level: 1,
    children: [
      {
        title: 'Bandeja de Mensajes',
        path: '/inbox',
        type: 'link',
        id: 'inbox',
      },
      {
        title: 'Conexiones',
        path: '/whatsapp',
        type: 'link',
        id: 'whatsapp-dashboard',
      },
      {
        title: 'FAQs',
        path: '/faqs',
        type: 'link',
        id: 'faqs',
      },
    ],
  },
  {
    title: 'Administracion',
    id: 'administracion',
    icon: 'widget',
    type: 'sub',
    active: false,
    level: 1,
    children: [
      {
        title: 'Usuarios',
        path: '/usuarios',
        type: 'link',
        id: 'general-widgets',
      },
      {
        title: 'Puntos de Servicio',
        path: '/puntos',
        type: 'link',
        id: 'chart-widgets',
      },
    ],
  },
];

// Array
export const items = new BehaviorSubject<IMenu[]>(menuItems);
