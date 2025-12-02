import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BookService } from '../book.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-book-create-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './book-create-dialog.html',
  styleUrls: ['./book-create-dialog.css']
})
export class BookCreateDialog {
  title = '';
  author = '';
  publisher = '';
  category = '';
  imageUrl = '';
  loading = false;
  error = '';
  editingId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<BookCreateDialog>,
    private bookSvc: BookService,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // If dialog was opened with a book object, populate fields for edit
    if (this.data && this.data.book) {
      const b = this.data.book;
      this.editingId = b.book_id || b.id || null;
      this.title = b.title || '';
      this.author = b.author || '';
      this.publisher = b.publisher || '';
      this.category = b.category || '';
      this.imageUrl = b.imageUrl || b.imageURL || '';
    }
  }

  confirm(form?: NgForm) {
    this.error = '';
    // validate template-driven form if provided
    if (form && form.invalid) {
      try { form.control.markAllAsTouched(); } catch (e) {}
      this.error = 'Please fix the highlighted fields';
      return;
    }

    // ensure all fields are present
    if (!this.title || !this.author || !this.publisher || !this.category || !this.imageUrl) {
      this.error = 'Please fill all fields';
      return;
    }
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(this.imageUrl)) {
      this.error = 'Image URL must start with http:// or https://';
      return;
    }

    // Client-side length validation to avoid server 400 errors
    if (this.imageUrl && this.imageUrl.length > 255) {
      this.error = 'Image URL must not exceed 255 characters';
      return;
    }
    const payload: any = {
      title: this.title,
      author: this.author,
      publisher: this.publisher || undefined,
      category: this.category || undefined,
      imageUrl: this.imageUrl || undefined
    };

    this.loading = true;

    // If editing, call update; otherwise create
    if (this.editingId) {
      this.bookSvc.update(this.editingId, payload).subscribe({
        next: (res: any) => {
          this.loading = false;
          try { this.toast.success('Book updated successfully'); } catch (e) {}
          this.dialogRef.close({ success: true, data: res });
        },
        error: (err: any) => {
          this.loading = false;
          // Try to map common backend validation responses to friendly messages
          const serverMsg = err?.error?.message || err?.error || err?.message;
          if (err?.status === 400 && /image[_]?url|image url|imageUrl|image_url/i.test(serverMsg)) {
            this.error = 'Image URL must not exceed 255 characters';
          } else {
            this.error = serverMsg || 'Failed to update book';
          }
        }
      });
    } else {
      this.bookSvc.create(payload).subscribe({
        next: (res: any) => {
          this.loading = false;
          try { this.toast.success('Book added successfully'); } catch (e) {}
          this.dialogRef.close({ success: true, data: res });
        },
        error: (err: any) => {
          this.loading = false;
          const serverMsg = err?.error?.message || err?.error || err?.message;
          if (err?.status === 400 && /image[_]?url|image url|imageUrl|image_url/i.test(serverMsg)) {
            this.error = 'Image URL must not exceed 255 characters';
          } else {
            this.error = serverMsg || 'Failed to add book';
          }
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close({ success: false });
  }
}
