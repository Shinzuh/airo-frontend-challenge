import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ErrorSummaryComponent} from './error-summary.component';
import {By} from '@angular/platform-browser';

describe('ErrorSummaryComponent', () => {
    let component: ErrorSummaryComponent;
    let fixture: ComponentFixture<ErrorSummaryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ErrorSummaryComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorSummaryComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Component properties', () => {
        it('should have default empty errors array', () => {
            expect(component.errors).toEqual([]);
        });

        it('should have default title', () => {
            expect(component.title).toBe('Please fix the following errors:');
        });

        it('should accept custom title', () => {
            const customTitle = 'Custom error title';
            component.title = customTitle;

            expect(component.title).toBe(customTitle);
        });

        it('should accept errors array', () => {
            const errors = ['Error 1', 'Error 2'];
            component.errors = errors;

            expect(component.errors).toEqual(errors);
        });
    });

    describe('Template rendering', () => {
        it('should not render anything when errors array is empty', () => {
            component.errors = [];
            fixture.detectChanges();

            const errorSummary = fixture.debugElement.query(By.css('.error-summary'));
            expect(errorSummary).toBeNull();
        });

        it('should render error summary when errors exist', () => {
            component.errors = ['Error 1'];
            fixture.detectChanges();

            const errorSummary = fixture.debugElement.query(By.css('.error-summary'));
            expect(errorSummary).not.toBeNull();
        });

        it('should display default title', () => {
            component.errors = ['Error 1'];
            fixture.detectChanges();

            const titleElement = fixture.debugElement.query(By.css('h3'));
            expect(titleElement.nativeElement.textContent).toBe('Please fix the following errors:');
        });

        it('should display custom title', () => {
            component.errors = ['Error 1'];
            component.title = 'Validation Errors';
            fixture.detectChanges();

            const titleElement = fixture.debugElement.query(By.css('h3'));
            expect(titleElement.nativeElement.textContent).toBe('Validation Errors');
        });

        it('should display all errors in list', () => {
            component.errors = ['First error', 'Second error', 'Third error'];
            fixture.detectChanges();

            const errorItems = fixture.debugElement.queryAll(By.css('li'));
            expect(errorItems.length).toBe(3);
            expect(errorItems[0].nativeElement.textContent).toBe('First error');
            expect(errorItems[1].nativeElement.textContent).toBe('Second error');
            expect(errorItems[2].nativeElement.textContent).toBe('Third error');
        });

        it('should handle single error', () => {
            component.errors = ['Single error message'];
            fixture.detectChanges();

            const errorItems = fixture.debugElement.queryAll(By.css('li'));
            expect(errorItems.length).toBe(1);
            expect(errorItems[0].nativeElement.textContent).toBe('Single error message');
        });

        it('should handle empty strings in errors array', () => {
            component.errors = ['Error 1', '', 'Error 2'];
            fixture.detectChanges();

            const errorItems = fixture.debugElement.queryAll(By.css('li'));
            expect(errorItems.length).toBe(3);
            expect(errorItems[1].nativeElement.textContent).toBe('');
        });

        it('should update when errors change', () => {
            component.errors = ['Initial error'];
            fixture.detectChanges();

            let errorItems = fixture.debugElement.queryAll(By.css('li'));
            expect(errorItems.length).toBe(1);
            expect(errorItems[0].nativeElement.textContent).toBe('Initial error');

            component.errors = ['Updated error 1', 'Updated error 2'];
            fixture.detectChanges();

            errorItems = fixture.debugElement.queryAll(By.css('li'));
            expect(errorItems.length).toBe(2);
            expect(errorItems[0].nativeElement.textContent).toBe('Updated error 1');
            expect(errorItems[1].nativeElement.textContent).toBe('Updated error 2');
        });

        it('should hide when errors are cleared', () => {
            component.errors = ['Error'];
            fixture.detectChanges();

            let errorSummary = fixture.debugElement.query(By.css('.error-summary'));
            expect(errorSummary).not.toBeNull();

            component.errors = [];
            fixture.detectChanges();

            errorSummary = fixture.debugElement.query(By.css('.error-summary'));
            expect(errorSummary).toBeNull();
        });
    });

    describe('Edge cases', () => {
        it('should handle very long error messages', () => {
            const longError = 'This is a very long error message that might wrap to multiple lines '.repeat(5);
            component.errors = [longError];
            fixture.detectChanges();

            const errorItems = fixture.debugElement.queryAll(By.css('li'));
            expect(errorItems[0].nativeElement.textContent).toBe(longError);
        });

        it('should handle special characters in errors', () => {
            const specialErrors = [
                'Error with <html> tags',
                'Error with "quotes"',
                'Error with & ampersand',
                'Error with \n newline'
            ];
            component.errors = specialErrors;
            fixture.detectChanges();

            const errorItems = fixture.debugElement.queryAll(By.css('li'));
            expect(errorItems.length).toBe(4);
            specialErrors.forEach((error, index) => {
                expect(errorItems[index].nativeElement.textContent).toBe(error);
            });
        });

        it('should handle duplicate error messages', () => {
            component.errors = ['Duplicate error', 'Duplicate error', 'Unique error'];
            fixture.detectChanges();

            const errorItems = fixture.debugElement.queryAll(By.css('li'));
            expect(errorItems.length).toBe(3);
            expect(errorItems[0].nativeElement.textContent).toBe('Duplicate error');
            expect(errorItems[1].nativeElement.textContent).toBe('Duplicate error');
            expect(errorItems[2].nativeElement.textContent).toBe('Unique error');
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic structure', () => {
            component.errors = ['Error 1', 'Error 2'];
            fixture.detectChanges();

            const heading = fixture.debugElement.query(By.css('h3'));
            const list = fixture.debugElement.query(By.css('ul'));

            expect(heading).not.toBeNull();
            expect(list).not.toBeNull();
            expect(list.nativeElement.children.length).toBe(2);
        });

        it('should use proper list structure for screen readers', () => {
            component.errors = ['Error 1', 'Error 2'];
            fixture.detectChanges();

            const list = fixture.debugElement.query(By.css('ul'));
            const listItems = list.queryAll(By.css('li'));

            expect(list.nativeElement.tagName.toLowerCase()).toBe('ul');
            listItems.forEach(item => {
                expect(item.nativeElement.tagName.toLowerCase()).toBe('li');
            });
        });
    });

    describe('Integration with parent component', () => {
        it('should work with @Input() binding', () => {
            const testErrors = ['Test error 1', 'Test error 2'];
            const testTitle = 'Test Title';

            fixture.componentRef.setInput('errors', testErrors);
            fixture.componentRef.setInput('title', testTitle);
            fixture.detectChanges();

            const titleElement = fixture.debugElement.query(By.css('h3'));
            const errorItems = fixture.debugElement.queryAll(By.css('li'));

            expect(titleElement.nativeElement.textContent).toBe(testTitle);
            expect(errorItems.length).toBe(2);
        });
    });
});