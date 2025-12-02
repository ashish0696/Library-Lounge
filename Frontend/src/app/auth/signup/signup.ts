import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../shared/toast/toast.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule, MatIconModule]
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^(?:\+?\d{1,3}[\s-]?)?\d{10}$/)]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/)
    ]],
    confirmPassword: ['', [Validators.required]],
    role: ['member', [Validators.required]]
  }, { validators: [(g: AbstractControl) => {
    const pw = g.get('password')?.value;
    const cp = g.get('confirmPassword')?.value;
    return pw === cp ? null : { passwordMismatch: true };
  }] });

  loading = false;
  error = '';
  success = '';

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const payload = {
      name: this.form.value.name,
      email: this.form.value.email,
      phone: this.form.value.phone,
      password: this.form.value.password,
      role: this.form.value.role
    };

    this.auth.signup(payload as any).subscribe({
      next: (res) => {
        if (!res || res.api_status === false || res.error) {
          this.error = res?.feildErrors?.join(', ') || res?.message || 'Signup failed';
          this.toast.error(this.error || 'Signup failed');
          this.loading = false;
        } else {
          this.success = res.message || 'Signup successful. Redirecting...';
          this.toast.success('Registered successfully');
          setTimeout(() => this.router.navigate(['/login']), 150);
        }
      },
      error: (err) => {
        this.error = err?.error?.feildErrors?.join(', ') || err?.error?.message || err?.message || 'Signup failed';
        this.toast.error(this.error || 'Signup failed');
        this.loading = false;
      }
    });
  }
}
