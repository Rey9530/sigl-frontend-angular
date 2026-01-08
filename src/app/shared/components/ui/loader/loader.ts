import { Component } from "@angular/core";

@Component({
  selector: "app-loader",
  imports: [],
  templateUrl: "./loader.html",
  styleUrl: "./loader.scss",
})
export class Loader {
  public loaderHide: boolean = false;

  constructor() {
    setTimeout(() => {
      this.loaderHide = true;
    }, 2000);
  }
}
