import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  sidebarOpen = true;
  usuarioActual = {
    nombre: 'Administrador',
    email: 'admin@numismatica.com',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=083FA8&color=fff'
  };

  menuItems = [
    {
      titulo: 'Dashboard',
      icono: 'fas fa-tachometer-alt',
      ruta: '/admin/dashboard',
      activo: true
    },
    {
      titulo: 'Registrar Países',
      icono: 'fas fa-globe-americas',
      ruta: '/admin/registrar-paises',
      activo: false
    },
    {
      titulo: 'Gestionar Billetes',
      icono: 'fas fa-money-bill-wave',
      ruta: '/admin/billetes',
      activo: false
    },
    {
      titulo: 'Usuarios',
      icono: 'fas fa-users',
      ruta: '/admin/usuarios',
      activo: false
    },
    {
      titulo: 'Reportes',
      icono: 'fas fa-chart-line',
      ruta: '/admin/reportes',
      activo: false
    },
    {
      titulo: 'Configuración',
      icono: 'fas fa-cog',
      ruta: '/admin/configuracion',
      activo: false
    }
  ];

  constructor(private router: Router) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  cerrarSesion() {
    // Lógica para cerrar sesión
    this.router.navigate(['/']);
  }

  irAPublico() {
    this.router.navigate(['/']);
  }
}
