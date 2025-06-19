import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Posts } from '../../model/posts.model';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';
import { AuthService } from '../../services/auth.service';
import { SanitizerService } from '../../services/sanitizer.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', [animate('0.5s ease-out')]),
      transition('visible => hidden', [animate('0.3s ease-in')]),
    ]),
  ],
})
export class PostsListComponent implements OnInit {
  posts: Posts[] = [];
  filteredPosts: Posts[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 6;
  filterCategory: string = '';
  searchTerm: string = '';
  sortOrder: string = 'newest';
  showMessage = false;
  isLoading: boolean = false;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private router: Router,
    private sanitizerService: SanitizerService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.apiService.getPosts().subscribe({
      next: (posts) => {
        console.log('Loaded posts:', posts);
        this.posts = posts.map((post) => ({
          ...post,
          category: this.getRandomCategory(),
          imageUrl: this.sanitizerService.sanitizeUrl(
            post.imageUrl || ''
          ) as string,
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load posts:', err);
        this.isLoading = false;
      },
    });
  }

  applyFilters() {
    this.filteredPosts = this.posts.filter((post) => {
      const matchesCategory =
        !this.filterCategory ||
        (post.category && post.category === this.filterCategory);
      const matchesSearch =
        !this.searchTerm ||
        post.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        post.body.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    this.totalPages = Math.ceil(this.filteredPosts.length / this.pageSize);
    this.sortPosts();
    this.updatePage();
  }

  onFilter(event: any) {
    this.filterCategory = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSort(event: any) {
    this.sortOrder = event.target.value;
    this.applyFilters();
  }

  sortPosts() {
    this.filteredPosts.sort((a, b) => {
      if (this.sortOrder === 'newest') return b.id - a.id;
      return a.id - b.id;
    });
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredPosts = this.filteredPosts.slice(start, end);
  }

  onPageChange(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPosts();
    }
  }

  clearCache() {
    this.apiService.clearCache();
    this.showMessage = true;
    setTimeout(() => (this.showMessage = false), 3000);
    this.loadPosts();
  }

  promptLogin() {
    if (confirm('You must log in to create a post. Go to login page?')) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
    window.alert('Logged out successfully!');
    this.router.navigate(['/']);
  }

  handleImageError(event: Event, postId: number) {
    console.error(`Failed to load image for post ${postId}: ${event}`);
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://via.placeholder.com/400/200';
  }

  private getRandomCategory(): string {
    const categories = ['Tech', 'Lifestyle'];
    return categories[Math.floor(Math.random() * categories.length)];
  }
}
