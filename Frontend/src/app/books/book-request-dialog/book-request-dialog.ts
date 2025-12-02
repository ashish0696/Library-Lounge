import { Component, Inject, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BookService } from '../book.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../shared/toast/toast.service';
@Component({
  selector: 'app-book-request-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './book-request-dialog.html',
  styleUrls: ['./book-request-dialog.css']
})
export class BookRequestDialog implements OnInit, AfterViewInit, OnDestroy {
  // splitted inputs
  year: string = '';
  month: string = '';
  day: string = '';
  loading = false;
  error = '';
  // also allow calendar selection
  returnDate: Date | null = null;
  // minimum selectable date for the datepicker (today)
  minDate: Date = new Date();
  @ViewChild('picker') picker: MatDatepicker<Date> | undefined;

  // document click handler reference so we can remove it on destroy
  private _docClickHandler = (event: MouseEvent) => {
    try {
      // if there is no open picker popup, nothing to do
      const popup = document.querySelector('.mat-datepicker-content');
      if (!popup) return;

      const clickedNode = event.target as Node;

      // if click is inside this component, do nothing
      if (this.host && this.host.nativeElement && this.host.nativeElement.contains(clickedNode)) return;

      // if click is inside the datepicker popup itself, do nothing
      if (popup.contains(clickedNode)) return;

      // otherwise we clicked outside both — close the picker
      this.picker?.close();
    } catch (e) {
      // swallow any unexpected errors here — this should be harmless
    }
  };

  constructor(
    public dialogRef: MatDialogRef<BookRequestDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { bookId: number; title?: string },
    private bookSvc: BookService,
    private toast: ToastService,
    private host: ElementRef
  ) {}

  ngOnInit(): void {
    // set minDate to today (clear time portion)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = today;
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', this._docClickHandler, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this._docClickHandler, true);
  }

  confirm() {
    const role = sessionStorage.getItem('role') || '';
    if (role.toLowerCase() !== 'member') {
      this.error = 'Access Denied';
      return;
    }

    let payloadDate: string | null = null;
    if (this.year || this.month || this.day) {
      if (!this.year || !this.month || !this.day) {
        this.error = 'Please enter full return date in YYYY-MM-DD format.';
        return;
      }
      const y = Number(this.year);
      const m = Number(this.month);
      const d = Number(this.day);
      if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
        this.error = 'Date parts must be numbers.';
        return;
      }
      if (this.year.length !== 4 || m < 1 || m > 12 || d < 1 || d > 31) {
        this.error = 'Please enter a valid date.';
        return;
      }

      const composed = new Date(y, m - 1, d);
      if (composed.getFullYear() !== y || composed.getMonth() !== m - 1 || composed.getDate() !== d) {
        this.error = 'Please enter a valid calendar date.';
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      composed.setHours(0, 0, 0, 0);
      if (composed < today) {
        this.error = 'Return date cannot be before today.';
        return;
      }

      payloadDate = this.formatDate(composed);
    } else {
      if (!this.returnDate) {
        this.error = 'Please select a return date.';
        return;
      }
      // ensure selected date is not before today (covers manual typing)
      const selected = new Date(this.returnDate);
      selected.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        this.error = 'Return date cannot be before today.';
        return;
      }

      payloadDate = this.formatDate(this.returnDate);
    }

    this.error = '';
    this.loading = true;
    this.bookSvc.requestIssue(this.data.bookId, payloadDate).subscribe({
      next: (res: any) => {
        this.loading = false;
        // show success toast then close
        try { this.toast.success('Book requested successfully'); } catch (e) { /* swallow if toast fails */ }
        this.dialogRef.close({ success: true, data: res });
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.message || 'Request failed';
      }
    });
  }

  cancel() {
    this.dialogRef.close({ success: false });
  }

  private formatDate(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  onCalendarChange(e: any) {
    const d: Date = e?.value;
    if (d && !isNaN(d.getTime())) {
      this.returnDate = d;
      this.year = String(d.getFullYear());
      this.month = String(d.getMonth() + 1).padStart(2, '0');
      this.day = String(d.getDate()).padStart(2, '0');
      this.error = '';
    }
  }
}
