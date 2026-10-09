import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';

export interface DemoRequest { name: string; surname: string; email: string; service: string; description: string; }
@Injectable({ providedIn: 'root' })
export class RequestApiService {
  private readonly http = inject(HttpClient);
  create(data: DemoRequest, key: string) {
    return this.http.post<{ id: string; message: string }>('/api/requests', data, {
      headers: { 'Idempotency-Key': key },
    }).pipe(timeout(15000));
  }
}
