import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Posts, Comments } from '../model/posts.model';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://jsonplaceholder.typicode.com';
  private cache: { [key: string]: any } = {};

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Posts[]> {
    const cacheKey = 'posts';
    if (this.cache[cacheKey]) {
      return of(this.cache[cacheKey]);
    }
    return this.http.get<Posts[]>(`${this.baseUrl}/posts`).pipe(
      tap((data) => (this.cache[cacheKey] = data)),
      catchError(this.handleError<Posts[]>('getPosts', []))
    );
  }

  getPost(id: number): Observable<Posts> {
    return this.http
      .get<Posts>(`${this.baseUrl}/posts/${id}`)
      .pipe(catchError(this.handleError<Posts>('getPost')));
  }

  createPost(post: Partial<Posts>): Observable<Posts> {
    return this.http.post<Posts>(`${this.baseUrl}/posts`, post).pipe(
      tap(() => {
        // Invalidate cache to force reload
        delete this.cache['posts'];
      }),
      catchError(this.handleError<Posts>('createPost'))
    );
  }

  updatePosts(post: Partial<Posts>): Observable<Posts> {
    return this.http.put<Posts>(`${this.baseUrl}/posts/${post.id}`, post).pipe(
      tap(() => {
        delete this.cache['posts'];
      }),
      catchError(this.handleError<Posts>('updatePosts'))
    );
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/posts/${id}`).pipe(
      tap(() => {
        delete this.cache['posts'];
      }),
      catchError(this.handleError<void>('deletePost'))
    );
  }

  getComments(postId: number): Observable<Comments[]> {
    return this.http
      .get<Comments[]>(`${this.baseUrl}/posts/${postId}/comments`)
      .pipe(catchError(this.handleError<Comments[]>('getComments', [])));
  }

  createComments(comment: Partial<Comments>): Observable<Comments> {
    return this.http
      .post<Comments>(`${this.baseUrl}/comments`, comment)
      .pipe(catchError(this.handleError<Comments>('createComments')));
  }

  clearCache() {
    this.cache = {};
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
