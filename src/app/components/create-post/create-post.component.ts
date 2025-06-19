import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SanitizerService } from '../../services/sanitizer.service';
import { restrictedContentValidator } from '../../validator/validators';
import { SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit, OnDestroy {
  postForm: FormGroup;
  imagePreview: SafeUrl = '';
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private sanitizerService: SanitizerService
  ) {
    this.postForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          restrictedContentValidator(),
        ],
      ],
      body: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          restrictedContentValidator(),
        ],
      ],
      imageUrl: [''],
    });

    // Redirect to login if not authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    // Update image preview on imageUrl changes
    this.postForm
      .get('imageUrl')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((url) => {
        if (url && url.trim()) {
          this.imagePreview = this.sanitizerService.sanitizeUrl(url);
        } else {
          this.imagePreview = '';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.postForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const post = this.postForm.value;

      this.apiService
        .createPost(post)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isSubmitting = false))
        )
        .subscribe({
          next: () => {
            window.alert('Post created successfully!');
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Failed to create post:', err);
            window.alert('Failed to create post. Please try again.');
          },
        });
    } else if (!this.postForm.valid) {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
      window.alert('Please correct the errors in the form.');
    }
  }

  handleImageError(event: Event): void {
    console.error('Failed to load image preview');
    const imgElement = event.target as HTMLImageElement;
    imgElement.src =
      'https://via.placeholder.com/400x300/6366f1/ffffff?text=Image+Not+Found';
    imgElement.alt = 'Image could not be loaded';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.postForm.controls).forEach((key) => {
      const control = this.postForm.get(key);
      control?.markAsTouched();
    });
  }

  // Utility methods for template
  getFieldError(fieldName: string): string | null {
    const field = this.postForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required.`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(
          fieldName
        )} must be at least ${requiredLength} characters long.`;
      }
      if (field.errors['restrictedContent']) {
        return field.errors['restrictedContent'];
      }
    }
    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      title: 'Title',
      body: 'Post content',
      imageUrl: 'Image URL',
    };
    return displayNames[fieldName] || fieldName;
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.postForm.get(fieldName);
    return !!(field?.valid && field.touched);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.postForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  goBack(): void {
    // Check if form has unsaved changes
    if (this.postForm.dirty && !this.isSubmitting) {
      const hasUnsavedChanges = confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!hasUnsavedChanges) {
        return;
      }
    }

    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
