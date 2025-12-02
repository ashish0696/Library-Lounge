import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../shared/toast/toast.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule, MatIconModule]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });
  loading = false;
  error = '';
  private returnUrl: string | null = null;

  constructor() {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (this.auth.token) {
      this.router.navigateByUrl('/', { replaceUrl: true });
      return;
    }
    this.form.valueChanges.subscribe(() => {
      if (this.error) this.error = '';
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    this.auth.login(this.form.value as any).subscribe({
      next: (res) => {
        if (!res || res.api_status === false) {
          this.error = res?.message || 'Login failed';
          this.toast.error(this.error || 'Invalid Credentials');
          this.loading = false;
        } else {
          this.toast.success('Logged in successfully');
          const dest = this.returnUrl || '/books';
          this.router.navigateByUrl(dest, { replaceUrl: true });
        }
      },
      error: (err) => {
        if (err && err.status === 401) {
          this.error = 'Invalid Credentials';
          this.toast.error('Invalid credentials');
        } else {
          this.error = err?.error?.message || err?.message || 'Login failed';
          this.toast.error(this.error);
        }
        this.loading = false;
      }
    });
  }
}
