import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-error-summary',
    templateUrl: './error-summary.component.html',
    standalone: true,
    styleUrls: ['./error-summary.component.css']
})

export class ErrorSummaryComponent {
    @Input() errors: string[] = [];
    @Input() title: string = 'Please fix the following errors:';
}
