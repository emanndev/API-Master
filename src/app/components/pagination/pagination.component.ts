import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() isLoading: boolean = false;
  @Output() pageChange = new EventEmitter<number>();

  readonly maxVisiblePages: number = 5;

  onPageChange(page: number) {
    if (page > 0 && page <= this.totalPages && !this.isLoading) {
      this.pageChange.emit(page);
    }
  }

  getPageRange(): number[] {
    const range: number[] = [];
    const halfVisible = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - halfVisible);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    if (end === this.totalPages) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }

  get showEllipsis(): boolean {
    return (
      this.totalPages > this.maxVisiblePages &&
      this.currentPage < this.totalPages - Math.floor(this.maxVisiblePages / 2)
    );
  }
}
