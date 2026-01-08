import { Component, ElementRef, viewChild } from "@angular/core";

import SwiperCore from "swiper";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { SwiperOptions } from "swiper/types";

SwiperCore.use([Navigation, Pagination, Autoplay]);

@Component({
  selector: "app-header-notice",
  imports: [],
  templateUrl: "./header-notice.html",
  styleUrl: "./header-notice.scss",
})
export class HeaderNotice {
  readonly swiperContainer = viewChild.required<ElementRef>("swiperContainer");

  public notice = [
    `<img src="assets/images/giftools.gif" alt="gif">
      <h6 class="mb-0 f-w-400"><span class="font-primary">Don't Miss Out! </span><span class="f-light">Our new update has been released.</span></h6><i class="icon-arrow-top-right f-light"></i>`,
    `<img src="assets/images/giftools.gif" alt="gif">
      <h6 class="mb-0 f-w-400"><span class="f-light">Something you love is now on sale! </span></h6><a class="ms-1" href="https://1.envato.market/3GVzd" target="_blank">Buy now !</a>`,
  ];

  public swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    navigation: false,
    direction: "vertical",
    autoHeight: true,
    allowTouchMove: true,
    scrollbar: { draggable: true },
    pagination: { clickable: true },
    loop: true,
    autoplay: { delay: 2000 },
  };

  ngAfterViewInit() {
    const swiperContainer = this.swiperContainer();
    if (swiperContainer) {
      new SwiperCore(swiperContainer.nativeElement, this.swiperConfig);
    }
  }
}
