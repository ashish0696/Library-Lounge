import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { ToastService } from '../shared/toast/toast.service';
interface LoginDto { email: string; password: string }
interface SignupDto { name: string; email: string; phone: string; password: string; role: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private tokenKey = 'jwt';
  isAuthed$ = new BehaviorSubject<boolean>(!!sessionStorage.getItem(this.tokenKey));

  login(data: LoginDto) {
    return this.http.post<any>('http://localhost:3000/api/v1/auth/login', data).pipe(
      tap(res => {
        const token = res?.data?.token;
        if (token) {
          sessionStorage.setItem(this.tokenKey, token);
          // try to decode role from JWT payload and persist it
          try {
            const parts = token.split('.');
            if (parts.length >= 2) {
              const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              const role = payload?.role || payload?.data?.role || null;
              if (role) {
                sessionStorage.setItem('role', role);
              }
            }
          } catch (err) {
            // ignore decoding errors
          }
          this.isAuthed$.next(true);
        }
      })
    );
  }

  signup(data: SignupDto) {
    // backend creates users at /api/v1/users
    return this.http.post<any>('http://localhost:3000/api/v1/users', data);
  }

  logout() { sessionStorage.removeItem(this.tokenKey); sessionStorage.removeItem('role'); this.isAuthed$.next(false);
   }
  get token() { return sessionStorage.getItem(this.tokenKey); }
}
