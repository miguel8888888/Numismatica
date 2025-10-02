import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { LandingComponent } from './layouts/landing/landing.component';
import { AdminComponent } from './layouts/admin/admin.component';
import { InicioComponent } from './views/public/inicio/inicio.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas (Landing Layout)
  {
    path: '',
    component: LandingComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      { 
        path: 'paises', 
        loadComponent: () => import('./views/public/paises/paises.component').then(c => c.PaisesComponent)
      },
      { 
        path: 'nosotros', 
        loadComponent: () => import('./views/public/nosotros/nosotros.component').then(c => c.NosotrosComponent)
      },
      { 
        path: 'explorar-billetes', 
        loadComponent: () => import('./views/public/explorar-billetes/explorar-billetes.component').then(c => c.ExplorarBilletesComponent)
      },
      { 
        path: 'contacto', 
        loadComponent: () => import('./views/public/contacto/contacto.component').then(c => c.ContactoComponent)
      },
      { 
        path: 'destacados', 
        loadComponent: () => import('./views/public/destacados/destacados.component').then(c => c.DestacadosComponent)
      },
    ]
  },

  // Rutas de autenticación
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./views/auth/login/login.component').then(c => c.LoginComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./views/auth/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)
      }
    ]
  },

  // Rutas administrativas (Admin Layout) - Requieren autenticación
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./views/admin/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      { 
        path: 'registrar-paises', 
        loadComponent: () => import('./views/admin/registrar-paises/registrar-paises.component').then(c => c.RegistrarPaisesComponent)
      },
      // Futuras rutas administrativas
      // { path: 'usuarios', loadComponent: ... },
      // { path: 'reportes', loadComponent: ... },
      // { path: 'configuracion', loadComponent: ... },
    ]
  },

  // Ruta comodín - debe ir al final
  { path: '**', redirectTo: '' }
];