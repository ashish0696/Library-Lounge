import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';

export const routes: Routes = [
	{ path: '', component: HomeComponent, pathMatch: 'full' },
	{ path: 'books', loadComponent: () => import('./books/book-list/book-list').then(m => m.BooksComponent) },
	{ path: 'librarian', canActivate: [AuthGuard, RoleGuard], data: { roles: ['librarian'] }, loadComponent: () => import('./dashboard/librarian/librarian-dashboard').then(m => m.LibrarianDashboardComponent) },
	{ path: 'admin', canActivate: [AuthGuard, RoleGuard], data: { roles: ['superAdmin'] }, loadComponent: () => import('./dashboard/super-admin/super-admin-dashboard').then(m => m.SuperAdminDashboardComponent) },
	{ path: 'myRequests', canActivate: [AuthGuard], loadComponent: () => import('./books/my-issueRequests/my-issueRequests').then(m => m.MyRequestsComponent) },
	{ path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent) },
	{ path: 'signup', loadComponent: () => import('./auth/signup/signup').then(m => m.SignupComponent) },
	{ path: '**', loadComponent: () => import('./shared/not-found/not-found').then(m => m.NotFoundComponent) }
];
