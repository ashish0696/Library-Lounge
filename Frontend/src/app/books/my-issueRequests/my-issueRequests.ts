import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookIssueService, BookIssueDTO } from '../book-issue.service';
import { BookService } from '../book.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ToastService } from '../../shared/toast/toast.service';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, MatDialogModule, MatButtonModule],
  templateUrl: './my-issueRequests.html',
  styleUrls: ['./my-issueRequests.css']
})
export class MyRequestsComponent implements OnInit {
  loading = true;
  error = '';
  items: BookIssueDTO[] = [];

  constructor(
    private svc: BookIssueService,
    private bookSvc: BookService,
    private dialog: MatDialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  onRequestReturn(it: any) {
    // determine issue id from common possible fields
    const issueId = it?.id ?? it?._id ?? it?.issue_id ?? it?.issueId ?? it?.issueIdNumber ?? null;
    const title = it?.title || it?.bookTitle || it?.name || '';
    if (!issueId) {
      try { this.toast.error('Unable to determine issue id for this request'); } catch (e) {}
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Return Book',
        message: `Do you want to return book: ${title}`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.svc.requestReturn(issueId).subscribe({
        next: () => {
          try { this.toast.success('Return request submitted'); } catch (e) {}
          this.fetch();
        },
        error: (err: any) => {
          try { this.toast.error(err?.message || 'Failed to request return'); } catch (e) {}
        }
      });
    });
  }

  fetch() {
    this.loading = true;
    this.error = '';
    this.svc.listByUser().subscribe({
      next: (res: any) => {
        this.items = Array.isArray(res) ? res : (res.data || []);

        // sort by issued date (latest first) even before attaching titles
        this.sortByIssuedDate(this.items);

        // Fetch book titles for each unique bookId (some APIs may return book_id)
        const ids = Array.from(new Set(
          this.items.map((it: any) => it.bookId ?? it.book_id).filter((v: any) => v != null)
        ));

        if (ids.length === 0) {
          // nothing to fetch, ensure sorted and finish
          this.sortByIssuedDate(this.items);
          this.loading = false;
          return;
        }

        const calls = ids.map(id =>
          this.bookSvc.detail(Number(id)).pipe(
            catchError(() => of(null))
          )
        );

        forkJoin(calls).subscribe(results => {
          const map: Record<string, any> = {};
          results.forEach((r: any, idx: number) => {
            const id = String(ids[idx]);
            if (r) map[id] = r;
          });

          // attach title to items
          this.items = this.items.map((it: any) => {
            // prefer bookId, fall back to book_id
            const id = String(it.bookId ?? it.book_id ?? '');
            const book = map[id];
            console.log('Book for ID', "ID:" , id, "Book",book);
            if (book) {
              // BookService.detail returns either the object or an array element
              it.title = book.title || book?.[0]?.title || it.title;
            }
            console.log('Updated item:', it);
            return it;
          });

          // sort items by issued date after attaching titles so newest appear first
          this.sortByIssuedDate(this.items);

          this.loading = false;
        }, () => {
          // if book details fail, still show requests
          this.loading = false;
        });
      },
      error: (err: any) => {
        this.error = err?.message || String(err) || 'Failed to load requests';
        this.items = [];
        this.loading = false;
      }
    });
  }

  formatDate(d?: string) {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    // Format as DD/MM/YYYY
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // Sort the issue requests by issued date descending (newest first)
  private sortByIssuedDate(items: any[]) {
    if (!Array.isArray(items) || items.length === 0) return;
    const toTs = (it: any) => {
      const d = it?.issue_date ?? it?.issued_at ?? it?.issuedAt ?? it?.created_at ?? it?.createdAt ?? null;
      const dt = d ? new Date(d) : null;
      return dt && !isNaN(dt.getTime()) ? dt.getTime() : 0;
    };
    items.sort((a: any, b: any) => toTs(b) - toTs(a));
  }
}
