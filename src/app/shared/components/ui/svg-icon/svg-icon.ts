import { NgClass } from "@angular/common";
import { Component, inject, input } from "@angular/core";

import { LayoutService } from "../../../services/layout.service";

@Component({
  selector: "app-svg-icon",
  imports: [NgClass],
  templateUrl: "./svg-icon.html",
  styleUrl: "./svg-icon.scss",
})
export class SvgIcon {
  layoutService = inject(LayoutService);

  public readonly icon = input<string | undefined>();
  readonly class = input<string | undefined>(undefined, { alias: "class" });

  readonly change = input<boolean>(false);

  getSvgType() {
    return (
      document
        .getElementsByClassName("page-sub-header")[0]
        .getAttribute("icon") == "stroke-svg"
    );
  }
}
