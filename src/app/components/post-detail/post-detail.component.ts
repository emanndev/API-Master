import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {
  post!: Posts;
  comments: Comments[] = [];
  editForm: FormGroup;
  showEditModal = false;
  imagePreview: SafeUrl = '';

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
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.apiService.getPost(id).subscribe({
      next: (data) => (this.post = data),
      error: (err) => console.error('Failed to load post:', err),
    });
    this.apiService.getComments(id).subscribe({
      next: (data) => {
        this.comments = data;
        this.initializeCommentsFormArray(data);
      },
      error: (err) => console.error('Failed to load comments:', err),
    });
  }

  get commentsFormArray(): FormArray {
    return this.editForm.get('comments') as FormArray;
  }

  initializeCommentsFormArray(comments: Comments[]) {
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

  openEditModal() {
    if (!this.authService.isAuthenticated()) {
      this.promptLogin();
      return;
    }
    this.editForm.patchValue({
      title: this.post.title,
      body: this.post.body,
      imageUrl: this.post.imageUrl || '',
    });
    this.initializeCommentsFormArray(this.comments);
    this.imagePreview = this.sanitizerService.sanitizeUrl(
      this.post.imageUrl || ''
    );
    this.editForm.get('imageUrl')?.valueChanges.subscribe((url) => {
      this.imagePreview = this.sanitizerService.sanitizeUrl(url || '');
    });
    this.showEditModal = true;
  }

  saveEdit() {
    if (this.editForm.valid) {
      const updatedPost = {
        id: this.post.id,
        ...this.editForm.value,
      };
      this.apiService.updatePosts(updatedPost).subscribe({
        next: (updated) => {
          this.post = updated;
          this.comments = this.editForm.value.comments;
          this.showEditModal = false;
          window.alert('Post and comments updated successfully!');
        },
        error: (err) => {
          console.error('Failed to update post:', err);
          window.alert('Failed to update post. Please try again.');
        },
      });
    } else {
      window.alert('Please correct the errors in the form.');
    }
  }

  deletePost() {
    if (!this.authService.isAuthenticated()) {
      this.promptLogin();
      return;
    }
    if (confirm('Are you sure you want to delete this post?')) {
      this.apiService.deletePost(this.post.id).subscribe({
        next: () => {
          window.alert('Post deleted successfully!');
          this.router.navigate(['/']);
        },
        error: (err) => console.error('Failed to delete post:', err),
      });
    }
  }

  promptLogin() {
    if (confirm('You must log in to perform this action. Go to login page?')) {
      this.router.navigate(['/login']);
    }
  }

  goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
