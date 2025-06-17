import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Posts } from '../../model/posts.model';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent {
  newPost: Partial<Posts> = { title: '', body: '' };

  constructor(private apiService: ApiService) {}

  onSubmit() {
    if (this.newPost.title && this.newPost.body) {
      this.apiService.createPost(this.newPost).subscribe({
        next: () => {
          this.newPost = { title: '', body: '' };
          window.alert('Post created successfully!');
        },
        error: (err) => console.error('Failed to create post:', err),
      });
    }
  }
}
