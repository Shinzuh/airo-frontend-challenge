import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputTextComponent } from './input-text.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('InputTextComponent', () => {
    let component: InputTextComponent;
    let fixture: ComponentFixture<InputTextComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InputTextComponent, FormsModule, ReactiveFormsModule]
        }).compileComponents();

        fixture = TestBed.createComponent(InputTextComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Component properties', () => {
        it('should have default values', () => {
            expect(component.label).toBeUndefined();
            expect(component.required).toBeUndefined();
            expect(component.id).toBe('');
            expect(component.name).toBe('');
            expect(component.type).toBe('');
            expect(component.autoComplete).toBe('');
            expect(component.errorMsg).toBeUndefined();
            expect(component.typingState).toBe(false);
            expect(component.helpText).toBeUndefined();
            expect(component.value).toBe('');
        });

        it('should accept input properties', () => {
            component.label = 'Test Label';
            component.required = true;
            component.id = 'test-id';
            component.name = 'test-name';
            component.type = 'email';
            component.autoComplete = 'email';
            component.errorMsg = 'Error message';
            component.typingState = true;
            component.helpText = 'Help text';

            expect(component.label).toBe('Test Label');
            expect(component.required).toBe(true);
            expect(component.id).toBe('test-id');
            expect(component.name).toBe('test-name');
            expect(component.type).toBe('email');
            expect(component.autoComplete).toBe('email');
            expect(component.errorMsg).toBe('Error message');
            expect(component.typingState).toBe(true);
            expect(component.helpText).toBe('Help text');
        });
    });

    describe('ControlValueAccessor implementation', () => {
        let onChangeSpy: jasmine.Spy;
        let onTouchedSpy: jasmine.Spy;

        beforeEach(() => {
            onChangeSpy = jasmine.createSpy('onChange');
            onTouchedSpy = jasmine.createSpy('onTouched');
            component.registerOnChange(onChangeSpy);
            component.registerOnTouched(onTouchedSpy);
        });

        it('should write value', () => {
            component.writeValue('test value');
            expect(component.value).toBe('test value');
        });

        it('should handle null value in writeValue', () => {
            component.writeValue(null as any);
            expect(component.value).toBe('');
        });

        it('should handle undefined value in writeValue', () => {
            component.writeValue(undefined as any);
            expect(component.value).toBe('');
        });

        it('should register onChange callback', () => {
            component.value = 'test';
            component.onChange(component.value);
            expect(onChangeSpy).toHaveBeenCalledWith('test');
        });

        it('should register onTouched callback', () => {
            component.onTouched();
            expect(onTouchedSpy).toHaveBeenCalled();
        });

        it('should set disabled state', () => {
            component.setDisabledState(true);
            expect(component['isDisabled']).toBe(true);

            component.setDisabledState(false);
            expect(component['isDisabled']).toBe(false);
        });
    });

    describe('onInputChange', () => {
        let onChangeSpy: jasmine.Spy;
        let onTouchedSpy: jasmine.Spy;

        beforeEach(() => {
            onChangeSpy = jasmine.createSpy('onChange');
            onTouchedSpy = jasmine.createSpy('onTouched');
            component.registerOnChange(onChangeSpy);
            component.registerOnTouched(onTouchedSpy);
        });

        it('should update value and call callbacks on input change', () => {
            const event = { target: { value: 'new value' } } as any;

            component.onInputChange(event);

            expect(component.value).toBe('new value');
            expect(onChangeSpy).toHaveBeenCalledWith('new value');
            expect(onTouchedSpy).toHaveBeenCalled();
        });

        it('should handle empty input', () => {
            const event = { target: { value: '' } } as any;

            component.onInputChange(event);

            expect(component.value).toBe('');
            expect(onChangeSpy).toHaveBeenCalledWith('');
        });
    });

    describe('Template rendering', () => {
        it('should render label when provided', () => {
            component.label = 'Test Label';
            component.id = 'test-id';
            fixture.detectChanges();

            const label = fixture.debugElement.query(By.css('label'));
            expect(label).not.toBeNull();
            expect(label.nativeElement.textContent).toBe('Test Label');
            expect(label.nativeElement.getAttribute('for')).toBe('test-id');
        });

        it('should not render label when not provided', () => {
            fixture.detectChanges();

            const label = fixture.debugElement.query(By.css('label'));
            expect(label).toBeNull();
        });

        it('should add required class to label when required', () => {
            component.label = 'Test Label';
            component.required = true;
            fixture.detectChanges();

            const label = fixture.debugElement.query(By.css('label'));
            expect(label.nativeElement.classList.contains('required')).toBe(true);
        });

        it('should render input with correct attributes', () => {
            component.id = 'test-id';
            component.name = 'test-name';
            component.type = 'email';
            component.autoComplete = 'email';
            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input'));
            expect(input.nativeElement.id).toBe('test-id');
            expect(input.nativeElement.name).toBe('test-id');
            expect(input.nativeElement.type).toBe('email');
            expect(input.nativeElement.autocomplete).toBe('email');
        });

        it('should bind value to input', () => {
            component.value = 'test value';
            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input'));
            expect(input.nativeElement.value).toBe('test value');
        });

        it('should add error class when errorMsg exists', () => {
            component.errorMsg = 'Error';
            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input'));
            expect(input.nativeElement.classList.contains('error')).toBe(true);
        });

        it('should not add error class when no errorMsg', () => {
            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input'));
            expect(input.nativeElement.classList.contains('error')).toBe(false);
        });

        it('should render help text when provided', () => {
            component.helpText = 'This is help text';
            fixture.detectChanges();

            const helpText = fixture.debugElement.query(By.css('.help-text'));
            expect(helpText).not.toBeNull();
            expect(helpText.nativeElement.textContent.trim()).toBe('This is help text');
        });

        it('should not render help text when not provided', () => {
            fixture.detectChanges();

            const helpText = fixture.debugElement.query(By.css('.help-text'));
            expect(helpText).toBeNull();
        });

        it('should render error message when errorMsg exists and not typing', () => {
            component.errorMsg = 'Field is required';
            component.typingState = false;
            fixture.detectChanges();

            const errorMsg = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMsg).not.toBeNull();
            expect(errorMsg.nativeElement.textContent.trim()).toBe('Field is required');
        });

        it('should not render error message when typing', () => {
            component.errorMsg = 'Field is required';
            component.typingState = true;
            fixture.detectChanges();

            const errorMsg = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMsg).toBeNull();
        });

        it('should not render error message when no errorMsg', () => {
            component.typingState = false;
            fixture.detectChanges();

            const errorMsg = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMsg).toBeNull();
        });
    });

    describe('User interactions', () => {
        let onChangeSpy: jasmine.Spy;
        let onTouchedSpy: jasmine.Spy;

        beforeEach(() => {
            onChangeSpy = jasmine.createSpy('onChange');
            onTouchedSpy = jasmine.createSpy('onTouched');
            component.registerOnChange(onChangeSpy);
            component.registerOnTouched(onTouchedSpy);
            fixture.detectChanges();
        });

        it('should handle input event', () => {
            const input = fixture.debugElement.query(By.css('input'));
            input.nativeElement.value = 'user input';
            input.nativeElement.dispatchEvent(new Event('input'));

            expect(component.value).toBe('user input');
            expect(onChangeSpy).toHaveBeenCalledWith('user input');
            expect(onTouchedSpy).toHaveBeenCalled();
        });

        it('should handle blur event', () => {
            const input = fixture.debugElement.query(By.css('input'));
            input.nativeElement.dispatchEvent(new Event('blur'));

            expect(onTouchedSpy).toHaveBeenCalled();
        });
    });
});

describe('InputTextComponent - Integration with Angular Forms', () => {
    @Component({
        template: `
      <form>
        <app-input-text
          [formControl]="control"
          label="Test Input"
          id="test"
          [errorMsg]="control.errors?.['required'] ? 'Required' : ''"
        ></app-input-text>
      </form>
    `,
        imports: [ReactiveFormsModule, InputTextComponent],
        standalone: true
    })
    class TestHostComponent {
        control = new FormControl('');
    }

    let hostComponent: TestHostComponent;
    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, ReactiveFormsModule, InputTextComponent]
        }).compileComponents();

        hostFixture = TestBed.createComponent(TestHostComponent);
        hostComponent = hostFixture.componentInstance;
        hostFixture.detectChanges();
    });

    it('should work with FormControl', () => {
        const input = hostFixture.debugElement.query(By.css('input'));

        hostComponent.control.setValue('form control value');
        hostFixture.detectChanges();

        expect(input.nativeElement.value).toBe('form control value');

        input.nativeElement.value = 'user input';
        input.nativeElement.dispatchEvent(new Event('input'));

        expect(hostComponent.control.value).toBe('user input');
    });

    it('should display validation errors', () => {
        hostComponent.control.setErrors({ required: true });
        hostComponent.control.markAsTouched();
        hostFixture.detectChanges();

        const errorMsg = hostFixture.debugElement.query(By.css('.error-message'));
        expect(errorMsg).not.toBeNull();
        expect(errorMsg.nativeElement.textContent.trim()).toBe('Required');
    });

    it('should update error message when form control errors change', () => {
        hostFixture.detectChanges();
        let errorMsg = hostFixture.debugElement.query(By.css('.error-message'));
        expect(errorMsg).toBeNull();

        hostComponent.control.setErrors({ required: true });
        hostFixture.detectChanges();
        errorMsg = hostFixture.debugElement.query(By.css('.error-message'));
        expect(errorMsg).not.toBeNull();

        hostComponent.control.setErrors(null);
        hostFixture.detectChanges();
        errorMsg = hostFixture.debugElement.query(By.css('.error-message'));
        expect(errorMsg).toBeNull();
    });
});