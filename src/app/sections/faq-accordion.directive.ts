import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, inject } from '@angular/core';

/** Keep native details keyboard semantics while animating its measured height. */
@Directive({ selector: 'details[faqExpanded]' })
export class FaqAccordionDirective implements OnDestroy {
  private readonly element = inject<ElementRef<HTMLDetailsElement>>(ElementRef).nativeElement;
  private animation?: Animation;
  private initialized = false;
  @Output() readonly faqToggle = new EventEmitter<void>();

  @Input() set faqExpanded(open: boolean) {
    if (!this.initialized) {
      this.initialized = true;
      this.element.open = open;
      return;
    }
    this.animateTo(open);
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const summary = this.element.querySelector('summary');
    if (!(event.target instanceof Element) || !summary?.contains(event.target)) return;
    event.preventDefault();
    this.faqToggle.emit();
  }

  private animateTo(open: boolean) {
    const summary = this.element.querySelector('summary');
    if (!summary) return;
    const startHeight = this.element.getBoundingClientRect().height;
    this.stopAnimation();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.element.open = open;
      return;
    }
    this.element.open = true;
    const border = parseFloat(getComputedStyle(this.element).borderBottomWidth) || 0;
    const endHeight = open ? this.element.getBoundingClientRect().height : summary.getBoundingClientRect().height + border;
    this.element.style.overflow = 'hidden';
    this.animation = this.element.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)' },
    );
    this.animation.onfinish = () => {
      this.element.open = open;
      this.stopAnimation();
    };
  }

  private stopAnimation() {
    if (this.animation) { this.animation.onfinish = null; this.animation.cancel(); this.animation = undefined; }
    this.element.style.removeProperty('overflow');
  }
  ngOnDestroy() { this.stopAnimation(); }
}
