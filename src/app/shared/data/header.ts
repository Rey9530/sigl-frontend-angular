import { ILanguage, INotification } from "../interface/header";

export const language: ILanguage[] = [
  {
    id: 1,
    name: "English",
    code: "en",
    icon: "us",
    country_code: "US",
    active: true,
  },
  {
    id: 2,
    name: "Deutsch",
    code: "de",
    icon: "de",
  },
  {
    id: 3,
    name: "Español",
    code: "es",
    icon: "es",
  },
  {
    id: 4,
    name: "Français",
    code: "fr",
    icon: "fr",
  },
  {
    id: 5,
    name: "Português",
    code: "pt",
    icon: "pt",
    country_code: "BR",
  },
  {
    id: 6,
    name: "简体中文",
    code: "cn",
    icon: "cn",
  },
  {
    id: 7,
    name: "لعربية",
    code: "ae",
    icon: "ae",
    country_code: "ae",
  },
];

export const notification: INotification[] = [
  {
    id: 1,
    message: "Delivery processing",
    border_color: "primary",
  },
  {
    id: 2,
    message: "Order Complete",
    border_color: "success",
  },
  {
    id: 3,
    message: "Tickets Generated",
    border_color: "secondary",
  },
  {
    id: 4,
    message: "Delivery Complete",
    border_color: "warning",
  },
];

export const profile = [
  {
    id: 1,
    title: "Mi Perfil",
    icon: "user",
    path: "/perfil",
  },
];
