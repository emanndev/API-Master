import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${
        error.message || 'Server error'
      }`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
  retryRequest(observable: any, retries: number = 1): any {
    return observable.pipe(retry(retries));
  }
  constructor() {}
}
