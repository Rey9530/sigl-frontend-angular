import { Routes } from "@angular/router";
import { authGuard, publicGuard } from "./core/guards/auth.guard";
import { content } from "./shared/routes/content.routes";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full",
  },
  {
    path: "auth/login",
    loadComponent: () =>
      import("./auth/login/login").then((m) => m.Login),
    canActivate: [publicGuard],
  },
  {
    path: "",
    loadComponent: () =>
      import("./shared/components/layout/content/content").then(
        (m) => m.Content,
      ),
    canActivate: [authGuard],
    children: content,
  },
  {
    path: "**",
    redirectTo: "/home",
  },
];
