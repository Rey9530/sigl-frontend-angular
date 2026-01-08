import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { IUser } from '../../core/models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5>Bienvenido al Sistema</h5>
            </div>
            <div class="card-body">
              @if (currentUser) {
                <p>Hola, <strong>{{ currentUser.nombre }}</strong></p>
                <p>Email: {{ currentUser.email }}</p>
                <p>Rol: {{ currentUser.rol }}</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class Home implements OnInit {
  private authService = inject(AuthService);
  currentUser: IUser | null = null;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
}
