import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-upload-container">
      <!-- Preview de la imagen actual con iniciales como fallback -->
      <div class="image-preview">
        <div class="relative inline-block">
          <!-- Imagen si existe -->
          <img 
            *ngIf="currentImageUrl"
            [src]="currentImageUrl" 
            [alt]="'Foto de perfil'"
            class="h-32 w-32 rounded-full object-cover border-4 border-gray-200 shadow-lg cursor-pointer"
          />
          
          <!-- Iniciales si no hay imagen -->
          <div 
            *ngIf="!currentImageUrl"
            class="h-32 w-32 rounded-full border-4 border-gray-200 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer"
          >
            <span class="text-white text-2xl font-bold">{{ getInitials() }}</span>
          </div>
          
          <!-- Overlay para cambiar imagen -->
          <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
               (click)="triggerFileInput()">
            <div class="text-center">
              <span class="text-white text-sm font-medium block">📷</span>
              <span class="text-white text-xs">{{ currentImageUrl ? 'Cambiar' : 'Subir' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input de archivo (oculto) -->
      <input 
        #fileInput
        type="file" 
        accept="image/*" 
        class="hidden"
        (change)="onFileSelected($event)"
      />

      <!-- Indicador de progreso (solo cuando está subiendo) -->
      <div *ngIf="uploading" class="mt-4">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
               [style.width.%]="uploadProgress">
          </div>
        </div>
        <p class="text-sm text-gray-600 mt-2 text-center">Subiendo imagen... {{ uploadProgress }}%</p>
      </div>
    </div>
  `,
  styles: [`
    .image-upload-container {
      text-align: center;
    }
    
    .image-preview img {
      transition: transform 0.2s ease;
    }
    
    .image-preview img:hover {
      transform: scale(1.05);
    }
  `]
})
export class ImageUploadComponent {
  @Input() currentImageUrl: string | null = null;
  @Input() userId: string = '';
  @Input() defaultAvatar: string = 'https://via.placeholder.com/150x150/6366f1/ffffff?text=👤';
  @Input() userName: string = '';
  
  @Output() imageUploaded = new EventEmitter<{ url: string; path: string }>();
  @Output() imageRemoved = new EventEmitter<void>();

  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;

  constructor(
    private supabaseService: SupabaseService,
    private notificationService: NotificationService
  ) {}

  triggerFileInput(): void {
    if (this.uploading) return;
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Archivo seleccionado:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validar archivo
    const validation = this.supabaseService.validateImageFile(file);
    if (!validation.valid) {
      this.notificationService.error(validation.message!, 'Archivo inválido');
      return;
    }

    this.selectedFile = file;
    this.uploadImage(file);
  }

  async uploadImage(file: File): Promise<void> {
    if (!this.userId) {
      this.notificationService.error('Usuario no identificado', 'Error');
      return;
    }

    try {
      this.uploading = true;
      this.uploadProgress = 0;

      // Simular progreso
      const progressInterval = setInterval(() => {
        if (this.uploadProgress < 90) {
          this.uploadProgress += 10;
        }
      }, 100);

      // Redimensionar imagen (opcional)
      const resizedFile = await this.supabaseService.resizeImage(file);
      
      // Subir imagen
      const result = await this.supabaseService.uploadProfileImage(resizedFile, this.userId);
      
      clearInterval(progressInterval);
      this.uploadProgress = 100;

      if (result) {
        console.log('✅ Imagen subida exitosamente:', result);
        this.imageUploaded.emit(result);
        this.notificationService.success('Imagen de perfil actualizada correctamente', 'Éxito');
      } else {
        throw new Error('Error al subir la imagen');
      }

    } catch (error: any) {
      console.error('❌ Error al subir imagen:', error);
      this.notificationService.error('Error al subir la imagen: ' + error.message, 'Error');
    } finally {
      this.uploading = false;
      this.uploadProgress = 0;
      this.selectedFile = null;
      
      // Limpiar el input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }

  removeImage(): void {
    if (this.uploading) return;
    
    this.imageRemoved.emit();
    this.notificationService.success('Imagen de perfil eliminada', 'Éxito');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getInitials(): string {
    if (!this.userName || this.userName.trim() === '') {
      return 'U'; // Usuario por defecto
    }
    
    const names = this.userName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    // Tomar primera letra del nombre y primera letra del apellido
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
}