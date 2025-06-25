import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {FormData} from '../models/form-data.model';

@Injectable({
    providedIn: 'root'
})
export class FormStateService {
    private formDataSubject = new BehaviorSubject<FormData | null>(null);
    public formData$: Observable<FormData | null> = this.formDataSubject.asObservable();

    setFormData(data: FormData): void {
        this.formDataSubject.next(data);
    }

    getFormData(): FormData | null {
        return this.formDataSubject.value;
    }

    clearFormData(): void {
        this.formDataSubject.next(null);
    }
}
