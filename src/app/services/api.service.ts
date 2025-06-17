import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Posts, Comments } from '../model/posts.model';
import { ErrorHandlingService } from './error-handling.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private errorHandling: ErrorHandlingService
  ) {}
  getPosts(limit: number = 20, page: number = 1): Observable<Posts[]> {
    if (limit <= 0 || page <= 0) {
      return throwError(
        () => new Error('Limit and page must be positive numbers')
      );
    }
    return this.http.get<Posts[]>(`${this.baseUrl}/posts`).pipe(
      this.errorHandling.retryRequest(2),
      map((data: Posts[]) =>
        data.map(
          (post) =>
            ({
              ...post,
              imageUrl: `https://picsum.photos/400/200?random=${post.id}`,
            } as Posts)
        )
      ),
      catchError(this.errorHandling.handleError)
    );
  }

  getPost(id: number): Observable<Posts> {
    return this.http.get<Posts>(`${this.baseUrl}/posts/${id}`).pipe(
      this.errorHandling.retryRequest(2),
      map(
        (post: Posts) =>
          ({
            ...post,
            imageUrl: `https://picsum.photos/400/200?random=${post.id}`,
          } as Posts)
      ),
      catchError(this.errorHandling.handleError)
    );
  }

  createPost(post: Partial<Posts>): Observable<Posts> {
    return this.http
      .post<Posts>(`${this.baseUrl}/posts`, {
        userId: 1,
        title: post.title,
        body: post.body,
      })
      .pipe(catchError(this.errorHandling.handleError));
  }

  updatePosts(post: Partial<Posts>): Observable<Posts> {
    return this.http
      .put<Posts>(`${this.baseUrl}/posts/${post.id}`, {
        userId: post.userId || 1,
        title: post.title,
        body: post.body,
      })
      .pipe(catchError(this.errorHandling.handleError));
  }

  deletePost(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/posts/${id}`)
      .pipe(catchError(this.errorHandling.handleError));
  }

  getComments(postId: number): Observable<Comments[]> {
    return this.http
      .get<Comments[]>(`${this.baseUrl}/comments?postId=${postId}`)
      .pipe(
        this.errorHandling.retryRequest(2),
        catchError(this.errorHandling.handleError)
      );
  }

  createComments(comment: Partial<Comments>): Observable<Comments> {
    return this.http
      .post<Comments>(`${this.baseUrl}/comments`, {
        postId: comment.postId,
        name: comment.name,
        email: `${comment.name?.toLowerCase()}@example.com`,
        body: comment.body,
      })
      .pipe(catchError(this.errorHandling.handleError));
  }
}
