import { DecimalPipe } from "@angular/common";
import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import { jwtInterceptor } from "./core/interceptors/jwt.interceptor";
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter, withHashLocation, withInMemoryScrolling } from "@angular/router";

import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { provideToastr } from "ngx-toastr";

import { routes } from "./app.routes";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    DecimalPipe,
    provideAnimations(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withHashLocation(),
      withInMemoryScrolling({
        scrollPositionRestoration: "top",
      }),
    ),
    provideToastr(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
  ],
};
