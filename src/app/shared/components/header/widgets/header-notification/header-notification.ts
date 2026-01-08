import { Component } from "@angular/core";

import { notification } from "../../../../data/header";
import { SvgIcon } from "../../../ui/svg-icon/svg-icon";

@Component({
  selector: "app-header-notification",
  imports: [SvgIcon],
  templateUrl: "./header-notification.html",
  styleUrl: "./header-notification.scss",
})
export class HeaderNotification {
  public notifications = notification;

  removeNotification(id: number) {
    const index = this.notifications.findIndex(
      (notification) => notification.id === id,
    );

    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }
}
