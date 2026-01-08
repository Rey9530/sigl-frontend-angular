import { Component, inject } from "@angular/core";

import { SvgIcon } from "../ui/svg-icon/svg-icon";
import { HeaderBookmark } from "./widgets/header-bookmark/header-bookmark";
import { HeaderCart } from "./widgets/header-cart/header-cart";
import { HeaderLanguage } from "./widgets/header-language/header-language";
import { HeaderLogo } from "./widgets/header-logo/header-logo";
import { HeaderNotice } from "./widgets/header-notice/header-notice";
import { HeaderNotification } from "./widgets/header-notification/header-notification";
import { Mode } from "./widgets/mode/mode";
import { Profile } from "./widgets/profile/profile";
import { Search } from "./widgets/search/search";
import { ToggleScreen } from "./widgets/toggle-screen/toggle-screen";
import { NavService } from "../../services/nav.service";

@Component({
  selector: "app-header",
  imports: [
    HeaderLogo,
    HeaderNotice,
    HeaderLanguage,
    ToggleScreen,
    SvgIcon,
    Search,
    HeaderBookmark,
    Mode,
    HeaderCart,
    HeaderNotification,
    Profile,
  ],
  templateUrl: "./header.html",
  styleUrl: "./header.scss",
})
export class Header {
  private navService = inject(NavService);

  toggleLanguage() {
    this.navService.isLanguage = !this.navService.isLanguage;
  }

  clickOutside() {
    this.navService.isLanguage = false;
  }

  openSearch() {
    this.navService.isSearchOpen = true;
  }
}
