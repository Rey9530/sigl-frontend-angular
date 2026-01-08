import { NgClass } from "@angular/common";
import { Component, HostListener, inject } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from "@angular/router";

import { LayoutService } from "../../../services/layout.service";
import { Footer } from "../../footer/footer";
import { Header } from "../../header/header";
import { Sidebar } from "../../sidebar/sidebar";
import { Breadcrumbs } from "../../ui/breadcrumbs/breadcrumbs";

@Component({
  selector: "app-content",
  imports: [RouterOutlet, Header, Sidebar, Breadcrumbs, Footer, NgClass],
  templateUrl: "./content.html",
  styleUrl: "./content.scss",
})
export class Content {
  layoutService = inject(LayoutService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public layout: string;

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 800);
      }
    });

    this.layout = this.layoutService.config.settings.layout;

    this.route.queryParams.subscribe((params) => {
      this.layout = params["layout"];

      if (this.layout) {
        localStorage.setItem("layout", this.layout);
        this.layoutService.config.settings.layout = this.layout;
      }
    });

    if (window.innerWidth < 1200) {
      this.layoutService.closeSidebar = true;
    } else {
      this.layoutService.closeSidebar = false;
    }

    if (window.innerWidth <= 992) {
      this.layoutService.config.settings.sidebar_type = "compact-wrapper";
    } else {
      this.layoutService.config.settings.sidebar_type =
        this.layoutService.config.settings.sidebar_type;
    }
  }

  @HostListener("window:resize")
  onResize() {
    if (window.innerWidth < 1200) {
      this.layoutService.closeSidebar = true;
    } else {
      this.layoutService.closeSidebar = false;
    }
    if (window.innerWidth <= 992) {
      this.layoutService.config.settings.sidebar_type = "compact-wrapper";
    } else {
      this.layoutService.config.settings.sidebar_type =
        this.layoutService.config.settings.sidebar_type;
    }
  }
}
