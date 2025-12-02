import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-overdue-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './overdue-details.html',
  styleUrls: ['./overdue-details.css']
})
export class OverdueDetailsDialog {
  data: any;
  issueDate: string | null = null;
  returnDate: string | null = null;
  overdueText = '-';
  memberName = '-';
  email = '-';
  phone = '-';

  constructor(public dialogRef: MatDialogRef<OverdueDetailsDialog>, @Inject(MAT_DIALOG_DATA) d: any, private svc: DashboardService, private toast: ToastService) {
    this.data = d?.item || d;
    // normalize dates
    this.issueDate = this.data?.issue_date ?? this.data?.issued_at ?? this.data?.issuedAt ?? null;
    this.returnDate = this.data?.return_date ?? this.data?.returnDate ?? null;

    // member info
    this.memberName = this.data?.memberName || this.data?.user?.name || this.data?.user_name || this.data?.requested_by_name || '-';
    this.email = this.data?.user?.email || this.data?.email || '-';
    this.phone = this.data?.user?.phone || this.data?.phone || this.data?.user?.mobile || '-';

    // if email or phone missing, attempt to fetch user details by id
    const uid = this.data?.userId ?? this.data?.user_id ?? this.data?.requested_by ?? (this.data.user && (this.data.user.id || this.data.userId)) ?? null;
    if ((this.email === '-' || this.phone === '-') && uid) {
      this.svc.userDetail(Number(uid)).subscribe({
        next: (u: any) => {
          const user = u;
          if (!user) return;
          // normalize user payload (array or object)
          const name = user?.name || user?.fullName || user?.[0]?.name;
          const mail = user?.email || user?.[0]?.email;
          const ph = user?.phone || user?.mobile || user?.[0]?.phone || user?.[0]?.mobile;
          if (name && (!this.memberName || this.memberName === '-')) this.memberName = name;
          if (mail) this.email = mail;
          if (ph) this.phone = ph;
        },
        error: () => {
          // ignore
        }
      });
    }

    this.overdueText = this.computeOverdueText();
  }

  close() {
    this.dialogRef.close();
  }

  contactUser() {
    // determine issue id from possible payload keys
    const issueId = this.data?.issue_id ?? this.data?.id ?? this.data?.issueId ?? this.data?.issue_id;
    if (!issueId) {
      this.toast.error('Invalid issue id');
      return;
    }
    this.svc.notifyOverdue(Number(issueId)).subscribe({
      next: (res: any) => {
        this.toast.success('Overdue email queued');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        const msg = (err && err.error && err.error.message) || err?.message || 'Failed to send email';
        this.toast.error(msg);
      }
    });
  }

  private computeOverdueText(): string {
    if (!this.returnDate) return '-';
    const now = new Date();
    const rd = new Date(this.returnDate);
    if (isNaN(rd.getTime())) return '-';
    const diff = now.getTime() - rd.getTime();
    if (diff <= 0) return 'Not overdue';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} day${days>1? 's':''}${hours>0? ', ' + hours + ' hr' : ''}`;
    if (hours > 0) return `${hours} hour${hours>1? 's':''}`;
    return 'Less than an hour';
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
