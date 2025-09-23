import { Routes } from '@angular/router';
import { LandingComponent } from './layouts/landing/landing.component';
import { InicioComponent } from './views/inicio/inicio.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      { 
        path: 'paises', 
        loadComponent: () => import('./views/paises/paises.component').then(c => c.PaisesComponent)
      },
    //   { 
    //     path: 'billetes', 
    //     loadComponent: () => import('./views/billetes/billetes.component').then(c => c.BilletesComponent)
    //   },
    //   { 
    //     path: 'configuracion', 
    //     loadComponent: () => import('./views/configuracion/configuracion.component').then(c => c.ConfiguracionComponent)
    //   }
    ]
  },
  { path: '**', redirectTo: '' }
];