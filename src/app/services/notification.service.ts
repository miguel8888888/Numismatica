import { Injectable } from '@angular/core';

export interface NotificationConfig {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'question';
  duration?: number;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationContainer: HTMLElement | null = null;

  constructor() {
    console.log('🔔 NotificationService - Inicializando...');
    // Crear container después de que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createContainer());
    } else {
      this.createContainer();
    }
  }

  private createContainer(): void {
    try {
      if (!this.notificationContainer && document.body) {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification-container';
        this.notificationContainer.className = 'fixed inset-0 z-50 flex items-center justify-center';
        this.notificationContainer.style.display = 'none';
        document.body.appendChild(this.notificationContainer);
        console.log('✅ NotificationService - Container creado correctamente');
      } else if (!document.body) {
        console.warn('⚠️ NotificationService - DOM no está listo aún');
      }
    } catch (error) {
      console.error('❌ Error creando container de notificaciones:', error);
    }
  }

  show(config: NotificationConfig): Promise<boolean> {
    console.log('🔔 NotificationService.show() llamado con config:', config);
    
    return new Promise((resolve, reject) => {
      try {
        // Verificar que el DOM esté listo
        if (!document.body) {
          console.error('❌ DOM no está listo para mostrar notificaciones');
          reject(new Error('DOM no está listo'));
          return;
        }

        if (!this.notificationContainer) {
          console.log('⚠️ Container no existe, creándolo...');
          this.createContainer();
          
          // Si aún no se puede crear, rechazar
          if (!this.notificationContainer) {
            console.error('❌ No se pudo crear el container');
            reject(new Error('No se pudo crear container'));
            return;
          }
        }

      const {
        title = '',
        message,
        type = 'info',
        showConfirmButton = true,
        showCancelButton = false,
        confirmButtonText = 'Aceptar',
        cancelButtonText = 'Cancelar'
      } = config;

      // Crear el overlay
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300';
      
      // Crear el modal
      const modal = document.createElement('div');
      modal.className = `
        relative bg-white rounded-lg shadow-xl max-w-md mx-4 p-6 transform transition-all duration-300 scale-95 opacity-0
      `.trim();

      // Crear el contenido
      modal.innerHTML = `
        <div class="flex flex-col items-center text-center">
          ${this.getIcon(type)}
          ${title ? `<h3 class="text-lg font-semibold text-gray-900 mb-2">${title}</h3>` : ''}
          <p class="text-gray-600 mb-6">${message}</p>
          <div class="flex space-x-3 w-full">
            ${showCancelButton ? `
              <button id="cancel-btn" class="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                ${cancelButtonText}
              </button>
            ` : ''}
            ${showConfirmButton ? `
              <button id="confirm-btn" class="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors ${this.getButtonClass(type)}">
                ${confirmButtonText}
              </button>
            ` : ''}
          </div>
        </div>
      `;

      // Ensamblar el modal
      this.notificationContainer!.innerHTML = '';
      this.notificationContainer!.appendChild(overlay);
      this.notificationContainer!.appendChild(modal);
      this.notificationContainer!.style.display = 'flex';

      // Animar entrada
      setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
        modal.style.opacity = '1';
      }, 10);

      // Event listeners
      const confirmBtn = modal.querySelector('#confirm-btn') as HTMLElement;
      const cancelBtn = modal.querySelector('#cancel-btn') as HTMLElement;

      const closeModal = (result: boolean) => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        modal.style.opacity = '0';
        
        setTimeout(() => {
          this.notificationContainer!.style.display = 'none';
          resolve(result);
        }, 300);
      };

      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => closeModal(true));
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal(false));
      }

      // Cerrar con ESC
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', handleKeydown);
          closeModal(false);
        }
      };
      document.addEventListener('keydown', handleKeydown);

        // Auto-close si no hay botones
        if (!showConfirmButton && !showCancelButton && config.duration) {
          setTimeout(() => closeModal(true), config.duration);
        }
        
      } catch (error) {
        console.error('❌ Error mostrando notificación:', error);
        reject(error);
      }
    });
  }

  private getIcon(type: string): string {
    const icons = {
      success: `
        <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <i class="fas fa-check text-2xl text-green-600"></i>
        </div>
      `,
      error: `
        <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <i class="fas fa-times text-2xl text-red-600"></i>
        </div>
      `,
      warning: `
        <div class="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <i class="fas fa-exclamation-triangle text-2xl text-yellow-600"></i>
        </div>
      `,
      info: `
        <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <i class="fas fa-info text-2xl text-blue-600"></i>
        </div>
      `,
      question: `
        <div class="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
          <i class="fas fa-question text-2xl text-indigo-600"></i>
        </div>
      `
    };
    return icons[type as keyof typeof icons] || icons.info;
  }

  private getButtonClass(type: string): string {
    const classes = {
      success: 'bg-green-600 hover:bg-green-700',
      error: 'bg-red-600 hover:bg-red-700',
      warning: 'bg-yellow-600 hover:bg-yellow-700',
      info: 'bg-blue-600 hover:bg-blue-700',
      question: 'bg-indigo-600 hover:bg-indigo-700'
    };
    return classes[type as keyof typeof classes] || classes.info;
  }

  // Métodos de conveniencia
  success(message: string, title?: string): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'success',
      showCancelButton: false
    });
  }

  error(message: string, title?: string): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'error',
      showCancelButton: false
    });
  }

  warning(message: string, title?: string): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'warning',
      showCancelButton: false
    });
  }

  info(message: string, title?: string): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'info',
      showCancelButton: false
    });
  }

  confirm(message: string, title?: string): Promise<boolean> {
    return this.show({
      title: title || 'Confirmación',
      message,
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    });
  }

  confirmLogout(): Promise<boolean> {
    console.log('🚪 NotificationService.confirmLogout() llamado');
    
    return this.show({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?\n\nSe cerrará tu sesión administrativa y serás redirigido al login.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cerrar Sesión',
      cancelButtonText: 'Cancelar'
    }).catch(error => {
      console.error('❌ Error en confirmLogout:', error);
      // Fallback: retornar false para cancelar
      return false;
    });
  }
}