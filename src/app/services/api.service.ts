import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Posts, Comments } from '../model/posts.model';
import { ErrorHandlingService } from './error-handling.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private storageKey = 'blogPosts';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 300000;
  private isInitialized = false;

  constructor(
    private http: HttpClient,
    private errorHandling: ErrorHandlingService
  ) {
    this.initializeLocalStorage();
  }

  //Cache helper functions
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    const now = Date.now();
    return now - cached.timestamp < this.cacheTTL;
  }

  private getFromCache(key: string): any {
    return this.cache.get(key)?.data;
  }

  private setInCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  private initializeLocalStorage() {
    if (!this.isInitialized && !localStorage.getItem(this.storageKey)) {
      this.loadInitialData().subscribe({
        next: () => (this.isInitialized = true),
        error: (err) => console.error('Initial data load failed:', err),
      });
    }
  }

  private loadInitialData(): Observable<Posts[]> {
    return this.http.get<Posts[]>(`${this.baseUrl}/posts`).pipe(
      tap((posts) => {
        localStorage.setItem(this.storageKey, JSON.stringify(posts));
        this.setInCache('/posts', posts); //cache initial load
      }),
      catchError(this.errorHandling.handleError)
    );
  }

  getPosts(limit: number = 20, page: number = 1): Observable<Posts[]> {
    if (limit <= 0 || page <= 0) {
      return throwError(
        () => new Error('Limit and page must be positive numbers')
      );
    }
    const storedPosts = JSON.parse(
      localStorage.getItem(this.storageKey) || '[]'
    );
    if (!this.isInitialized && storedPosts.length === 0) {
      return this.loadInitialData().pipe(
        map((posts) =>
          posts.map(
            (post) =>
              ({
                ...post,
                imageUrl: `https://picsum.photos/400/200?random=${post.id}`,
              } as Posts)
          )
        )
      );
    }
    return this.errorHandling.retryRequest(of(storedPosts), 0).pipe(
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
    const storedPosts = JSON.parse(
      localStorage.getItem(this.storageKey) || '[]'
    );
    const post = storedPosts.find((p: Posts) => p.id === id);
    if (!post) {
      return throwError(() => new Error('Post not found'));
    }
    return of({
      ...post,
      imageUrl: `https://picsum.photos/400/200?random=${post.id}`,
    } as Posts).pipe(catchError(this.errorHandling.handleError));
  }

  createPost(post: Partial<Posts>): Observable<Posts> {
    const storedPosts = JSON.parse(
      localStorage.getItem(this.storageKey) || '[]'
    );
    const newId =
      storedPosts.length > 0
        ? Math.max(...storedPosts.map((p: Posts) => p.id)) + 1
        : 1;
    const newPost = {
      id: newId,
      userId: 1,
      ...post,
      imageUrl: `https://picsum.photos/400/200?random=${newId}`,
    } as Posts;
    storedPosts.push(newPost);
    localStorage.setItem(this.storageKey, JSON.stringify(storedPosts));
    return of(newPost);
  }

  updatePosts(post: Partial<Posts>): Observable<Posts> {
    const storedPosts = JSON.parse(
      localStorage.getItem(this.storageKey) || '[]'
    );
    const index = storedPosts.findIndex((p: Posts) => p.id === post.id);
    if (index !== -1) {
      storedPosts[index] = {
        ...storedPosts[index],
        ...post,
        imageUrl: `https://picsum.photos/400/200?random=${post.id}`,
      } as Posts;
      localStorage.setItem(this.storageKey, JSON.stringify(storedPosts));
      return of(storedPosts[index]);
    }
    return throwError(() => new Error('Post not found'));
  }

  deletePost(id: number): Observable<any> {
    const storedPosts = JSON.parse(
      localStorage.getItem(this.storageKey) || '[]'
    );
    const newPosts = storedPosts.filter((p: Posts) => p.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(newPosts));
    return of({ success: true });
  }

  getComments(postId: number): Observable<Comments[]> {
    return this.errorHandling
      .retryRequest(
        this.http.get<Comments[]>(`${this.baseUrl}/comments?postId=${postId}`),
        2
      )
      .pipe(catchError(this.errorHandling.handleError));
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
