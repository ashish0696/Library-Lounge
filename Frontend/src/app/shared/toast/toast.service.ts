import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snack: MatSnackBar) {}
  success(msg: string) { this.snack.open(msg, '', { duration: 3000, panelClass: ['toast-success'], horizontalPosition: 'right', verticalPosition: 'bottom' }); }
  error(msg: string) { this.snack.open(msg, '', { duration: 4000, panelClass: ['toast-error'], horizontalPosition: 'right', verticalPosition: 'bottom' }); }
  show(msg: string) { this.snack.open(msg, '', { duration: 3000, horizontalPosition: 'right', verticalPosition: 'bottom' }); }
  info(msg: string) { this.snack.open(msg, '', { duration: 3000, horizontalPosition: 'right', verticalPosition: 'bottom' }); }
}
