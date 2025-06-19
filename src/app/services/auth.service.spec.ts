import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    localStorage.clear();
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login with valid credentials and store token', (done) => {
    service.login('testuser', 'password123').subscribe((response) => {
      expect(response.token).toBe('fake-token-123');
      expect(localStorage.getItem('authToken')).toBe('fake-token-123');
      service.currentUser$.subscribe((user) => {
        expect(user?.username).toBe('testuser');
        done();
      });
    });
  });

  it('should fail login with invalid credentials', (done) => {
    service.login('wronguser', 'wrongpass').subscribe({
      error: (err) => {
        expect(err.message).toBe('Invalid credentials');
        expect(localStorage.getItem('authToken')).toBeNull();
        service.currentUser$.subscribe((user) => {
          expect(user).toBeNull();
          done();
        });
      },
    });
  });

  it('should logout and clear token', (done) => {
    localStorage.setItem('authToken', 'fake-token-123');
    service.logout();
    expect(localStorage.getItem('authToken')).toBeNull();
    service.currentUser$.subscribe((user) => {
      expect(user).toBeNull();
      done();
    });
  });

  it('should return authentication status', () => {
    expect(service.isAuthenticated()).toBeFalse();
    localStorage.setItem('authToken', 'fake-token-123');
    expect(service.isAuthenticated()).toBeTrue();
  });
});
