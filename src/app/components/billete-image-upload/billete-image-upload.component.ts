import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { NotificationService } from '../../services/notification.service';

export interface BilleteImageData {
  url: string;
  path: string;
}

@Component({
  selector: 'app-billete-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="billete-image-upload">
      <!-- Contenedor de imagen -->
      <div class="image-container relative group">
        <!-- Imagen si existe -->
        <div 
          *ngIf="currentImageUrl || previewUrl; else placeholderTemplate"
          class="h-32 w-48 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          (click)="triggerFileInput()"
        >
          <img 
            [src]="previewUrl || currentImageUrl" 
            [alt]="imageType + ' del billete'"
            class="w-full h-full object-cover"
          />
          <!-- Overlay al hacer hover -->
          <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="text-center text-white">
              <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p class="text-sm">Cambiar imagen</p>
            </div>
          </div>
        </div>

        <!-- Placeholder si no hay imagen -->
        <ng-template #placeholderTemplate>
          <div 
            class="h-32 w-48 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors"
            (click)="triggerFileInput()"
          >
            <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p class="text-sm text-gray-500 text-center">
              <span class="font-medium">{{ imageType }}</span><br>
              Haz clic para subir
            </p>
          </div>
        </ng-template>

        <!-- Botón eliminar si hay imagen -->
        <button 
          *ngIf="(currentImageUrl || previewUrl) && !uploading"
          (click)="removeImage()"
          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Input file oculto -->
      <input
        #fileInput
        [id]="'fileInput-' + imageType"
        type="file"
        class="hidden"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        (change)="onFileSelected($event)"
        [disabled]="uploading"
      />

      <!-- Barra de progreso -->
      <div *ngIf="uploading" class="mt-3">
        <div class="bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            [style.width.%]="uploadProgress">
          </div>
        </div>
        <p class="text-sm text-gray-600 mt-2 text-center">Subiendo {{ imageType.toLowerCase() }}... {{ uploadProgress }}%</p>
      </div>

      <!-- Información del archivo -->
      <div *ngIf="selectedFile && !uploading" class="mt-2 text-xs text-gray-500 text-center">
        {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
      </div>
    </div>
  `,
  styles: [`
    .billete-image-upload {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .image-container {
      transition: transform 0.2s ease;
    }
    
    .image-container:hover {
      transform: scale(1.02);
    }
  `]
})
export class BilleteImageUploadComponent {
  @Input() currentImageUrl: string | null = null;
  @Input() imageType: 'Anverso' | 'Reverso' = 'Anverso';
  @Input() paisId: string = '';
  @Input() billeteId: string = '';
  
  @Output() imageUploaded = new EventEmitter<BilleteImageData>();
  @Output() imageRemoved = new EventEmitter<void>();

  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  previewUrl: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private notificationService: NotificationService
  ) {}

  triggerFileInput(): void {
    if (this.uploading) return;
    
    // Usar un selector más específico basado en el tipo de imagen
    const fileInput = document.querySelector(`#fileInput-${this.imageType}`) as HTMLInputElement;
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

    // Crear preview temporal
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.uploadImage(file);
  }

  async uploadImage(file: File): Promise<void> {
    console.log('🔍 Debugging upload:', {
      paisId: this.paisId,
      billeteId: this.billeteId,
      imageType: this.imageType
    });

    if (!this.paisId || this.paisId === '' || this.paisId === '0') {
      console.warn('⚠️ País no seleccionado, usando "sin-pais" como fallback:', this.paisId);
      // Permitir la subida pero con una carpeta temporal
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
      
      // Subir imagen del billete
      const result = await this.uploadBilleteImage(resizedFile);
      
      clearInterval(progressInterval);
      this.uploadProgress = 100;

      if (result) {
        console.log('✅ Imagen de billete subida exitosamente:', result);
        // Limpiar preview temporal ya que tenemos la imagen final
        this.previewUrl = null;
        this.imageUploaded.emit(result);
        this.notificationService.success(`Imagen del ${this.imageType.toLowerCase()} actualizada correctamente`, 'Éxito');
      } else {
        throw new Error('Error al subir la imagen');
      }

    } catch (error: any) {
      console.error('❌ Error al subir imagen:', error);
      this.notificationService.error('Error al subir la imagen: ' + error.message, 'Error');
      // En caso de error, limpiar preview
      this.previewUrl = null;
    } finally {
      this.uploading = false;
      this.uploadProgress = 0;
      this.selectedFile = null;
      
      // Limpiar el input específico
      const fileInput = document.querySelector(`#fileInput-${this.imageType}`) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }

  private async uploadBilleteImage(file: File): Promise<BilleteImageData | null> {
    try {
      console.log('📤 Subiendo imagen de billete...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        paisId: this.paisId,
        imageType: this.imageType
      });

      // Generar nombre: billetes/pais-id/billete-id/tipo-timestamp.ext
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${this.imageType.toLowerCase()}-${timestamp}.${fileExt}`;
      const paisPath = this.paisId && this.paisId !== '' && this.paisId !== '0' ? this.paisId : 'sin-pais';
      const filePath = `billetes/${paisPath}/${this.billeteId || 'temp'}/${fileName}`;

      console.log('📤 Intentando subir archivo:', {
        bucket: 'img-billetes',
        path: filePath,
        fileSize: file.size,
        fileType: file.type
      });

      // Usar el método del SupabaseService para subir la imagen
      const result = await this.supabaseService.uploadBilleteImage(file, filePath);

      if (result) {
        console.log('✅ Imagen de billete subida exitosamente:', result);
        return result;
      } else {
        throw new Error('Error al subir la imagen del billete');
      }

    } catch (error) {
      console.error('❌ Error en uploadBilleteImage:', error);
      return null;
    }
  }

  removeImage(): void {
    if (this.uploading) return;
    
    // Limpiar preview temporal
    this.previewUrl = null;
    
    this.imageRemoved.emit();
    this.notificationService.success(`Imagen del ${this.imageType.toLowerCase()} eliminada`, 'Éxito');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}