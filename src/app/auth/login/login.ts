import { Component, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./login.html",
  styleUrl: "./login.scss",
})
export class Login {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastrService);
  private authService = inject(AuthService);

  public show: boolean = false;
  public loginForm: FormGroup;
  public isLoading: boolean = false;
  private returnUrl: string = '/home';

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

    this.loginForm = new FormGroup({
      email: new FormControl("", [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  showPassword() {
    this.show = !this.show;
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }).subscribe({
      next: () => {
        this.toast.success('Inicio de sesion exitoso', '', {
          positionClass: 'toast-top-right',
          timeOut: 2000
        });
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Credenciales invalidas';
        this.toast.error(message, '', {
          positionClass: 'toast-top-right',
          closeButton: true,
          timeOut: 3000
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
