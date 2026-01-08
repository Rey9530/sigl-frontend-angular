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
    main_title: "Administracion",
  },
  {
    title: "Usuarios",
    icon: "user",
    type: "link",
    path: "/usuarios",
    level: 1,
  },
];

// Array
export const items = new BehaviorSubject<IMenu[]>(menuItems);
