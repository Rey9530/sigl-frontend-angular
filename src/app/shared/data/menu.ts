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
