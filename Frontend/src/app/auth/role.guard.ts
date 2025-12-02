import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowed: string[] = route.data['roles'] || [];
    const role = sessionStorage.getItem('role') || '';
    if (!role) {
      this.router.navigate(['/login']);
      return false;
    }
    if (allowed.length > 0 && !allowed.includes(role)) {
      // not allowed
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
