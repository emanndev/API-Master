import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Posts } from '../../model/posts.model';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss'],
})
export class PostsListComponent implements OnInit {
  posts: Posts[] = [];
  filteredPosts: Posts[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 5;
  filterCategory: string = '';
  searchTerm: string = '';
  sortOrder: string = 'newest';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.apiService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts.map((post) => ({
          ...post,
          category: this.getRandomCategory(),
        }));
        this.applyFilters();
      },
      error: (err) => console.error('Failed to load posts:', err),
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
      this.applyFilters();
    }
  }

  private getRandomCategory(): string {
    const categories = ['Tech', 'Lifestyle'];
    return categories[Math.floor(Math.random() * categories.length)];
  }
}
