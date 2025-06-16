import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { Posts, Comments } from '../model/posts.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Posts[]> {
    return this.http
      .get<Posts[]>(`${this.baseUrl}/posts`)
      .pipe(catchError(this.errorHandler));
  }

  getPost(id: number): Observable<Posts> {
    return this.http
      .get<Posts>(`${this.baseUrl}/posts/${id}`)
      .pipe(catchError(this.errorHandler));
  }

  createPost(post: Posts): Observable<Posts> {
    return this.http
      .post<Posts>(`${this.baseUrl}/posts`, post)
      .pipe(catchError(this.errorHandler));
  }

  updatePosts(post: Posts): Observable<Posts> {
    return this.http
      .put<Posts>(`${this.baseUrl}/posts/${post.id}`, post)
      .pipe(catchError(this.errorHandler));
  }

  deletePost(id: number): Observable<Posts> {
    return this.http
      .delete<Posts>(`${this.baseUrl}/posts/${id}`)
      .pipe(catchError(this.errorHandler));
  }

  getComments(postId: number): Observable<Comments[]> {
    return this.http
      .get<Comments[]>(`${this.baseUrl}/posts/${postId}/comments`)
      .pipe(catchError(this.errorHandler));
  }

  errorHandler(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: Failed to retrieve posts data`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
