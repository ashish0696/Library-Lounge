import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../dashboard.service';
import { BookIssueService } from '../../books/book-issue.service';
import { BookService } from '../../books/book.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-librarian-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './librarian-dashboard.html',
  styleUrls: ['./librarian-dashboard.css']
})
export class LibrarianDashboardComponent implements OnInit {
  counts: any = { books: '-', issued: '-', overdue: '-', returned: '-' };
  overdueList: any[] = [];
  allIssued: any[] = [];
  requestedList: any[] = [];
  returningRequestsList: any[] = [];
  approvalSelections: Record<string, 'approve' | 'reject' | undefined> = {};
  approvalLoading: Record<string, boolean> = {};
  dailyIssued: any[] = [];
  issuedBooksList: any[] = [];
  returnedBooksList: any[] = [];
  activeTab: 'requests' | 'returning' | 'all' | 'daily' | 'issued' | 'returned' | 'overdue' = 'requests';
  loading = true;
  error = '';
  confirmLoading: Record<string, boolean> = {};

  constructor(private svc: DashboardService, private issueSvc: BookIssueService, private bookSvc: BookService, private toast: ToastService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadCounts();
    this.loadLists();
  }

  // Sort an array of issue-like objects by their issued date (descending)
  private sortByIssuedDate(items: any[]) {
    if (!Array.isArray(items) || items.length === 0) return;
    const toTs = (it: any) => {
      const d = it?.issue_date ?? it?.issued_at ?? it?.issuedAt ?? it?.created_at ?? it?.createdAt ?? null;
      const dt = d ? new Date(d) : null;
      return dt && !isNaN(dt.getTime()) ? dt.getTime() : 0;
    };
    items.sort((a: any, b: any) => toTs(b) - toTs(a));
  }

  // Helper to get a normalized issue id (string) from different possible field names
  getIssueId(it: any): string | null {
    if (!it) return null;
    const id = it.id ?? it.issueId ?? it.issue_id ?? it.request_id ?? null;
    return id != null ? String(id) : null;
  }

  // Return true when this row should display the approval selection UI
  isApprovalAllowed(it: any): boolean {
    const s = (it?.status || '') + '';
    const lowered = s.toLowerCase();
    return lowered === 'requested' ;
  }

  // Apply approval/rejection for a single issue row
  applyApproval(it: any) {
    const id = this.getIssueId(it);
    if (!id) return;
    const key = String(id);
    const sel = this.approvalSelections[key];
    if (!sel) return; // nothing selected

    const approve = sel === 'approve';
    this.approvalLoading[key] = true;
    this.issueSvc.approve(id, approve).subscribe({
      next: (res: any) => {
        // update UI: clear selection and update status locally.
        this.approvalSelections[key] = undefined;
        this.approvalLoading[key] = false;
        // backend likely sets status; reflect reasonable defaults
        it.status = approve ? 'issued' : 'rejected';
        // show toast and reload lists
        const msg = approve ? 'Book Request Approved' : 'Book Request Rejected';
        this.toast.success(msg);
        // refresh data to reflect backend state
        this.loadCounts();
        this.loadLists();
      },
      error: (err: any) => {
        // keep selection, stop loading. In a real app show toast/snack
        this.approvalLoading[key] = false;
        const message = err?.error?.message || err?.message || 'Failed to apply approval';
        this.toast.error(message);
        console.error('Failed to apply approval', err);
      }
    });
  }

  loadCounts() {
  this.svc.bookCount().subscribe({ next: (res: any) => (this.counts.books = res?.count ?? res ?? 0), error: () => {} });
  this.svc.issuedBookCount().subscribe({ next: (res: any) => (this.counts.issued = res?.count ?? res ?? 0), error: () => {} });
  this.svc.overdueBookCount().subscribe({ next: (res: any) => (this.counts.overdue = res?.count ?? res ?? 0), error: () => {} });
  this.svc.returnedBookCount().subscribe({ next: (res: any) => (this.counts.returned = res?.count ?? res ?? 0), error: () => {} });
  }

  loadLists() {
    this.loading = true;
    this.issueSvc.listAll().subscribe({
      next: (res: any) => {
  this.allIssued = Array.isArray(res) ? res : (res.data || []);
        // attach book titles and member names
    this.attachTitles(this.allIssued);
    this.attachMembers(this.allIssued);
    this.sortByIssuedDate(this.allIssued);
  this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || String(err) || 'Failed to load issued books';
        this.loading = false;
      }
    });

    this.issueSvc.listDaily().subscribe({
      next: (res: any) => {
        this.dailyIssued = Array.isArray(res) ? res : (res.data || []);
        this.attachTitles(this.dailyIssued);
        this.attachMembers(this.dailyIssued);
        this.sortByIssuedDate(this.dailyIssued);
      },
      error: () => {}
    });

    // load return-requests (books that are in 'returning' state)
    this.issueSvc.returningRequests().subscribe({ next: (res: any) => {
        this.returningRequestsList = Array.isArray(res) ? res : (res.data || []);
        this.attachTitles(this.returningRequestsList);
        this.attachMembers(this.returningRequestsList);
        this.sortByIssuedDate(this.returningRequestsList);
      }, error: () => {} });

  this.svc.overdueBooks().subscribe({ next: (res: any) => {
        this.overdueList = Array.isArray(res) ? res : (res.data || []);
    this.attachTitles(this.overdueList);
    this.attachMembers(this.overdueList);
    this.sortByIssuedDate(this.overdueList);
      }, error: () => {} });

    // load issued and returned lists for librarian tabs
    this.svc.issuedBooks().subscribe({ next: (res: any) => {
        this.issuedBooksList = Array.isArray(res) ? res : (res.data || []);
        this.attachTitles(this.issuedBooksList);
        this.attachMembers(this.issuedBooksList);
        this.sortByIssuedDate(this.issuedBooksList);
      }, error: () => {} });

    this.svc.returnedBooks().subscribe({ next: (res: any) => {
        this.returnedBooksList = Array.isArray(res) ? res : (res.data || []);
        this.attachTitles(this.returnedBooksList);
        this.attachMembers(this.returnedBooksList);
        this.sortByIssuedDate(this.returnedBooksList);
      }, error: () => {} });

    // requested books (waiting approval) for librarian
    this.svc.requestedBooks().subscribe({ next: (res: any) => {
        this.requestedList = Array.isArray(res) ? res : (res.data || []);
    this.attachTitles(this.requestedList);
    this.attachMembers(this.requestedList);
    this.sortByIssuedDate(this.requestedList);
      }, error: () => {} });
  }

  // Attach member (user) names to items by fetching user details for unique user ids.
  private attachMembers(items: any[]) {
    if (!Array.isArray(items) || items.length === 0) return;

    // Try to fill from nested user object first
    items.forEach(it => {
      if (!it.memberName && it.user && (it.user.name || it.user.fullName)) {
        it.memberName = it.user.name || it.user.fullName;
      }
      if (!it.memberName && (it.user_name || it.userName)) {
        it.memberName = it.user_name || it.userName;
      }
    });

    const ids = Array.from(new Set(
      items.map((it: any) => it.memberName ? null : (it.userId ?? it.user_id ?? it.requested_by ?? (it.user && (it.user.id || it.userId)) ))
        .filter((v: any) => v != null)
    ));

    if (ids.length === 0) return;

    const calls = ids.map(id =>
      this.svc.userDetail(Number(id)).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(calls).subscribe(results => {
      const map: Record<string, any> = {};
      results.forEach((r: any, idx: number) => {
        const id = String(ids[idx]);
        if (r) map[id] = r;
      });

      items.forEach((it: any) => {
        if (it.memberName) return; // already filled
        const id = String((it.userId ?? it.user_id ?? it.requested_by ?? (it.user && (it.user.id || it.userId))) || '');
        const user = map[id];
        if (user) {
          it.memberName = user.name || user.fullName || user?.[0]?.name || it.memberName;
        }
      });
    });
  }

  // Attach book titles to items by fetching book details for unique book ids.
  private attachTitles(items: any[]) {
    if (!Array.isArray(items) || items.length === 0) return;

    // Try to fill from nested book object first
    items.forEach(it => {
      if (!it.title && it.book && (it.book.title || it.book.name)) {
        it.title = it.book.title || it.book.name;
      }
    });

    

    // Collect unique ids where title still missing
    const ids = Array.from(new Set(
      items.map((it: any) => it.title ? null : (it.bookId ?? it.book_id ?? (it.book && (it.book.id || it.bookId)) ))
        .filter((v: any) => v != null)
    ));

    if (ids.length === 0) return;

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

      items.forEach((it: any) => {
        if (it.title) return; // already filled
  const id = String((it.bookId ?? it.book_id ?? (it.book && (it.book.id || it.bookId))) || '');
        const book = map[id];
        if (book) {
          it.title = book.title || book?.[0]?.title || it.title;
        }
      });
    });
  }

  switchTab(t: 'requests' | 'returning' | 'all' | 'daily' | 'issued' | 'returned' | 'overdue') {
    this.activeTab = t;
  }

  // Confirm return request for an issue (librarian action)
  onConfirmReturn(it: any) {
    const id = this.getIssueId(it);
    if (!id) {
      this.toast.error('Invalid issue id');
      return;
    }

    const title = it?.title || (it.book && (it.book.title || it.book.name)) || it.book_title || '-';

    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Confirm Return',
        message: `Return confirmation of the book: ${title}`
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      const key = String(id);
      this.confirmLoading[key] = true;
      this.issueSvc.returnBook(id).subscribe({
        next: () => {
          this.confirmLoading[key] = false;
          this.toast.success('Return confirmed');
          this.loadCounts();
          this.loadLists();
        },
        error: (err: any) => {
          this.confirmLoading[key] = false;
          const message = err?.error?.message || err?.message || 'Failed to confirm return';
          this.toast.error(message);
          console.error('Failed to confirm return', err);
        }
      });
    });
  }

  formatDate(d?: string) {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}
