import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface BookIssueDTO {
  id: number;
  bookId: number;
  title?: string;
  issued_at?: string;
  return_date?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class BookIssueService {
  private http = inject(HttpClient);
  base = 'http://localhost:3000/api/v1';

  // Fetch all book issue requests for the current authenticated user
  listByUser() {
    return this.http.get<any>(`${this.base}/book-issues/user`).pipe(map(res => res.data || res));
  }

  // Fetch all issued book records (for librarians)
  listAll() {
    return this.http.get<any>(`${this.base}/book-issues`).pipe(map(res => res.data || res));
  }

  // Fetch daily issued books (optionally accept a date string like YYYY-MM-DD)
  listDaily(date?: string) {
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.http.get<any>(`${this.base}/book-issues/daily${q}`).pipe(map(res => res.data || res));
  }

  // Fetch return requests (books with status 'returning')
  returningRequests() {
    return this.http.get<any>(`${this.base}/book-issues/returning-request`).pipe(map(res => res.data || res));
  }

  // Approve or reject an issue by id
  approve(id: number | string, approve: boolean) {
    return this.http.post<any>(`${this.base}/book-issues/${id}`, { approve }).pipe(map(res => res.data || res));
  }

  // Request return for a particular issue id
  requestReturn(id: number | string) {
    // route is under /book-issues on the backend
    return this.http.post<any>(`${this.base}/book-issues/request-return/${id}`, {}).pipe(map(res => res.data || res));
  }

  // Confirm/complete the return for a particular issue id
  returnBook(id: number | string) {
    // backend route: POST /book-issues/return/:id
    return this.http.post<any>(`${this.base}/book-issues/return/${id}`, {}).pipe(map(res => res.data || res));
  }
}
