import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SanitizerService } from '../../services/sanitizer.service';
import { restrictedContentValidator } from '../../validator/validators';
import { Posts } from '../../model/posts.model';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.scss'],
})
export class EditPostComponent implements OnInit {
  postForm: FormGroup;
  imagePreview: SafeUrl = '';
  postId!: number;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
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
  }

  ngOnInit(): void {
    this.postId = +this.route.snapshot.paramMap.get('id')!;
    this.apiService.getPost(this.postId).subscribe({
      next: (post) => {
        this.postForm.patchValue({
          title: post.title,
          body: post.body,
          imageUrl: post.imageUrl || '',
        });
        this.imagePreview = this.sanitizerService.sanitizeUrl(
          post.imageUrl || ''
        );
      },
      error: (err) => console.error('Failed to load post:', err),
    });
    this.postForm.get('imageUrl')?.valueChanges.subscribe((url) => {
      this.imagePreview = this.sanitizerService.sanitizeUrl(url || '');
    });
  }

  onSubmit() {
    if (this.postForm.valid) {
      const updatedPost = { id: this.postId, ...this.postForm.value };
      this.apiService.updatePosts(updatedPost).subscribe({
        next: () => {
          window.alert('Post updated successfully!');
          this.router.navigate(['/post', this.postId]);
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

  cancel() {
    this.router.navigate(['/post', this.postId]);
  }
}
