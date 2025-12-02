import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';
import { AuthService } from '../../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const token = sessionStorage.getItem('jwt');
	const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

	const toast = inject(ToastService);
	const router = inject(Router);
	const auth = inject(AuthService);

	return next(authReq).pipe(
		// catch server responses that indicate expired/invalid auth
		catchError((err: any) => {
			try {
				// Network/connection failure (e.g. backend down, CORS/port not reachable)
				if (err && (err.status === 0 || err instanceof Error && String(err?.message || '').toLowerCase().includes('unknown error'))) {
					try { toast.error('Connection error, Please check the server !!'); } catch (e) { /* swallow */ }
					return throwError(() => new Error('Connection error, Please check the server !!'));
				}

				// Only treat as "session expired" when a token was present on the request
				// (i.e. the user was authenticated). For unauthenticated requests
				// such as login attempts, allow the component to handle 401/403.
				if (err && (err.status === 401 || err.status === 403)) {
					if (token) {
						try { toast.error('Session expired, please login again'); } catch (e) { /* swallow */ }
						try { auth.logout(); } catch (e) { /* swallow */ }
						try { router.navigate(['/login']); } catch (e) { /* swallow */ }
						// transform error so components receive a standard message
						return throwError(() => new Error('Session expired, please login again'));
					}
				}
			} catch (e) {
				// guard - fallthrough to rethrow original error
			}
			return throwError(() => err);
		})
	);
};
