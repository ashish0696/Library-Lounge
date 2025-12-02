import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../dashboard.service';
import { BookIssueService } from '../../books/book-issue.service';
import { BookService } from '../../books/book.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { OverdueDetailsDialog } from '../../shared/overdue-details/overdue-details';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule, MatDialogModule],
  templateUrl: './super-admin-dashboard.html',
  styleUrls: ['./super-admin-dashboard.css']
})
export class SuperAdminDashboardComponent implements OnInit {
  stats: any = { totalBooks: '-', totalUsers: '-', totalIssuedBooks: '-', overdueBooks: '-' };
  users: any[] = [];
  dailyIssued: any[] = [];
  issuedList: any[] = [];
  overdueList: any[] = [];
  activeTab: 'users' | 'daily' | 'stats' | 'issued' | 'overdue' = 'daily';
  loading = true;
  error = '';

  constructor(private svc: DashboardService, private issueSvc: BookIssueService, private bookSvc: BookService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadUsers();
    this.loadDaily();
    this.loadIssued();
    this.loadOverdue();
  }

  loadStats() {
    this.svc.adminStats().subscribe({ next: (res: any) => {
      // backend returns object { totalBooks, totalUsers, totalIssuedBooks, overdueBooks }
      this.stats = res || this.stats;
    }, error: (err: any) => { this.error = err?.message || String(err); } });
  }

  loadUsers() {
    this.svc.allUsers().subscribe({ next: (res: any) => { this.users = Array.isArray(res) ? res : (res.data || res || []); }, error: () => {} });
  }

  loadIssued() {
    this.svc.issuedBooks().subscribe({ next: (res: any) => {
      this.issuedList = Array.isArray(res) ? res : (res.data || res || []);
      this.attachTitles(this.issuedList);
      this.attachMembers(this.issuedList);
      this.sortByIssuedDate(this.issuedList);
    }, error: () => {} });
  }

  loadOverdue() {
    this.svc.overdueBooks().subscribe({ next: (res: any) => {
      this.overdueList = Array.isArray(res) ? res : (res.data || res || []);
      this.attachTitles(this.overdueList);
      this.attachMembers(this.overdueList);
      this.sortByIssuedDate(this.overdueList);
    }, error: () => {} });
  }

  loadDaily() {
    this.issueSvc.listDaily().subscribe({ next: (res: any) => {
      this.dailyIssued = Array.isArray(res) ? res : (res.data || res || []);
      // attach book titles and member names for better display
      this.attachTitles(this.dailyIssued);
      this.attachMembers(this.dailyIssued);
      this.sortByIssuedDate(this.dailyIssued);
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
      if (!it.title && it.book && (it.book.title)) {
        it.title = it.book.title;
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

  // Sort an array of issue-like objects by their issued date (descending)
  private sortByIssuedDate(items: any[]) {
    if (!Array.isArray(items) || items.length === 0) return;
    const toTs = (it: any) => {
      const d = it?.issue_date ?? it?.issued_at ?? it?.issuedAt ?? it?.created_at ?? it?.createdAt ?? null;
      const dt = d ? new Date(d) : null;
      return dt && !isNaN(dt.getTime()) ? dt.getTime() : 0;
    };
    items.sort((a: any, b: any) => {
      return toTs(b) - toTs(a);
    });
  }

  switchTab(t: 'users' | 'daily' | 'stats' | 'issued' | 'overdue') {
    this.activeTab = t;
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

  confirmDeleteUser(u: any) {
    const id = u?.id ?? u?.user_id ?? u?._id ?? null;
    const name = u?.name || u?.fullName || u?.email || '';
    if (!id) {
      console.error('No user id found for delete');
      return;
    }

    const ref = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: { title: 'Delete User', message: `Do you want to delete user: "${name || id}"?` }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.svc.deleteUser(Number(id)).subscribe({
        next: () => {
          // remove from local list
          this.users = this.users.filter((x: any) => String(x?.id ?? x?.user_id ?? x?._id) !== String(id));
        },
        error: (err: any) => {
          console.error('Failed to delete user', err);
        }
      });
    });
  }

  openOverdueDetails(it: any) {
    this.dialog.open(OverdueDetailsDialog, { width: '520px', data: { item: it }, panelClass: 'overdue-dialog-panel' });
  }
}
