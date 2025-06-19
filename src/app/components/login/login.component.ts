import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.showError('Please fill in all fields');
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response) {
          // Add a small delay for better UX
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 500);
        } else {
          this.showError('Invalid username or password');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showError('Login failed. Please try again.');
        console.error('Login error:', err);
      },
    });
  }

  private showError(message: string) {
    this.error = message;
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      this.error = '';
    }, 5000);
  }

  // Optional: Add keyboard shortcut for login
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.username && this.password) {
      this.onLogin();
    }
  }
}
