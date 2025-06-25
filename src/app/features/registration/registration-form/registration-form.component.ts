import {Component, OnInit, OnDestroy, inject, ViewChild, ElementRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CustomValidators} from '../../../shared/validators/custom-validators';
import {FormStateService} from '../../../core/services/form-state.service';
import {CsvParserService} from '../../../core/services/csv-parser.service';
import {ComponentCanDeactivate} from '../../../core/guards/form-dirty.guard';
import {SubscriptionType, FormData} from '../../../core/models/form-data.model';
import {CsvData} from '../../../core/models/csv-data.model';
import {ErrorSummaryComponent} from '../../../shared/components/error-summary/error-summary.component';
import {StopTypingDetectorDirective} from '../../../shared/directives/stop-typing-detector.directive';
import {InputTextComponent} from '../../../shared/components/input-text/input-text.component';
import {LogIn} from "lucide-angular";

@Component({
    selector: 'app-registration-form',
    templateUrl: './registration-form.component.html',
    standalone: true,
    imports: [
        ErrorSummaryComponent,
        ReactiveFormsModule,
        StopTypingDetectorDirective,
        InputTextComponent,
    ],
    styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
    registrationForm!: FormGroup;

    subscriptionTypes = Object.values(SubscriptionType);
    csvData: CsvData[] = [];
    csvFileName = '';
    submitted = false;
    showValidationErrors = false;
    typingStates: { [key: string]: boolean } = {};

    private readonly DEFAULT_FORM_VALUES = {
        firstName: '',
        lastName: '',
        email: '',
        subscription: SubscriptionType.ADVANCED,
        password: '',
        csvFile: null
    };

    private readonly DEFAULT_FORM_ERRORS: FormErrors = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        csvFile: ''
    }

    private fb = inject(FormBuilder);
    private router = inject(Router);
    private formStateService = inject(FormStateService);
    private csvParserService = inject(CsvParserService);

    @ViewChild('csvFileInput') csvFileInput!: ElementRef<HTMLInputElement>;

    private destroy$ = new Subject<void>();

    formErrors: FormErrors = { ...this.DEFAULT_FORM_ERRORS };

    validationMessages: { [key: string]: { [key: string]: string } } = {
        firstName: {
            required: 'First name is required'
        },
        lastName: {
            required: 'Last name is required'
        },
        email: {
            required: 'Email is required',
            email: 'Email is not valid'
        },
        password: {
            required: 'Password is required',
            minLength: 'Password must be at least 8 characters',
            noLetter: 'Password must contain at least one letter',
            noSpecialChar: 'Password must contain at least one special character'
        },
        csvFile: {
            required: 'CSV file is required',
            requiredFileType: 'Please upload a CSV file'
        }
    };

    constructor() {
    }

    ngOnInit(): void {
        this.createForm();
        this.setupFormValueChanges();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createForm(): void {
        this.registrationForm = this.fb.group({
            firstName: [this.DEFAULT_FORM_VALUES.firstName, [Validators.required]],
            lastName: [this.DEFAULT_FORM_VALUES.lastName, [Validators.required]],
            email: [this.DEFAULT_FORM_VALUES.email, [Validators.required, CustomValidators.email()]],
            subscription: [this.DEFAULT_FORM_VALUES.subscription, [Validators.required]],
            password: [this.DEFAULT_FORM_VALUES.password, [Validators.required, CustomValidators.password()]],
            csvFile: [this.DEFAULT_FORM_VALUES.csvFile, [Validators.required, CustomValidators.requiredFileType(['csv'])]]
        });
    }

    private setupFormValueChanges(): void {
        this.registrationForm.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.updateFormErrors());
    }

    onStopTyping(fieldName: keyof FormErrors): void {
        this.typingStates[fieldName] = false;
        this.updateFieldError(fieldName);
    }

    onStartTyping(fieldName: string): void {
        this.typingStates[fieldName] = true;
    }

    private updateFormErrors(): void {
        if (!this.showValidationErrors) return;

        (Object.keys(this.formErrors) as (keyof FormErrors)[]).forEach(field => {
            this.updateFieldError(field);
        });
    }

    private updateFieldError(field: keyof FormErrors): void {
        const control = this.registrationForm.get(field);
        if (control && control.dirty && !this.typingStates[field]) {
            this['formErrors'][field] = this.getErrorMessage(control, field);
        }
    }

    private getErrorMessage(control: AbstractControl, fieldName: string): string {
        if (control.errors) {
            const errorKey = Object.keys(control.errors)[0];
            return this.validationMessages[fieldName][errorKey] || '';
        }
        return '';
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            this.csvFileName = file.name;

            this.csvParserService.parseCsvFile(file)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (data) => {
                        this.csvData = data;
                        this.registrationForm.patchValue({csvFile: file});
                    },
                    error: () => {
                        this.csvFileName = '';
                        this.formErrors.csvFile = 'Error parsing CSV file';
                    }
                });
        }
    }

    getAllErrors(): string[] {
        const errors: string[] = [];

        Object.keys(this.registrationForm.controls).forEach(key => {
            const control = this.registrationForm.get(key);
            if (control && control.errors) {
                const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                errors.push(this.getErrorMessage(control, key));
            }
        });

        return errors;
    }

    onSubmit(): void {
        this.submitted = true;
        this.showValidationErrors = true;

        Object.keys(this.registrationForm.controls).forEach(key => {
            this.registrationForm.get(key)?.markAsDirty();
            this.registrationForm.get(key)?.updateValueAndValidity();
        });

        this.updateFormErrors();

        if (this.registrationForm.valid && this.csvData.length > 0) {
            const formData: FormData = {
                ...this.registrationForm.value,
                csvData: this.csvData
            };

            this.formStateService.setFormData(formData);
            this.router.navigate(['/results']).then();
        }
    }

    onClear(): void {
        if (this.registrationForm.dirty || this.csvData.length > 0) {
            const confirmed = confirm('Are you sure you want to clear every fields?');
            if (!confirmed) return;
        }

        this.registrationForm.reset({...this.DEFAULT_FORM_VALUES});
        this.csvData = [];
        this.csvFileName = '';
        this.showValidationErrors = false;
        this.submitted = false;
        this.formErrors = { ...this.DEFAULT_FORM_ERRORS };

        if (this.csvFileInput) {
            this.csvFileInput.nativeElement.value = '';
        }
    }

    canDeactivate(): boolean {
        if (this.submitted) return true;

        if (this.registrationForm.dirty || this.csvData.length > 0) {
            return confirm('You have unsaved changes. Are you sure you want to leave?');
        }

        return true;
    }
}
