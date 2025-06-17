import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  newComment = {
    postId: 0,
    id: 0,
    name: '',
    email: '',
    body: '',
  };

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.apiService.getPost(id).subscribe({
      next: (data) => (this.post = data),
      error: (err) => console.error('Failed to load post:', err),
    });
    this.apiService.getComments(id).subscribe({
      next: (data) => (this.comments = data),
      error: (err) => console.error('Failed to load comments:', err),
    });
    this.newComment.postId = id;
  }

  addComment() {
    if (this.newComment.name && this.newComment.body) {
      this.apiService
        .createComments({
          ...this.newComment,
          email: `${this.newComment.name}@example.com`,
        })
        .subscribe({
          next: (comment) => {
            this.comments.push(comment);
            this.newComment = {
              postId: this.post.id,
              id: 0,
              name: '',
              email: '',
              body: '',
            };
          },
          error: (err) => console.error('Failed to add comment:', err),
        });
    }
  }
}
