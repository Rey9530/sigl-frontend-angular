import { Component, inject } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from "@angular/router";

import { filter, map } from "rxjs";

import { SvgIcon } from "../svg-icon/svg-icon";

@Component({
  selector: "app-breadcrumbs",
  imports: [RouterModule, SvgIcon],
  templateUrl: "./breadcrumbs.html",
  styleUrl: "./breadcrumbs.scss",
})
export class Breadcrumbs {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  public title: string;
  public breadcrumbs: {
    parentBreadcrumb?: string;
    childBreadcrumb?: string;
  } = {};

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === "primary"),
      )
      .subscribe((route) => {
        const routeSnapshot = route.snapshot;

        this.breadcrumbs = {
          parentBreadcrumb: route.parent?.snapshot.data["breadcrumb"] || "",
          childBreadcrumb: routeSnapshot.data["breadcrumb"] || "",
        };

        this.title = routeSnapshot.data["title"] || "";
      });
  }
}
