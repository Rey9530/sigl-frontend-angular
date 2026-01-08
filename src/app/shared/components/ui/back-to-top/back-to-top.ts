import { ViewportScroller } from "@angular/common";
import { Component, HostListener, inject } from "@angular/core";

import { FeatherIcon } from "../feather-icon/feather-icon";

@Component({
  selector: "app-back-to-top",
  imports: [FeatherIcon],
  templateUrl: "./back-to-top.html",
  styleUrl: "./back-to-top.scss",
})
export class BackToTop {
  private viewScroller = inject(ViewportScroller);

  public show: boolean = false;

  @HostListener("window:scroll", [])
  onWindowScroll() {
    let number =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    if (number > 400) {
      this.show = true;
    } else {
      this.show = false;
    }
  }

  backToTop() {
    this.viewScroller.scrollToPosition([0, 0]);
  }
}
