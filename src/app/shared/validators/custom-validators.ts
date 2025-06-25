import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class CustomValidators {
    static email(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(control.value) ? null : {email: true};
        };
    }

    static password(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const value: string = control.value;
            const errors: ValidationErrors = {};

            if (value.length < 8) {
                errors['minLength'] = true;
            }

            if (!/[a-zA-Z]/.test(value)) {
                errors['noLetter'] = true;
            }

            if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                errors['noSpecialChar'] = true;
            }

            return Object.keys(errors).length > 0 ? errors : null;
        };
    }

    static requiredFileType(types: string[]): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const file = control.value;
            if (!file) {
                return null;
            }

            const extension = file.name.split('.').pop().toLowerCase();
            const isValid = types.includes(extension);

            return isValid ? null : {requiredFileType: {actualType: extension, requiredTypes: types}};
        };
    }
}
