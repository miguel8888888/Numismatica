import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  isMobile = false;
  usuarioActual: any = {
    nombre: 'Cargando...',
    email: '',
    profile_image: null,
    avatar: 'https://ui-avatars.com/api/?name=User&background=083FA8&color=fff'
  };
  dropdownOpen = false;
  private userSubscription?: Subscription;
  private outsideClickHandler!: (event: Event) => void;
  private resizeHandler!: () => void;

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    console.log('🏗️ AdminComponent - Constructor ejecutado');
    console.log('🔔 NotificationService disponible:', !!this.notificationService);
    console.log('🔐 AuthService disponible:', !!this.authService);
    console.log('🧭 Router disponible:', !!this.router);
  }

  ngOnInit(): void {
    // Suscribirse a los datos del usuario actual
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.usuarioActual = {
          nombre: user.nombre || 'Administrador',
          email: user.email,
          role: user.role,
          profile_image: user.profile_image,
          avatar: this.getAvatarUrl(user)
        };
        console.log('👤 Usuario cargado en admin:', this.usuarioActual);
      }
    });

    // Si no hay usuario en el subject, intentar obtenerlo del storage
    if (!this.authService.getCurrentUser()) {
      const storedUser = localStorage.getItem('numismatica_user') || sessionStorage.getItem('numismatica_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.usuarioActual = {
          nombre: user.nombre || 'Administrador',
          email: user.email,
          role: user.role,
          profile_image: user.profile_image,
          avatar: this.getAvatarUrl(user)
        };
      }
    }

    // Setup para cerrar dropdown al hacer click fuera
    this.setupOutsideClickHandler();
    
    // Detectar tamaño de pantalla
    this.checkScreenSize();
    this.setupResizeHandler();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    // Remover event listeners
    document.removeEventListener('click', this.outsideClickHandler);
    window.removeEventListener('resize', this.resizeHandler);
  }

  private setupOutsideClickHandler(): void {
    this.outsideClickHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      // Si el click no es dentro del dropdown container, cerrarlo
      if (!target.closest('[data-dropdown-container]') && this.dropdownOpen) {
        this.dropdownOpen = false;
      }
    };
    document.addEventListener('click', this.outsideClickHandler);
  }

  private getAvatarUrl(user: any): string {
    // Si el usuario tiene imagen de perfil, usarla
    if (user.profile_image) {
      return user.profile_image;
    }
    
    // Si no, generar URL con iniciales
    const userName = user.nombre || 'Admin';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=083FA8&color=fff&size=128`;
  }

  getInitials(nombre: string): string {
    if (!nombre || nombre.trim() === '') {
      return 'U'; // Usuario por defecto
    }
    
    const names = nombre.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    // Tomar primera letra del nombre y primera letra del apellido
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  // Métodos para responsividad
  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 1024; // lg breakpoint
      if (this.isMobile) {
        this.sidebarOpen = false; // Cerrar sidebar en móviles por defecto
      }
    }
  }

  private setupResizeHandler(): void {
    if (typeof window !== 'undefined') {
      this.resizeHandler = () => {
        const wasMobile = this.isMobile;
        this.checkScreenSize();
        
        // Si cambió de móvil a desktop, abrir sidebar
        if (wasMobile && !this.isMobile) {
          this.sidebarOpen = true;
        }
        // Si cambió de desktop a móvil, cerrar sidebar
        else if (!wasMobile && this.isMobile) {
          this.sidebarOpen = false;
        }
      };
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  getSidebarClasses(): string {
    if (this.isMobile) {
      return this.sidebarOpen ? 
        'fixed left-0 top-0 h-full w-64 transform translate-x-0' : 
        'fixed left-0 top-0 h-full w-64 transform -translate-x-full';
    } else {
      return this.sidebarOpen ? 'w-64' : 'w-16';
    }
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleDropdown(): void {
    console.log('🔽 Toggling dropdown:', !this.dropdownOpen);
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  async cerrarSesion(): Promise<void> {
    console.log('🚪 AdminComponent - Iniciando proceso de logout...');
    
    // Verificar si el NotificationService está disponible
    if (!this.notificationService) {
      console.log('⚠️ NotificationService no disponible, usando confirmación manual...');
      const confirmar = await this.mostrarConfirmacionManual(
        '¿Estás seguro de que deseas cerrar sesión?\n\nSe cerrará tu sesión administrativa.',
        'Cerrar Sesión'
      );
      
      if (confirmar) {
        this.closeDropdown();
        this.authService.logout();
      }
      return;
    }
    
    try {
      console.log('🔔 Usando NotificationService para confirmación...');
      
      const confirmar = await this.notificationService.confirmLogout();
      
      if (confirmar) {
        console.log('✅ AdminComponent - Usuario confirmó logout');
        this.closeDropdown();
        
        // Mostrar mensaje de despedida sin await para evitar bloqueos
        this.notificationService.success(
          'Cerrando sesión...\n\nGracias por usar el sistema.',
          '👋 Hasta luego'
        ).catch(error => {
          console.warn('⚠️ Error mostrando mensaje de despedida:', error);
        });
        
        // Logout después de un breve delay
        setTimeout(() => {
          console.log('🔄 Ejecutando logout...');
          this.authService.logout();
        }, 500);
        
      } else {
        console.log('❌ AdminComponent - Usuario canceló logout');
      }
    } catch (error) {
      console.error('❌ Error con NotificationService, usando método manual:', error);
      
      // Fallback directo a confirmación manual
      const confirmar = await this.mostrarConfirmacionManual(
        'Hubo un problema con las notificaciones.\n\n¿Deseas cerrar sesión de todas formas?',
        'Problema del Sistema'
      );
      
      if (confirmar) {
        this.closeDropdown();
        this.authService.logout();
      }
    }
  }

  irAPublico(): void {
    // No navegar dentro de la SPA, abrir en nueva ventana para mantener la sesión admin
    console.log('� Abriendo sitio público en nueva ventana...');
    window.open('/', '_blank');
  }

  // Métodos para el dropdown del usuario
  async irAPerfil(): Promise<void> {
    console.log('👤 Navegando al perfil del usuario...');
    this.closeDropdown();
    
    try {
      this.router.navigate(['/admin/profile']);
      console.log('✅ Navegación al perfil exitosa');
    } catch (error) {
      console.error('❌ Error navegando al perfil:', error);
      await this.notificationService.error('Error al acceder al perfil', 'Error de Navegación');
      this.mostrarNotificacionManual(
        'La funcionalidad de perfil está en desarrollo.',
        'info'
      );
    }
  }

  async irAConfiguracion(): Promise<void> {
    console.log('⚙️ Navegando a configuración...');
    this.closeDropdown();
    
    // TODO: Implementar navegación a configuración
    // this.router.navigate(['/admin/configuracion']);
    
    try {
      await this.notificationService.info(
        'La funcionalidad de configuración del sistema está en desarrollo.\n\nPronto podrás:\n\n• Configurar ajustes generales\n• Gestionar permisos de usuario\n• Personalizar la interfaz\n• Configurar notificaciones',
        '🚧 Configuración - En Desarrollo'
      );
    } catch (error) {
      console.error('Error mostrando notificación de configuración:', error);
      // Crear notificación manual si el servicio falla
      this.mostrarNotificacionManual(
        'La funcionalidad de configuración está en desarrollo.',
        'info'
      );
    }
  }

  // Método para mostrar confirmaciones manuales
  private mostrarConfirmacionManual(mensaje: string, titulo: string = 'Confirmación'): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('❓ Mostrando confirmación manual:', mensaje);
      
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
      overlay.style.opacity = '0';
      
      const modal = document.createElement('div');
      modal.className = 'bg-white rounded-lg shadow-xl max-w-md mx-4 p-6 transform transition-all duration-300 scale-95';
      
      modal.innerHTML = `
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <i class="fas fa-question text-2xl text-yellow-600"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">${titulo}</h3>
          <p class="text-gray-600 mb-6 whitespace-pre-line">${mensaje}</p>
          <div class="flex space-x-3 w-full">
            <button id="manual-cancel-btn" class="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button id="manual-confirm-btn" class="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>
      `;
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      const confirmBtn = modal.querySelector('#manual-confirm-btn') as HTMLElement;
      const cancelBtn = modal.querySelector('#manual-cancel-btn') as HTMLElement;
      
      const cerrarModal = (resultado: boolean) => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (overlay.parentNode) {
            document.body.removeChild(overlay);
          }
          resolve(resultado);
        }, 300);
      };
      
      confirmBtn.addEventListener('click', () => cerrarModal(true));
      cancelBtn.addEventListener('click', () => cerrarModal(false));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarModal(false);
      });
      
      // Animar entrada
      setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
      }, 10);
    });
  }

  // Método para mostrar notificaciones manuales como fallback
  private mostrarNotificacionManual(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    console.log('🔔 Mostrando notificación manual:', mensaje);
    
    // Crear elementos DOM manualmente
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    overlay.style.opacity = '0';
    
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg shadow-xl max-w-md mx-4 p-6 transform transition-all duration-300 scale-95';
    
    const colores = {
      success: { bg: 'bg-green-100', text: 'text-green-800', icon: 'fas fa-check', iconColor: 'text-green-600' },
      error: { bg: 'bg-red-100', text: 'text-red-800', icon: 'fas fa-times', iconColor: 'text-red-600' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'fas fa-exclamation-triangle', iconColor: 'text-yellow-600' },
      info: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'fas fa-info', iconColor: 'text-blue-600' }
    };
    
    const color = colores[tipo];
    
    modal.innerHTML = `
      <div class="flex flex-col items-center text-center">
        <div class="w-16 h-16 mx-auto mb-4 ${color.bg} rounded-full flex items-center justify-center">
          <i class="${color.icon} text-2xl ${color.iconColor}"></i>
        </div>
        <p class="text-gray-600 mb-6 whitespace-pre-line">${mensaje}</p>
        <button id="manual-ok-btn" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Aceptar
        </button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Event listener para cerrar
    const okBtn = modal.querySelector('#manual-ok-btn') as HTMLElement;
    const cerrarModal = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (overlay.parentNode) {
          document.body.removeChild(overlay);
        }
      }, 300);
    };
    
    okBtn.addEventListener('click', cerrarModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrarModal();
    });
    
    // Animar entrada
    setTimeout(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    }, 10);
  }
}
