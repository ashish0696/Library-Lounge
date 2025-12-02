import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  constructor(private auth: AuthService) {}
  get isAuthed$() { return this.auth.isAuthed$; }
}
