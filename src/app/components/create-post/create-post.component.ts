import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Posts } from '../../model/posts.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent {
  newPost: Partial<Posts> = { title: '', body: '', imageUrl: '' };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect to login if not authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.newPost.title && this.newPost.body) {
      this.apiService.createPost(this.newPost).subscribe({
        next: (createdPost) => {
          this.newPost = { title: '', body: '', imageUrl: '' };
          window.alert('Post created successfully!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Failed to create post:', err);
          window.alert('Failed to create post. Please try again.');
        },
      });
    } else {
      window.alert('Please fill in all required fields.');
    }
  }
}
