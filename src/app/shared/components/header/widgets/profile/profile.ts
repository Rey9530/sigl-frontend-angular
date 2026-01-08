import { Component, inject, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

import { profile } from "../../../../data/header";
import { FeatherIcon } from "../../../ui/feather-icon/feather-icon";
import { AuthService } from "../../../../../core/services/auth.service";
import { IUser } from "../../../../../core/models/user.model";

@Component({
  selector: "app-profile",
  imports: [CommonModule, RouterModule, FeatherIcon],
  templateUrl: "./profile.html",
  styleUrl: "./profile.scss",
})
export class Profile implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  public profile = profile;
  public currentUser: IUser | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
