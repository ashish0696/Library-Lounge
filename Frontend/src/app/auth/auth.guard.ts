import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from '../shared/toast/toast.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  canActivate(): boolean {
    const token = this.auth.token;
    if (!token) {
      // no token -> redirect to login
      this.router.navigate(['/login']);
      return false;
    }

    // Try to detect token expiry from JWT exp claim if present
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const exp = payload?.exp;
        if (exp && typeof exp === 'number') {
          const nowSec = Math.floor(Date.now() / 1000);
          if (exp < nowSec) {
            try { this.toast.error('Please login again'); } catch (e) { /* ignore */ }
            try { this.auth.logout(); } catch (e) { /* ignore */ }
            this.router.navigate(['/login']);
            return false;
          }
        }
      }
    } catch (e) {
      // ignore decoding issues and allow navigation (server-side will still validate)
    }

    return true;
  }
}
