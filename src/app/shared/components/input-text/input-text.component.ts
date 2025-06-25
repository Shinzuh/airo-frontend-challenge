import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-input-text',
    imports: [
        FormsModule,
        ReactiveFormsModule,
    ],
    standalone: true,
    templateUrl: './input-text.component.html',
    styleUrl: './input-text.component.css',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => InputTextComponent),
        multi: true
    }]
})
export class InputTextComponent implements ControlValueAccessor {
    @Input() label: string | undefined;
    @Input() required: boolean | undefined;
    @Input() id: string = '';
    @Input() name: string = '';
    @Input() type: string = '';
    @Input() autoComplete: string = '';
    @Input() errorMsg: string | undefined;
    @Input() typingState: boolean = false;
    @Input() helpText: string | undefined;

    public value: string = '';

    public onChange: (value: string) => void = () => {
    };
    public onTouched: () => void = () => {
    };
    public isDisabled: boolean = false;

    writeValue(value: string): void {
        this.value = value || '';
    }

    onInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.value = input.value;
        this.onChange(this.value);
        this.onTouched();
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

}
