import { NgClass } from "@angular/common";
import { Component, inject } from "@angular/core";

import { TranslateService } from "@ngx-translate/core";

import { language } from "../../../../data/header";
import { ILanguage } from "../../../../interface/header";
import { NavService } from "../../../../services/nav.service";

@Component({
  selector: "app-header-language",
  imports: [NgClass],
  templateUrl: "./header-language.html",
  styleUrl: "./header-language.scss",
})
export class HeaderLanguage {
  navService = inject(NavService);
  private translate = inject(TranslateService);

  public languages = language;
  public selectedLanguage: ILanguage;

  constructor() {
    this.languages.filter((details) => {
      if (details.active) {
        this.selectedLanguage = details;
      }
    });
  }

  selectLanguage(language: ILanguage) {
    this.selectedLanguage = language;
    this.translate.use(language.code);
  }
}
