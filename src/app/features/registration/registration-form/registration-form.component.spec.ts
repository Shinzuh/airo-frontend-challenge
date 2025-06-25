import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {RegistrationFormComponent} from './registration-form.component';
import {FormStateService} from '../../../core/services/form-state.service';
import {CsvParserService} from '../../../core/services/csv-parser.service';
import {SubscriptionType} from '../../../core/models/form-data.model';
import {ErrorSummaryComponent} from '../../../shared/components/error-summary/error-summary.component';
import {StopTypingDetectorDirective} from '../../../shared/directives/stop-typing-detector.directive';
import {InputTextComponent} from '../../../shared/components/input-text/input-text.component';
import {CsvData} from "../../../core/models/csv-data.model";
import {By} from "@angular/platform-browser";

describe('RegistrationFormComponent', () => {
	let component: RegistrationFormComponent;
	let fixture: ComponentFixture<RegistrationFormComponent>;
	let mockRouter: jasmine.SpyObj<Router>;
	let mockFormStateService: jasmine.SpyObj<FormStateService>;
	let mockCsvParserService: jasmine.SpyObj<CsvParserService>;

	beforeEach(async () => {
		mockRouter = jasmine.createSpyObj('Router', ['navigate']);
		mockFormStateService = jasmine.createSpyObj('FormStateService', ['setFormData']);
		mockCsvParserService = jasmine.createSpyObj('CsvParserService', ['parseCsvFile']);

		mockRouter.navigate.and.returnValue(Promise.resolve(true));

		await TestBed.configureTestingModule({
			imports: [
				RegistrationFormComponent,
				ReactiveFormsModule,
				ErrorSummaryComponent,
				StopTypingDetectorDirective,
				InputTextComponent
			],
			providers: [
				{provide: Router, useValue: mockRouter},
				{provide: FormStateService, useValue: mockFormStateService},
				{provide: CsvParserService, useValue: mockCsvParserService}
			]
		}).compileComponents();

		fixture = TestBed.createComponent(RegistrationFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	describe('Component Initialization', () => {
		it('should create', () => {
			expect(component).toBeTruthy();
		});

		it('should initialize form with default values', () => {
			expect(component.registrationForm).toBeDefined();
			expect(component.registrationForm.get('firstName')?.value).toBe('');
			expect(component.registrationForm.get('lastName')?.value).toBe('');
			expect(component.registrationForm.get('email')?.value).toBe('');
			expect(component.registrationForm.get('subscription')?.value).toBe(SubscriptionType.ADVANCED);
			expect(component.registrationForm.get('password')?.value).toBe('');
			expect(component.registrationForm.get('csvFile')?.value).toBeNull();
		});

		it('should initialize properties correctly', () => {
			expect(component.subscriptionTypes).toEqual(Object.values(SubscriptionType));
			expect(component.csvData).toEqual([]);
			expect(component.csvFileName).toBe('');
			expect(component.submitted).toBeFalse();
			expect(component.showValidationErrors).toBeFalse();
		});
	});

	describe('Form Validation', () => {
		it('should validate required fields', () => {
			const form = component.registrationForm;

			expect(form.valid).toBeFalse();

			form.patchValue({
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: 'Password@123',
				csvFile: new File([''], 'test.csv')
			});

			expect(form.get('firstName')?.valid).toBeTrue();
			expect(form.get('lastName')?.valid).toBeTrue();
			expect(form.get('email')?.valid).toBeTrue();
			expect(form.get('password')?.valid).toBeTrue();
			expect(form.get('csvFile')?.valid).toBeTrue();
		});

		it('should validate email format', () => {
			const emailControl = component.registrationForm.get('email');

			emailControl?.setValue('invalid-email');
			expect(emailControl?.valid).toBeFalse();

			emailControl?.setValue('valid@email.com');
			expect(emailControl?.valid).toBeTrue();
		});

		it('should validate password requirements', () => {
			const passwordControl = component.registrationForm.get('password');

			passwordControl?.setValue('short');
			expect(passwordControl?.valid).toBeFalse();

			passwordControl?.setValue('12345678');
			expect(passwordControl?.valid).toBeFalse();

			passwordControl?.setValue('Password@123');
			expect(passwordControl?.valid).toBeTrue();
		});
	});

	describe('Typing Detection', () => {
		it('should handle stop typing event', () => {
			component.showValidationErrors = true;
			const firstNameInput = component.registrationForm.get('firstName');
			firstNameInput?.markAsDirty();
			firstNameInput?.setErrors({required: true});

			component.onStopTyping('firstName');

			expect(component.typingStates['firstName']).toBeFalse();
			expect(component.formErrors.firstName).toBe('First name is required');
		});

		it('should handle start typing event', () => {
			component.onStartTyping('email');
			expect(component.typingStates['email']).toBeTrue();
		});

		it('should not update errors while typing', () => {
			component.showValidationErrors = true;
			component.registrationForm.get('email')?.markAsDirty();
			component.registrationForm.get('email')?.setErrors({required: true});

			const updateFieldErrorSpy = spyOn<any>(component, 'updateFieldError');
			component['updateFormErrors']();

			expect(updateFieldErrorSpy).toHaveBeenCalledWith('email');
		});
	});

	describe('File Selection', () => {
		it('should handle successful CSV file selection', fakeAsync(() => {
			const mockCsvData: CsvData[] = [
				{id: '1', name: 'Test', email: 'test@example.com'} as any
			];
			const file = new File(['id,name,email\n1,Test,test@example.com'], 'test.csv', {type: 'text/csv'});
			const event = {target: {files: [file]}} as any;

			mockCsvParserService.parseCsvFile.and.returnValue(of(mockCsvData));

			component.onFileSelected(event);
			tick();

			expect(component.csvFileName).toBe('test.csv');
			expect(component.csvData).toEqual(mockCsvData);
			expect(component.registrationForm.get('csvFile')?.value).toBe(file);
		}));

		it('should handle CSV parsing error', fakeAsync(() => {
			const file = new File(['invalid'], 'test.csv', {type: 'text/csv'});
			const event = {target: {files: [file]}} as any;

			mockCsvParserService.parseCsvFile.and.returnValue(throwError(() => new Error('Parse error')));
			spyOn(console, 'error');

			component.onFileSelected(event);
			tick();

			expect(console.error).toHaveBeenCalledWith('Error parsing CSV:', jasmine.any(Error));
			expect(component.formErrors.csvFile).toBe('Error parsing CSV file');
		}));

		it('should handle no file selected', () => {
			const event = {target: {files: []}} as any;

			component.onFileSelected(event);

			expect(mockCsvParserService.parseCsvFile).not.toHaveBeenCalled();
		});
	});

	describe('Form Submission', () => {
		beforeEach(() => {
			component.csvData = [{name: 'Test'}];

			component.registrationForm.patchValue({
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				subscription: SubscriptionType.ADVANCED,
				password: 'Password@123',
				csvFile: new File([''], 'test.csv')
			});
		});

		it('should submit valid form successfully', () => {
			component.onSubmit();

			expect(component.submitted).toBeTrue();
			expect(component.showValidationErrors).toBeTrue();
			expect(mockFormStateService.setFormData).toHaveBeenCalledWith({
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				subscription: SubscriptionType.ADVANCED,
				password: 'Password@123',
				csvData: component.csvData,
				csvFile: new File([''], 'test.csv')
			});
			expect(mockRouter.navigate).toHaveBeenCalledWith(['/results']);
		});

		it('should not submit invalid form', () => {
			component.registrationForm.get('email')?.setValue('invalid-email');

			component.onSubmit();

			expect(component.submitted).toBeTrue();
			expect(component.showValidationErrors).toBeTrue();
			expect(mockFormStateService.setFormData).not.toHaveBeenCalled();
			expect(mockRouter.navigate).not.toHaveBeenCalled();
		});

		it('should not submit without CSV data', () => {
			component.csvData = [];

			component.onSubmit();

			expect(mockFormStateService.setFormData).not.toHaveBeenCalled();
			expect(mockRouter.navigate).not.toHaveBeenCalled();
		});
	});

	describe('Clear Functionality', () => {
		beforeEach(() => {
			component.registrationForm.patchValue({
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: 'Password@123'
			});
			component.csvData = [{name: 'Test'}];
			component.csvFileName = 'test.csv';
			component.showValidationErrors = true;
			component.submitted = true;
		});

		it('should clear form when confirmed', () => {
			spyOn(window, 'confirm').and.returnValue(true);

			component.onClear();

			expect(component.registrationForm.get('firstName')?.value).toBe('');
			expect(component.registrationForm.get('subscription')?.value).toBe(SubscriptionType.ADVANCED);
			expect(component.csvData).toEqual([]);
			expect(component.csvFileName).toBe('');
			expect(component.showValidationErrors).toBeFalse();
			expect(component.submitted).toBeFalse();
		});

		it('should not clear form when not confirmed', () => {
			spyOn(window, 'confirm').and.returnValue(false);

			component.onClear();

			expect(component.registrationForm.get('firstName')?.value).toBe('John');
			expect(component.csvData.length).toBe(1);
		});

		it('should clear file input if available', () => {
			spyOn(window, 'confirm').and.returnValue(true);
			component.csvFileInput = {nativeElement: {value: 'test.csv'}} as any;

			component.onClear();

			expect(component.csvFileInput.nativeElement.value).toBe('');
		});
	});

	describe('Navigation Guard', () => {
		it('should allow navigation if form was submitted', () => {
			component.submitted = true;

			expect(component.canDeactivate()).toBeTrue();
		});

		it('should prompt user if form is dirty', () => {
			component.registrationForm.markAsDirty();
			spyOn(window, 'confirm').and.returnValue(true);

			expect(component.canDeactivate()).toBeTrue();
			expect(window.confirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to leave?');
		});

		it('should prompt user if CSV data exists', () => {
			component.csvData = [{name: 'Test'}];
			spyOn(window, 'confirm').and.returnValue(false);

			expect(component.canDeactivate()).toBeFalse();
		});

		it('should allow navigation if form is pristine and no CSV data', () => {
			expect(component.canDeactivate()).toBeTrue();
		});
	});

	describe('Error Handling', () => {
		it('should get all form errors', () => {
			const formErrors = component.formErrors;
			component.registrationForm.get('firstName')?.setErrors({required: true});
			component.registrationForm.get('email')?.setErrors({email: true});

			component.onStopTyping('firstName');
			component.onStopTyping('email');

			const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
			submitButton.nativeElement.click();

			const firstNameError = formErrors.firstName;
			const emailError = formErrors.email

            expect(firstNameError).not.toBe('');
			expect(emailError).not.toBe('');
		});

		it('should get correct error message for field', () => {
			const control = component.registrationForm.get('password');
			control?.setErrors({minLength: true});

			const errorMessage = component['getErrorMessage'](control!, 'password');

			expect(errorMessage).toBe('Password must be at least 8 characters');
		});

		it('should return empty string if no errors', () => {
			component.registrationForm.get('firstName')?.setValue('John');
			const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
			submitButton.nativeElement.click();

			const error = component.formErrors.firstName;

			expect(error).toBe('');
		});
	});

	describe('Component Cleanup', () => {
		it('should complete destroy subject on destroy', () => {
			const destroySpy = spyOn(component['destroy$'], 'next');
			const completeSpy = spyOn(component['destroy$'], 'complete');

			component.ngOnDestroy();

			expect(destroySpy).toHaveBeenCalled();
			expect(completeSpy).toHaveBeenCalled();
		});
	});
});