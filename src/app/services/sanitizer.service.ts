import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SanitizerService {
  constructor(private sanitizer: DomSanitizer) {}

  sanitizeUrl(url: string): SafeUrl {
    // Basic check to prevent javascript: URLs from being loaded (security risk - XSS)
    if (url && !url.match(/^(https?:\/\/|data:image\/)/)) {
      return this.sanitizer.bypassSecurityTrustUrl(''); // Return empty safe URL
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
