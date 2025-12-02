import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface BookItemDTO {
  book_id: number;
  title: string;
  author: string;
  publisher?: string;
  category?: string;
  status?: string;
  imageUrl?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  base = 'http://localhost:3000/api/v1';

  list() {
    return this.http.get<any>(`${this.base}/book`).pipe(
      map(res => {
        // be defensive: server may return null or unexpected shape
        if (!res) return res;
        return res.data ?? res;
      })
    );
  }

  detail(id: number) {
    return this.http.get<any>(`${this.base}/book/${id}`).pipe(
      map(res => {
        // backend may return data as an array or an object; normalize to a book object
        if (!res) return res;
        if (res.data != null) {
          if (Array.isArray(res.data)) return res.data[0] || null;
          return res.data;
        }
        return res;
      })
    );
  }

  create(data: Partial<BookItemDTO>) {
    return this.http.post<any>(`${this.base}/book`, data).pipe(
      map(res => {
        // server may return created item under data (array) or as raw body
        return res?.data?.[0] ?? res?.data ?? res;
      })
    );
  }

  update(id: number, data: Partial<BookItemDTO>) {
    // Backend expects PUT for full update as per server routes
    return this.http.put<any>(`${this.base}/book/${id}`, data).pipe(
      map(res => {
        return res?.data?.[0] ?? res?.data ?? res;
      })
    );
  }

  remove(id: number) {
    return this.http.delete<any>(`${this.base}/book/${id}`).pipe(
      map(res => {
        // some delete endpoints return null/empty body; avoid throwing on null
        return res?.data?.[0] ?? res?.data ?? res;
      })
    );
  }

  requestIssue(bookId: number, returnDate: string) {
    // Calls backend to request a book issue for the current authenticated user
    return this.http.post<any>(`${this.base}/book-issues/request`, { bookId, returnDate }).pipe(
      map(res => res?.data ?? res)
    );
  }
}
