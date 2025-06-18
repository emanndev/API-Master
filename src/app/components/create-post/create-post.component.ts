import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  postForm: FormGroup;
  imagePreview: SafeUrl = '';

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
    this.postForm.get('imageUrl')?.valueChanges.subscribe((url) => {
      this.imagePreview = this.sanitizerService.sanitizeUrl(url || '');
    });
  }

  onSubmit() {
    if (this.postForm.valid) {
      const post = this.postForm.value;
      this.apiService.createPost(post).subscribe({
        next: () => {
          window.alert('Post created successfully!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Failed to create post:', err);
          window.alert('Failed to create post. Please try again.');
        },
      });
    } else {
      window.alert('Please correct the errors in the form.');
    }
  }
}
