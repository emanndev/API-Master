import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Posts } from '../../model/posts.model';
import { RouterModule, RouterLink } from '@angular/router';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './posts-list.component.html',
  styleUrl: './posts-list.component.scss',
})
export class PostsListComponent implements OnInit {
  posts: Posts[] = [];
  filteredPosts: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  filterCategory: string = '';
  searchTerm: string = '';
  sortOrder: string = 'newest';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.apiService.getPosts().subscribe((posts) => {
      this.posts = posts;
    });
  }

  applyFilters() {
    this.filteredPosts = this.posts.filter((post) => {
      const matchesCategory =
        !this.filterCategory || post.category === this.filterCategory;
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
    this.filteredPosts = this.filteredPosts.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }
}
