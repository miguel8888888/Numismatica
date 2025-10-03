import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly BUCKET_NAME = environment.supabaseBucket || 'img-billetes';

  constructor() {
    // Configurar con tus credenciales de Supabase
    this.supabase = createClient(
      environment.supabaseUrl, 
      environment.supabaseKey
    );
    
    console.log('🔗 Supabase inicializado:', {
      url: environment.supabaseUrl,
      bucket: this.BUCKET_NAME,
      hasKey: !!environment.supabaseKey
    });
  }

  /**
   * Probar conexión con Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Probando conexión con Supabase...');
      
      // Intentar listar archivos del bucket (sin autenticación)
      const { data, error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });

      if (error) {
        console.error('❌ Error de conexión con Supabase:', error);
        return false;
      }

      console.log('✅ Conexión con Supabase exitosa:', data);
      return true;
    } catch (error) {
      console.error('❌ Error al probar conexión:', error);
      return false;
    }
  }

  /**
   * Verificar configuración del bucket y políticas
   */
  async checkBucketConfiguration(): Promise<void> {
    try {
      console.log('🔍 Verificando configuración del bucket...');
      
      // 1. Verificar si el bucket existe y es accesible
      const { data: listData, error: listError } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });

      if (listError) {
        console.error('❌ Bucket no accesible:', listError.message);
        throw new Error(`Bucket ${this.BUCKET_NAME} no accesible: ${listError.message}`);
      }

      console.log('✅ Bucket accesible:', this.BUCKET_NAME);

      // 2. Intentar subir un archivo de prueba pequeño
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const testPath = 'test-connection.txt';

      const { error: uploadError } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .upload(testPath, testFile, { upsert: true });

      if (uploadError) {
        console.error('❌ No se puede subir archivos:', uploadError.message);
        throw new Error(`Políticas de upload no configuradas: ${uploadError.message}`);
      }

      console.log('✅ Políticas de upload funcionando');

      // 3. Limpiar archivo de prueba
      await this.supabase.storage.from(this.BUCKET_NAME).remove([testPath]);
      console.log('✅ Configuración del bucket verificada correctamente');

    } catch (error: any) {
      console.error('❌ Error en configuración del bucket:', error);
      throw error;
    }
  }

  /**
   * Subir imagen de perfil siguiendo el patrón del backend
   */
  async uploadProfileImage(file: File, userId: string): Promise<{ url: string; path: string } | null> {
    try {
      console.log('📤 Subiendo imagen de perfil...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId: userId
      });

      // Generar nombre según el patrón del backend: user123/profile-timestamp.ext
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `profile-${timestamp}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Redimensionar imagen si es necesario (max 800x800)
      const resizedFile = await this.resizeImage(file, 800, 800);

      console.log('📤 Intentando subir archivo:', {
        bucket: this.BUCKET_NAME,
        path: filePath,
        fileSize: resizedFile.size,
        fileType: resizedFile.type
      });

      // Subir la imagen
      const { data, error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, resizedFile, {
          cacheControl: '3600',
          upsert: true // Permitir reemplazar si existe
        });

      if (error) {
        console.error('❌ Error detallado al subir imagen:', {
          error: error,
          message: error.message,
          bucket: this.BUCKET_NAME,
          path: filePath
        });
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      console.log('✅ Imagen subida exitosamente:', data);

      // Obtener la URL pública
      const { data: urlData } = this.supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath
      };

    } catch (error) {
      console.error('❌ Error en uploadProfileImage:', error);
      return null;
    }
  }

  /**
   * Eliminar imagen de perfil anterior
   */
  async deleteProfileImage(imagePath: string): Promise<boolean> {
    try {
      console.log('🗑️ Eliminando imagen anterior:', imagePath);

      const { error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .remove([imagePath]);

      if (error) {
        console.error('❌ Error al eliminar imagen:', error);
        return false;
      }

      console.log('✅ Imagen eliminada exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error en deleteProfileImage:', error);
      return false;
    }
  }

  /**
   * Redimensionar imagen antes de subir (opcional)
   */
  async resizeImage(file: File, maxWidth: number = 300, maxHeight: number = 300): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }

        // Redimensionar
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a File
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        }, file.type, 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validar archivo de imagen
   */
  validateImageFile(file: File): { valid: boolean; message?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WebP'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'El archivo es muy grande. Tamaño máximo: 5MB'
      };
    }

    return { valid: true };
  }
}