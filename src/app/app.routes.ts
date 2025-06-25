import {Routes} from '@angular/router';
import {FormDirtyGuard} from './core/guards/form-dirty.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/registration/registration-form/registration-form.component')
            .then(c => c.RegistrationFormComponent),
        canDeactivate: [FormDirtyGuard]
    },
    {
        path: 'results',
        loadComponent: () => import('./features/results/results-display/results-display.component')
            .then(c => c.ResultsDisplayComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
