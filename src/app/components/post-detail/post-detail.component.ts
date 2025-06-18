import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Posts, Comments } from '../../model/posts.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {
  post!: Posts;
  comments: Comments[] = [];
  showEditModal = false;
  editedPost: Partial<Posts> = {};
  editedComments: Partial<Comments>[] = [];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.apiService.getPost(id).subscribe({
      next: (data) => (this.post = data),
      error: (err) => console.error('Failed to load post:', err),
    });
    this.apiService.getComments(id).subscribe({
      next: (data) => {
        this.comments = data;
        this.editedComments = data.map((comment) => ({ ...comment }));
      },
      error: (err) => console.error('Failed to load comments:', err),
    });
  }

  openEditModal() {
    this.editedPost = { ...this.post };
    this.editedComments = this.comments.map((comment) => ({ ...comment }));
    this.showEditModal = true;
  }

  saveEdit() {
    if (this.editedPost.title && this.editedPost.body) {
      this.apiService.updatePosts(this.editedPost).subscribe({
        next: (updatedPost) => {
          this.post = updatedPost;
          this.comments = this.editedComments as Comments[]; // Update comments locally
          this.showEditModal = false;
          window.alert('Post and comments updated successfully!');
        },
        error: (err) => console.error('Failed to update post:', err),
      });
    }
  }

  deletePost() {
    if (confirm('Are you sure you want to delete this post?')) {
      this.apiService.deletePost(this.post.id).subscribe({
        next: () => {
          window.alert('Post deleted successfully!');
          this.router.navigate(['/']); // Go back to posts list
        },
        error: (err) => console.error('Failed to delete post:', err),
      });
    }
  }

  goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
