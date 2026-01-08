import { Component, inject } from "@angular/core";

import { LayoutService } from "../../../../services/layout.service";
import { SvgIcon } from "../../../ui/svg-icon/svg-icon";

@Component({
  selector: "app-mode",
  imports: [SvgIcon],
  templateUrl: "./mode.html",
  styleUrl: "./mode.scss",
})
export class Mode {
  private layout = inject(LayoutService);

  public dark: boolean;
  public layoutVersion = localStorage.getItem("layout_version");

  constructor() {
    this.dark =
      this.layout.config.settings.layout_version == "dark-only" ? true : false;

    if (this.layoutVersion != null) {
      this.layout.config.settings.layout_version = this.layoutVersion;
      document.body.className = this.layout.config.settings.layout_version;
    }
  }

  toggleMode() {
    this.dark = !this.dark;
    if (this.dark) {
      document.body.classList.add("dark-only");
      this.layout.config.settings.layout_version = "dark-only";
    } else {
      document.body.classList.remove("dark-only");
      this.layout.config.settings.layout_version = "light-only";
    }
    localStorage.setItem(
      "layout_version",
      this.layout.config.settings.layout_version,
    );
  }
}
