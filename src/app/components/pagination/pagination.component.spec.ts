import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render page numbers based on totalPages', () => {
    component.totalPages = 5;
    component.currentPage = 3;
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(
      By.css('button:not([disabled])')
    );
    const pageButtons = buttons.filter((btn) =>
      btn.nativeElement.textContent.trim().match(/^\d+$/)
    );
    expect(pageButtons.length).toBe(5);
    expect(pageButtons[2].nativeElement.textContent.trim()).toBe('3');
    expect(pageButtons[2].classes['active']).toBeTrue();
  });

  it('should emit pageChange event when a page number is clicked', () => {
    component.totalPages = 5;
    fixture.detectChanges();

    spyOn(component.pageChange, 'emit');
    const pageButton = fixture.debugElement.query(
      By.css('button:not([disabled])')
    );
    pageButton.triggerEventHandler('click', null);
    expect(component.pageChange.emit).toHaveBeenCalledWith(1);
  });

  it('should display loader when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const loader = fixture.debugElement.query(By.css('.loader'));
    expect(loader).toBeTruthy();
    expect(loader.query(By.css('.spinner'))).toBeTruthy();
  });
});
