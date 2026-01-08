import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { NavigationEnd, Router, RouterModule } from "@angular/router";

import { TranslatePipe } from "@ngx-translate/core";

import { items, menuItems } from "../../data/menu";
import { IMenu } from "../../interface/menu";
import { LayoutService } from "../../services/layout.service";
import { HeaderLogo } from "../header/widgets/header-logo/header-logo";
import { FeatherIcon } from "../ui/feather-icon/feather-icon";
import { SvgIcon } from "../ui/svg-icon/svg-icon";

@Component({
  selector: "app-sidebar",
  imports: [
    CommonModule,
    RouterModule,
    HeaderLogo,
    FeatherIcon,
    SvgIcon,
    TranslatePipe,
  ],
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.scss",
})
export class Sidebar {
  private router = inject(Router);
  layoutService = inject(LayoutService);

  public menuItems = menuItems;
  public items = items;
  public leftArrow: boolean = false;
  public rightArrow: boolean = true;
  public pinedItem: IMenu[] = [];

  constructor() {
    this.items.subscribe((menuItems) => {
      this.menuItems = menuItems;
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const urlTree = this.router.parseUrl(event.url);
          const cleanPath =
            "/" +
            urlTree.root.children["primary"]?.segments
              .map((segment) => segment.path)
              .join("/");

          menuItems.filter((items) => {
            if (items.path === cleanPath) {
              this.setNavActive(items);
            }
            if (!items.children) {
              return false;
            }
            items.children.filter((subItems) => {
              if (subItems.path === cleanPath) {
                this.setNavActive(subItems);
              }
              if (!subItems.children) {
                return false;
              }
              subItems.children.filter((subSubItems) => {
                if (subSubItems.path === cleanPath) {
                  this.setNavActive(subSubItems);
                }
              });
            });
          });
        }
      });
    });
  }

  setNavActive(items: IMenu) {
    this.menuItems.filter((menuItem) => {
      if (menuItem !== items) {
        menuItem.active = false;
      } else {
        menuItem.active = true;
        setTimeout(() => {
          this.scroll(items);
        }, 2000);
      }

      if (menuItem.children && menuItem.children.includes(items)) {
        menuItem.active = true;
        setTimeout(() => {
          this.scroll(menuItem);
        }, 2000);
      }

      if (menuItem.children) {
        menuItem.children.filter((submenuItems) => {
          if (submenuItems.children && submenuItems.children.includes(items)) {
            menuItem.active = true;
            submenuItems.active = true;
            setTimeout(() => {
              this.scroll(menuItem);
            }, 2000);
          }
        });
      }
    });
  }

  toggleMenu(item: IMenu) {
    if (!item.active) {
      this.menuItems.forEach((menu) => {
        if (this.menuItems.includes(item)) {
          menu.active = false;
        }
        if (!menu.children) {
          return false;
        }

        menu.children.forEach((subMenu) => {
          if (menu.children?.includes(item)) {
            subMenu.active = false;
          }

          if (subMenu.children) {
            subMenu.children.forEach((details) => {
              if (subMenu.children?.includes(item)) {
                details.active = false;
              }
            });
          }
        });
      });
    }
    item.active = !item.active;
  }

  scrollLeft() {
    this.rightArrow = true;
    if (this.layoutService.margin != 0) {
      this.layoutService.margin = this.layoutService.margin + 500;
    }

    if (this.layoutService.margin == 0) {
      this.leftArrow = false;
    }
  }

  scrollRight() {
    this.leftArrow = true;
    if (this.layoutService.margin != this.layoutService.scrollMargin) {
      this.layoutService.margin = this.layoutService.margin - 500;
    }
    if (this.layoutService.margin == this.layoutService.scrollMargin) {
      this.rightArrow = false;
    }
  }

  closeSidebar() {
    this.layoutService.closeSidebar = true;
  }

  pined(item: IMenu) {
    if (!item.pined) {
      this.menuItems.filter((details) => {
        if (details.title) {
          if (this.menuItems.includes(item)) {
            item.pined = true;
            if (!this.pinedItem.includes(item)) {
              this.pinedItem.push(item);
            }
          }
        }
      });
    } else {
      item.pined = false;
      this.pinedItem.splice(this.pinedItem.indexOf(item), 1);
    }

    this.scroll(item);
  }

  scroll(item: IMenu) {
    if (item && item.id) {
      const scrollDiv = document.getElementById(item.id);
      if (scrollDiv) {
        setTimeout(() => {
          scrollDiv.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }
}
