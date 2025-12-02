import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  constructor(private router: Router) {}

  isAuthed(): boolean {
    return !!sessionStorage.getItem('jwt');
  }

  userRole(): string | null {
    return sessionStorage.getItem('role');
  }

  isLibrarian(): boolean {
    const role = this.userRole();
    return role === 'librarian' ;
  }

  isAdmin(): boolean {
    const role = this.userRole();
    return  role === 'superAdmin';
  }


  logout() {
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('role');
    this.router.navigate([''])
      .catch(() => {})
      .finally(() => window.location.reload());
  }
}
