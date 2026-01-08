import { Component, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from "@angular/router";

import { NgbRatingConfig } from "@ng-bootstrap/ng-bootstrap";
import { filter, map } from "rxjs";

import { BackToTop } from "./shared/components/ui/back-to-top/back-to-top";
import { Loader } from "./shared/components/ui/loader/loader";
import { LayoutService } from "./shared/services/layout.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, Loader, BackToTop],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {
  private config = inject(NgbRatingConfig);
  layoutService = inject(LayoutService);
  private router = inject(Router);
  private titleService = inject(Title);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.config.max = 5;
    this.config.readonly = true;
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute.firstChild;
          while (route?.firstChild) {
            route = route.firstChild;
          }

          const pageTitle =
            route?.snapshot.data["pageTitle"] || route?.snapshot.data["title"];
          return pageTitle ? `${pageTitle} | Cuba Angular` : "Cuba Angular";
        }),
      )
      .subscribe((title) => {
        this.titleService.setTitle(title);
      });
  }
}
