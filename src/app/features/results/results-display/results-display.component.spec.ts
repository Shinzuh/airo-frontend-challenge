import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ResultsDisplayComponent } from './results-display.component';
import { FormStateService } from '../../../core/services/form-state.service';
import { FormData, SubscriptionType } from '../../../core/models/form-data.model';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ResultsDisplayComponent', () => {
    let component: ResultsDisplayComponent;
    let fixture: ComponentFixture<ResultsDisplayComponent>;
    let mockFormStateService: jasmine.SpyObj<FormStateService>;
    let mockRouter: jasmine.SpyObj<Router>;

    const mockFormData: FormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        subscription: SubscriptionType.ADVANCED,
        password: 'Test@123',
        csvFile: new File([''], 'test.csv'),
        csvData: [
            { id: '1', name: 'Product A', price: '10.99' },
            { id: '2', name: 'Product B', price: '20.50' }
        ]
    };

    beforeEach(async () => {
        mockFormStateService = jasmine.createSpyObj('FormStateService', ['getFormData', 'clearFormData']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        await TestBed.configureTestingModule({
            imports: [ResultsDisplayComponent, LucideAngularModule],
            providers: [
                { provide: FormStateService, useValue: mockFormStateService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ResultsDisplayComponent);
        component = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
        it('should initialize with form data when available', () => {
            mockFormStateService.getFormData.and.returnValue(mockFormData);

            component.ngOnInit();

            expect(component.formData).toEqual(mockFormData);
            expect(component.displayedColumns).toEqual(['id', 'name', 'price']);
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });

        it('should navigate to home when form data is null', () => {
            mockFormStateService.getFormData.and.returnValue(null);

            component.ngOnInit();

            expect(component.formData).toBeNull();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        });

        it('should handle empty CSV data', () => {
            const emptyFormData = { ...mockFormData, csvData: [] };
            mockFormStateService.getFormData.and.returnValue(emptyFormData);

            component.ngOnInit();

            expect(component.formData).toEqual(emptyFormData);
            expect(component.displayedColumns).toEqual([]);
        });
    });

    describe('goBack', () => {
        it('should clear form data and navigate to home', () => {
            component.goBack();

            expect(mockFormStateService.clearFormData).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        });
    });

    describe('togglePassword', () => {
        it('should toggle showPassword from false to true', () => {
            component.showPassword = false;

            component.togglePassword();

            expect(component.showPassword).toBe(true);
        });

        it('should toggle showPassword from true to false', () => {
            component.showPassword = true;

            component.togglePassword();

            expect(component.showPassword).toBe(false);
        });
    });

    describe('maskPassword', () => {
        it('should return asterisks matching password length', () => {
            expect(component.maskPassword('test')).toBe('****');
            expect(component.maskPassword('password123')).toBe('***********');
            expect(component.maskPassword('')).toBe('');
        });
    });

    describe('passwordIcon getter', () => {
        it('should return Eye icon when password is shown', () => {
            component.showPassword = true;

            expect(component.passwordIcon).toEqual(Eye);
        });

        it('should return EyeOff icon when password is hidden', () => {
            component.showPassword = false;

            expect(component.passwordIcon).toEqual(EyeOff);
        });
    });

    describe('Template rendering', () => {
        beforeEach(() => {
            mockFormStateService.getFormData.and.returnValue(mockFormData);
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should display form data correctly', () => {
            const firstNameEl = fixture.debugElement.query(By.css('.data-item:nth-child(1) .data-value'));
            const lastNameEl = fixture.debugElement.query(By.css('.data-item:nth-child(2) .data-value'));
            const emailEl = fixture.debugElement.query(By.css('.data-item:nth-child(3) .data-value'));
            const subscriptionEl = fixture.debugElement.query(By.css('.subscription-badge'));

            expect(firstNameEl.nativeElement.textContent).toBe('John');
            expect(lastNameEl.nativeElement.textContent).toBe('Doe');
            expect(emailEl.nativeElement.textContent).toBe('john.doe@example.com');
            expect(subscriptionEl.nativeElement.textContent.trim()).toBe('Advanced');
            expect(subscriptionEl.nativeElement.getAttribute('data-type')).toBe('Advanced');
        });

        it('should display masked password by default', () => {
            const passwordEl = fixture.debugElement.query(By.css('.password-item .data-value'));

            expect(passwordEl.nativeElement.textContent).toBe('********');
        });

        it('should display actual password when toggled', () => {
            const toggleButton = fixture.debugElement.query(By.css('.password-toggle'));
            toggleButton.nativeElement.click();
            fixture.detectChanges();

            const passwordEl = fixture.debugElement.query(By.css('.password-item .data-value'));
            expect(passwordEl.nativeElement.textContent).toBe('Test@123');
        });

        it('should update aria-label when password visibility changes', () => {
            const toggleButton = fixture.debugElement.query(By.css('.password-toggle'));

            expect(toggleButton.nativeElement.getAttribute('aria-label')).toBe('Show password');

            toggleButton.nativeElement.click();
            fixture.detectChanges();

            expect(toggleButton.nativeElement.getAttribute('aria-label')).toBe('Hide password');
        });

        it('should render CSV data table correctly', () => {
            const headerCells = fixture.debugElement.queryAll(By.css('.data-table th'));
            expect(headerCells.length).toBe(3);
            expect(headerCells[0].nativeElement.textContent).toBe('id');
            expect(headerCells[1].nativeElement.textContent).toBe('name');
            expect(headerCells[2].nativeElement.textContent).toBe('price');

            const rows = fixture.debugElement.queryAll(By.css('.data-table tbody tr'));
            expect(rows.length).toBe(2);

            const firstRowCells = rows[0].queryAll(By.css('td'));
            expect(firstRowCells[0].nativeElement.textContent).toBe('1');
            expect(firstRowCells[1].nativeElement.textContent).toBe('Product A');
            expect(firstRowCells[2].nativeElement.textContent).toBe('10.99');
        });

        it('should call goBack when back button is clicked', () => {
            spyOn(component, 'goBack');
            const backButton = fixture.debugElement.query(By.css('.btn-primary'));

            backButton.nativeElement.click();

            expect(component.goBack).toHaveBeenCalled();
        });

        it('should not render content when formData is null', () => {
            component.formData = null;
            fixture.detectChanges();

            const resultsCard = fixture.debugElement.query(By.css('.results-card'));
            expect(resultsCard).toBeNull();
        });
    });
});