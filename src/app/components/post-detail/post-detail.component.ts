import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Posts, Comments } from '../../model/posts.model';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SanitizerService } from '../../services/sanitizer.service';
import { restrictedContentValidator } from '../../validator/validators';
import { SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post!: Posts;
  comments: Comments[] = [];
  editForm: FormGroup;
  showEditModal = false;
  imagePreview: SafeUrl = '';
  isLoading = true;
  isDeleting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public authService: AuthService,
    private sanitizerService: SanitizerService
  ) {
    this.editForm = this.fb.group({
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
      comments: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadPostData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPostData(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;

    if (!id || isNaN(id)) {
      this.router.navigate(['/']);
      return;
    }

    this.isLoading = true;

    Promise.all([this.loadPost(id), this.loadComments(id)]).finally(() => {
      this.isLoading = false;
    });
  }

  private loadPost(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService
        .getPost(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.post = {
              ...data,
              imageUrl: this.sanitizerService.sanitizeUrl(
                data.imageUrl || ''
              ) as string,
            };
            resolve();
          },
          error: (err) => {
            console.error('Failed to load post:', err);
            this.showErrorMessage('Failed to load post. Please try again.');
            reject(err);
          },
        });
    });
  }

  private loadComments(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService
        .getComments(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.comments = data || [];
            this.initializeCommentsFormArray(this.comments);
            resolve();
          },
          error: (err) => {
            console.error('Failed to load comments:', err);
            this.comments = [];
            reject(err);
          },
        });
    });
  }

  get commentsFormArray(): FormArray {
    return this.editForm.get('comments') as FormArray;
  }

  initializeCommentsFormArray(comments: Comments[]): void {
    const formArray = this.fb.array(
      comments.map((comment) =>
        this.fb.group({
          id: [comment.id],
          body: [
            comment.body,
            [Validators.required, restrictedContentValidator()],
          ],
        })
      )
    );
    this.editForm.setControl('comments', formArray);
  }

  openEdit(): void {
    if (!this.authService.isAuthenticated()) {
      this.promptLogin();
      return;
    }
    this.router.navigate(['edit-post', this.post.id]);
  }

  saveEdit(): void {
    if (this.editForm.valid) {
      const updatedPost = {
        id: this.post.id,
        ...this.editForm.value,
      };

      this.apiService
        .updatePosts(updatedPost)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.post = updated;
            this.comments = this.editForm.value.comments;
            this.showEditModal = false;
            this.showSuccessMessage('Post and comments updated successfully!');
          },
          error: (err) => {
            console.error('Failed to update post:', err);
            this.showErrorMessage('Failed to update post. Please try again.');
          },
        });
    } else {
      this.showErrorMessage('Please correct the errors in the form.');
    }
  }

  deletePost(): void {
    if (!this.authService.isAuthenticated()) {
      this.promptLogin();
      return;
    }

    if (
      !confirm(
        'Are you sure you want to delete this post? This action cannot be undone.'
      )
    ) {
      return;
    }

    this.isDeleting = true;

    this.apiService
      .deletePost(this.post.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isDeleting = false))
      )
      .subscribe({
        next: () => {
          this.showSuccessMessage('Post deleted successfully!');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        },
        error: (err) => {
          console.error('Failed to delete post:', err);
          this.showErrorMessage('Failed to delete post. Please try again.');
        },
      });
  }

  promptLogin(): void {
    if (confirm('You must log in to perform this action. Go to login page?')) {
      this.router.navigate(['/login']);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  handleImageError(event: Event): void {
    console.error(`Failed to load image for post ${this.post.id}`);
    const imgElement = event.target as HTMLImageElement;
    imgElement.src =
      'https://via.placeholder.com/400x300/6366f1/ffffff?text=Image+Not+Found';
    imgElement.alt = 'Image could not be loaded';
  }

  trackByCommentId(index: number, comment: Comments): number {
    return comment.id;
  }

  private showSuccessMessage(message: string): void {
    window.alert(message);
  }

  private showErrorMessage(message: string): void {
    window.alert(message);
  }

  // Utility method to check if user can edit/delete
  canModifyPost(): boolean {
    return this.authService.isAuthenticated();
  }
}
