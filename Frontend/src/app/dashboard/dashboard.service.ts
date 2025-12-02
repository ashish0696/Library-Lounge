import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  base = 'http://localhost:3000/api/v1';

  bookCount() {
    return this.http.get<any>(`${this.base}/librarian-dashboard/book-count`).pipe(map(res => res.data || res));
  }

  issuedBookCount() {
    return this.http.get<any>(`${this.base}/librarian-dashboard/issued-book-count`).pipe(map(res => res.data || res));
  }

  overdueBookCount() {
    return this.http.get<any>(`${this.base}/librarian-dashboard/overdue-book-count`).pipe(map(res => res.data || res));
  }

  returnedBookCount() {
    return this.http.get<any>(`${this.base}/librarian-dashboard/returned-book-count`).pipe(map(res => res.data || res));
  }

  overdueBooks() {
    return this.http.get<any>(`${this.base}/librarian-dashboard/overdue-books`).pipe(map(res => res.data || res));
  }

  returnedBooks() {
    return this.http.get<any>(`${this.base}/librarian-dashboard/returned-books`).pipe(map(res => res.data || res));
  }

  issuedBooks() {
    return this.http.get<any>(`${this.base}/librarian-dashboard/issued-books`).pipe(map(res => res.data || res));
  }

  // Fetch requested books (waiting approval) for librarian dashboard
  requestedBooks() {
    return this.http.get<any>(`${this.base}/librarian-dashboard/requested-books`).pipe(map(res => res.data || res));
  }

  userDetail(id: number) {
    return this.http.get<any>(`${this.base}/users/${id}`).pipe(map(res => res.data || res));
  }

  // Admin-specific endpoints
  adminStats() {
    return this.http.get<any>(`${this.base}/admin-dashboard/stats`).pipe(map(res => res.data || res));
  }

  allUsers() {
    return this.http.get<any>(`${this.base}/users`).pipe(map(res => res.data || res));
  }

  deleteUser(id: number) {
    return this.http.delete<any>(`${this.base}/users/${id}`).pipe(map(res => res?.data ?? res));
  }

  notifyOverdue(issueId: number) {
    return this.http.post<any>(`${this.base}/book-issues/notify-overdue/${issueId}`, {}).pipe(map(res => res.data || res));
  }
}
