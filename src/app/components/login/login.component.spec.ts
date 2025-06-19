import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if fields are empty on login attempt', () => {
    component.onLogin();
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.error-message'));
    expect(error.nativeElement.textContent).toContain(
      'Please fill in all fields'
    );
    expect(component.error).toBe('Please fill in all fields');
  });

  it('should call login service and navigate on successful login', fakeAsync(() => {
    authService.login.and.returnValue(
      of({
        token: 'fake-token',
        user: { username: 'testuser', password: 'password123' },
      })
    );
    component.username = 'testuser';
    component.password = 'password123';
    component.onLogin();
    tick(500);
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.isLoading).toBeFalse();
  }));

  it('should show error on failed login', fakeAsync(() => {
    authService.login.and.returnValue(
      throwError(() => new Error('Invalid credentials'))
    );
    component.username = 'wronguser';
    component.password = 'wrongpass';
    component.onLogin();
    tick();
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.error-message'));
    expect(error.nativeElement.textContent).toContain(
      'Login failed. Please try again.'
    );
    expect(component.error).toBe('Login failed. Please try again.');
    expect(component.isLoading).toBeFalse();
  }));
});
