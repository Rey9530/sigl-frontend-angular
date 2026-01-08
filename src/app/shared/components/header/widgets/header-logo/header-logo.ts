import { Component, ViewEncapsulation, input, inject } from "@angular/core";
import { RouterModule } from "@angular/router";

import { LayoutService } from "../../../../services/layout.service";
import { FeatherIcon } from "../../../ui/feather-icon/feather-icon";

@Component({
  selector: "app-header-logo",
  imports: [RouterModule, FeatherIcon],
  templateUrl: "./header-logo.html",
  styleUrls: ["./header-logo.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderLogo {
  layoutService = inject(LayoutService);

  readonly icon = input<string>();
  readonly type = input<string>();

  toggleSidebar() {
    this.layoutService.closeSidebar = !this.layoutService.closeSidebar;
  }
}
