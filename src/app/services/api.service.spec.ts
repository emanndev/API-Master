import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { ErrorHandlingService } from './error-handling.service';
import { Posts, Comments } from '../model/posts.model';
import { environment } from '../../environments/environment';
import { of, throwError } from 'rxjs';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let errorHandlingService: jasmine.SpyObj<ErrorHandlingService>;

  const mockPosts: Posts[] = [
    { id: 1, userId: 1, title: 'Post 1', body: 'Body 1' },
    { id: 2, userId: 1, title: 'Post 2', body: 'Body 2' },
  ];
  const mockComments: Comments[] = [
    {
      id: 1,
      postId: 1,
      name: 'User',
      email: 'user@example.com',
      body: 'Comment',
    },
  ];

  beforeEach(() => {
    errorHandlingService = jasmine.createSpyObj('ErrorHandlingService', [
      'handleError',
      'retryRequest',
    ]);
    errorHandlingService.handleError.and.callFake((err) =>
      throwError(() => err)
    );
    errorHandlingService.retryRequest.and.callFake((obs) => obs);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: ErrorHandlingService, useValue: errorHandlingService },
      ],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch posts from API on initial load', () => {
    service.getPosts().subscribe((posts) => {
      expect(posts.length).toBe(2);
      expect(posts[0].imageUrl).toContain('https://picsum.photos');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/posts`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);
  });

  it('should return cached posts if cache is valid', () => {
    service['setInCache']('/posts?limit=20&page=1', mockPosts);
    service['cache'].get('/posts?limit=20&page=1')!.timestamp = Date.now();

    service.getPosts().subscribe((posts) => {
      expect(posts).toEqual(mockPosts);
    });

    httpMock.expectNone(`${environment.apiUrl}/posts`);
  });

  it('should throw error for invalid getPosts parameters', (done) => {
    service.getPosts(-1).subscribe({
      error: (err) => {
        expect(err.message).toBe('Limit and page must be positive numbers');
        done();
      },
    });
  });

  it('should create a new post and update localStorage', () => {
    const newPost: Partial<Posts> = { title: 'New Post', body: 'New Body' };
    service.createPost(newPost).subscribe((post) => {
      expect(post.id).toBe(1);
      expect(post.title).toBe('New Post');
      expect(localStorage.getItem('blogPosts')).toContain('New Post');
    });
  });

  it('should update an existing post', () => {
    localStorage.setItem('blogPosts', JSON.stringify(mockPosts));
    const updatedPost: Partial<Posts> = { id: 1, title: 'Updated Post' };

    service.updatePosts(updatedPost).subscribe((post) => {
      expect(post.title).toBe('Updated Post');
      expect(localStorage.getItem('blogPosts')).toContain('Updated Post');
    });
  });
});
