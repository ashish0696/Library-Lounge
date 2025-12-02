import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../book.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ToastService } from '../../shared/toast/toast.service';
import { BookRequestDialog } from '../book-request-dialog/book-request-dialog';
import { BookCreateDialog } from '../book-create-dialog/book-create-dialog';
export interface BookItem {
  book_id: number;
  title: string;
  author: string;
  publisher: string;
  category: string;
  status?: string;
  imageUrl?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, MatDialogModule],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css']
})
export class BooksComponent implements OnInit, OnDestroy {
  books: BookItem[] = [];
  filteredBooks: BookItem[] = [];
  searchTerm = '';
  loading = true;
  errorMsg = '';
  private search$ = new Subject<string>();
  private searchSub?: Subscription;
  isLibrarian = false;

  constructor(private router: Router, private bookSvc: BookService, private dialog: MatDialog, private toast: ToastService) {}

  ngOnInit(): void {
    const role = (sessionStorage.getItem('role') || '').toLowerCase();
    this.isLibrarian = role === 'librarian' || role === 'superadmin' || role === 'super admin' || role === 'superadmin';
    this.fetchBooks();
    this.searchSub = this.search$
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe((term: string) => {
        this.searchTerm = term;
        this.filterBooks();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  fetchBooks() {
    this.loading = true;
    this.errorMsg = '';
    this.bookSvc.list().subscribe({
      next: (res: any) => {
        this.books = Array.isArray(res) ? res : (res.data || []);
        this.filteredBooks = this.books;
        setTimeout(() => (this.loading = false), 150);
      },
      error: (err: any) => {
        this.errorMsg = err?.message || String(err);
        this.books = [];
        this.filteredBooks = [];
        setTimeout(() => (this.loading = false), 150);
      }
    });
  }

  filterBooks() {
    const word = this.searchTerm.trim().toLowerCase();
    if (!word) {
      this.filteredBooks = this.books;
      return;
    }
    this.filteredBooks = this.books.filter(b =>
      (b.title || '').toLowerCase().includes(word) ||
      (b.author || '').toLowerCase().includes(word) ||
      (b.category || '').toLowerCase().includes(word) ||
      (b.publisher || '').toLowerCase().includes(word)
    );
  }

  onSearchChange(value: string) {
    // emit into subject to debounce and distinctUntilChanged
    this.search$.next(value || '');
  }

  requestIssue(book: BookItem) {
    // If not authenticated, redirect to login
    const token = sessionStorage.getItem('jwt');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Open dialog in-place on Books listing page
    const ref = this.dialog.open(BookRequestDialog, {
      width: '460px',
      data: { bookId: book.book_id, title: book.title },
      
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result?.success) {
        // refresh books list after successful request
        this.fetchBooks();
      }
    });
  }

  openAddBook() {
    const ref = this.dialog.open(BookCreateDialog, { width: '520px' });
    ref.afterClosed().subscribe((result: any) => {
      if (result?.success) {
        // refresh list to include the newly added book
        this.fetchBooks();
      }
    });
  }

  editBook(book: BookItem) {
    const ref = this.dialog.open(BookCreateDialog, { width: '520px', data: { book } });
    ref.afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.toast.success('Book updated');
        this.fetchBooks();
      }
    });
  }

  deleteBook(book: BookItem) {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: { title: 'Delete Book', message: `Do you want to delete book: "${book.title}"?` }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.bookSvc.remove(book.book_id).subscribe({
        next: () => {
          this.toast.success('Book deleted');
          this.fetchBooks();
        },
        error: (err: any) => {
          const msg = err?.error?.message || err?.message || 'Failed to delete book';
          this.toast.error(msg);
        }
      });
    });
  }
}
