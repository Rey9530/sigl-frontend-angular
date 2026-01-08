import { DecimalPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";

import { CartService } from "../../../../services/cart.service";
import { FeatherIcon } from "../../../ui/feather-icon/feather-icon";
import { SvgIcon } from "../../../ui/svg-icon/svg-icon";

@Component({
  selector: "app-header-cart",
  imports: [RouterModule, SvgIcon, FeatherIcon, DecimalPipe],
  templateUrl: "./header-cart.html",
  styleUrl: "./header-cart.scss",
})
export class HeaderCart {
  cartService = inject(CartService);
}
