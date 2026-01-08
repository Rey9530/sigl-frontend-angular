import { Component, DOCUMENT, inject } from "@angular/core";

import { NavService } from "../../../../services/nav.service";
import { SvgIcon } from "../../../ui/svg-icon/svg-icon";

@Component({
  selector: "app-toggle-screen",
  imports: [SvgIcon],
  templateUrl: "./toggle-screen.html",
  styleUrl: "./toggle-screen.scss",
})
export class ToggleScreen {
  private document = inject(DOCUMENT);
  private navService = inject(NavService);

  public elem: HTMLElement;
  public url: string;

  constructor() {
    const document = this.document;

    this.elem = document.documentElement;
  }

  toggleScreen() {
    this.navService.fullScreen = !this.navService.fullScreen;

    if (this.navService.fullScreen) {
      if (this.elem.requestFullscreen) {
        this.elem.requestFullscreen();
      } else if ("mozRequestFullScreen" in this.elem) {
        (
          this.elem as HTMLElement & {
            mozRequestFullScreen: () => Promise<void>;
          }
        ).mozRequestFullScreen();
      } else if ("webkitRequestFullscreen" in this.elem) {
        (
          this.elem as HTMLElement & {
            webkitRequestFullscreen: () => Promise<void>;
          }
        ).webkitRequestFullscreen();
      } else if ("msRequestFullscreen" in this.elem) {
        (
          this.elem as HTMLElement & {
            msRequestFullscreen: () => Promise<void>;
          }
        ).msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if ("mozCancelFullScreen" in this.document) {
        (
          this.document as Document & {
            mozCancelFullScreen: () => Promise<void>;
          }
        ).mozCancelFullScreen();
      } else if ("webkitExitFullscreen" in this.document) {
        (
          this.document as Document & {
            webkitExitFullscreen: () => Promise<void>;
          }
        ).webkitExitFullscreen();
      } else if ("msExitFullscreen" in this.document) {
        (
          this.document as Document & { msExitFullscreen: () => Promise<void> }
        ).msExitFullscreen();
      }
    }
  }
}
