import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/usuario.model';

export function roleGuard(allowedRoles: Rol[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.getCurrentUser();

    if (!user) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (allowedRoles.includes(user.rol as Rol)) {
      return true;
    }

    router.navigate(['/home']);
    return false;
  };
}
