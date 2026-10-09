import { TextPipe } from '../i18n/text.pipe';
import { afterNextRender, Component, ElementRef, inject, Injector, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { requestSchema, services, fieldErrors } from '../../../shared/request-schema.js';
import { RequestApiService } from './request-api.service';

@Component({
  selector: 'app-request-form',
  imports: [TextPipe, ReactiveFormsModule],
  templateUrl: './request-form.component.html',
  styleUrl: './request-form.component.css',
})
export class RequestFormComponent {
  private readonly api = inject(RequestApiService);
  private readonly injector = inject(Injector);
  private readonly element: ElementRef<HTMLElement> = inject(ElementRef);
  readonly services = services;
  readonly form = inject(FormBuilder).nonNullable.group({ name: '', surname: '', email: '', service: '', description: '' });
  readonly state = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  readonly errors = signal<Record<string, string>>({});
  readonly message = signal('');
  private attempted = false;
  private previousPayload = '';
  private key = '';

  validateField(field: string) {
    const parsed = requestSchema.safeParse(this.form.getRawValue());
    const allErrors: Record<string, string> = parsed.success ? {} : fieldErrors(parsed.error);
    this.errors.update(current => {
      const updated = { ...current };
      if (allErrors[field]) updated[field] = allErrors[field]; else delete updated[field];
      return updated;
    });
  }

  changed() {
    if (this.state() !== 'submitting') { this.state.set('idle'); this.message.set(''); }
    if (this.attempted) {
      const parsed = requestSchema.safeParse(this.form.getRawValue());
      this.errors.set(parsed.success ? {} : fieldErrors(parsed.error));
    }
  }

  async submit() {
    if (this.state() === 'submitting') return;
    this.attempted = true;
    const parsed = requestSchema.safeParse(this.form.getRawValue());
    if (!parsed.success) {
      this.errors.set(fieldErrors(parsed.error));
      this.state.set('error');
      this.message.set('Lütfen işaretli alanları kontrol edin.');
      const first = String(parsed.error.issues[0]?.path[0]);
      this.element.nativeElement.querySelector<HTMLElement>(`#${first}`)?.focus();
      return;
    }
    this.errors.set({});
    const payload = JSON.stringify(parsed.data);
    // Keep the key on retry: the server may have saved a request before a connection was lost.
    if (payload !== this.previousPayload || !this.key) { this.key = crypto.randomUUID(); this.previousPayload = payload; }
    this.state.set('submitting');
    this.message.set('Talebiniz gönderiliyor…');
    try {
      const result = await firstValueFrom(this.api.create(parsed.data, this.key));
      if (typeof result?.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.id)) throw new Error('Invalid success response');
      this.state.set('success');
      this.message.set('Talebiniz kaydedildi. İlginiz için teşekkür ederiz.');
      this.form.reset();
      this.key = '';
      this.previousPayload = '';
      this.attempted = false;
    } catch (error) {
      this.state.set('error');
      if (error instanceof HttpErrorResponse && error.status === 422) {
        this.message.set('Lütfen işaretli alanları kontrol edin.');
        this.errors.set(error.error?.errors || {});
        const first = Object.keys(this.errors()).find(field => field in this.form.controls);
        // Wait until Angular re-enables the submitting fieldset before focusing.
        if (first) afterNextRender(() => this.element.nativeElement.querySelector<HTMLElement>(`#${first}`)?.focus(), { injector: this.injector });
      } else if (error instanceof HttpErrorResponse && error.status === 429) {
        this.message.set('Çok fazla deneme yaptınız. Bir dakika sonra yeniden deneyin.');
      } else {
        this.message.set('Kayıt onayı alınamadı. Bilgileriniz korundu; bağlantınızı kontrol edip tekrar deneyin.');
      }
    }
  }
}
