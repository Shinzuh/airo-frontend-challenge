import {Component, inject, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormStateService} from '../../../core/services/form-state.service';
import {FormData} from '../../../core/models/form-data.model';
import {LucideAngularModule, LucideIconData, Eye, EyeOff} from "lucide-angular";

@Component({
    selector: 'app-results-display',
    templateUrl: './results-display.component.html',
    standalone: true,
    imports: [
        LucideAngularModule
    ],
    styleUrls: ['./results-display.component.css']
})
export class ResultsDisplayComponent implements OnInit {
    private formStateService: FormStateService = inject(FormStateService);
    private router: Router = inject(Router);

    formData: FormData | null = null;
    displayedColumns: string[] = [];
    showPassword: boolean = false;

    eyeIcon: LucideIconData = Eye;
    eyeOffIcon: LucideIconData = EyeOff;

    constructor() {
    }

    ngOnInit(): void {
        this.formData = this.formStateService.getFormData();

        if (!this.formData || this.formData.csvData[0] == null) {
            this.router.navigate(['/']).then();
            return;
        }

        this.displayedColumns = Object.keys(this.formData.csvData[0]);
    }

    goBack(): void {
        this.formStateService.clearFormData();
        this.router.navigate(['/']).then();
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    maskPassword(password: string): string {
        return '*'.repeat(password.length);
    }

    get passwordIcon(): LucideIconData {
        return this.showPassword ? this.eyeIcon : this.eyeOffIcon;
    }

    protected readonly Object = Object;
}
