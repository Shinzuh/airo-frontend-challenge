import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Directive({
    selector: '[appStopTypingDetector]',
    standalone: true
})
export class StopTypingDetectorDirective {
    @Input() debounceTime = 500;
    @Output() stopTyping = new EventEmitter<void>();

    private typing$ = new Subject<void>();

    constructor() {
        this.typing$.pipe(
            debounceTime(this.debounceTime)
        ).subscribe(() => this.stopTyping.emit());
    }

    @HostListener('input')
    onInput(): void {
        this.typing$.next();
    }
}
