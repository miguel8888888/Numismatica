import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ImageUploadComponent } from '../../../components/image-upload/image-upload.component';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  user: any = null;
  loading = false;
  editingProfile = false;
  editingPassword = false;
  
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  profileError = '';
  passwordError = '';
  profileSuccess = '';
  passwordSuccess = '';

  // Imagen por defecto
  defaultAvatar = 'https://via.placeholder.com/150x150/6366f1/ffffff?text=👤';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
  }

  initForms(): void {
    // Formulario de perfil
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]],
      direccion: [''],
      ciudad: [''],
      pais: ['']
    });

    // Formulario de cambio de contraseña
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  loadUserData(): void {
    // Obtener datos del usuario actual del storage primero
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.profileForm.patchValue({
        nombre: this.user.nombre || '',
        apellidos: this.user.apellidos || '',
        email: this.user.email || '',
        telefono: this.user.telefono || '',
        direccion: this.user.direccion || '',
        ciudad: this.user.ciudad || '',
        pais: this.user.pais || ''
      });
    }

    // Intentar obtener datos actualizados del backend
    console.log('👤 Cargando datos del perfil desde el backend...');
    this.authService.getUserProfile().subscribe({
      next: (response) => {
        console.log('✅ Datos del perfil obtenidos:', response);
        // Los datos ya se actualizan automáticamente en el AuthService
        const updatedUser = this.authService.getCurrentUser();
        if (updatedUser) {
          this.user = updatedUser;
          this.profileForm.patchValue({
            nombre: updatedUser.nombre || '',
            apellidos: updatedUser.apellidos || '',
            email: updatedUser.email || '',
            telefono: updatedUser.telefono || '',
            direccion: updatedUser.direccion || '',
            ciudad: updatedUser.ciudad || '',
            pais: updatedUser.pais || ''
          });
        }
      },
      error: (error) => {
        console.warn('⚠️ No se pudieron obtener los datos del backend, usando datos locales:', error);
        // No mostrar error al usuario, usar datos locales
      }
    });
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      const confirmPasswordControl = form.get('confirmPassword');
      confirmPasswordControl?.setErrors({ mismatch: true });
    } else {
      const confirmPasswordControl = form.get('confirmPassword');
      if (confirmPasswordControl?.errors?.['mismatch']) {
        delete confirmPasswordControl.errors['mismatch'];
        if (Object.keys(confirmPasswordControl.errors).length === 0) {
          confirmPasswordControl.setErrors(null);
        }
      }
    }
    return null;
  }

  // Métodos para editar perfil
  startEditingProfile(): void {
    this.editingProfile = true;
    this.profileError = '';
    this.profileSuccess = '';
  }

  cancelEditingProfile(): void {
    this.editingProfile = false;
    this.loadUserData(); // Restaurar valores originales
    this.profileError = '';
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.profileError = '';

      // Verificar estado de autenticación antes de la petición
      const token = this.authService.getToken();
      const isAuth = this.authService.isAuthenticated();
      const currentUser = this.authService.getCurrentUser();
      
      console.log('🔍 Estado DETALLADO antes de actualizar perfil:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...',
        isAuthenticated: isAuth,
        hasCurrentUser: !!currentUser,
        userEmail: currentUser?.email,
        fullToken: token,
        apiUrl: 'https://fastapi-railway-ihky.onrender.com/auth/perfil/'
      });

      const profileData = this.profileForm.value;
      console.log('💾 Datos del perfil a guardar:', profileData);
      console.log('📡 Preparando request HTTP PUT...');
      
      this.authService.updateProfile(profileData).subscribe({
        next: (response) => {
          console.log('✅ Perfil actualizado exitosamente:', response);
          this.profileSuccess = 'Perfil actualizado correctamente';
          this.editingProfile = false;
          this.loading = false;
          
          // Actualizar los datos del usuario en el formulario
          this.loadUserData();
          
          this.notificationService.success('Tu perfil ha sido actualizado exitosamente', 'Perfil Actualizado');
        },
        error: (error) => {
          console.error('❌ Error al actualizar perfil:', error);
          
          let errorMessage = 'Error al actualizar el perfil. Inténtalo de nuevo.';
          if (error.status === 0) {
            errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
          } else if (error.status === 404) {
            errorMessage = 'Endpoint no encontrado. El backend no está configurado.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.profileError = errorMessage;
          this.loading = false;
          this.notificationService.error(errorMessage, 'Error de Actualización');
        }
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  // Métodos para cambiar contraseña
  startEditingPassword(): void {
    this.editingPassword = true;
    this.passwordError = '';
    this.passwordSuccess = '';
    this.passwordForm.reset();
  }

  cancelEditingPassword(): void {
    this.editingPassword = false;
    this.passwordForm.reset();
    this.passwordError = '';
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      this.passwordError = '';

      const passwordData = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value
      };
      
      console.log('🔒 DETALLE - Preparando cambio de contraseña:', {
        formValid: this.passwordForm.valid,
        hasCurrentPassword: !!passwordData.currentPassword,
        hasNewPassword: !!passwordData.newPassword,
        currentPasswordLength: passwordData.currentPassword?.length,
        newPasswordLength: passwordData.newPassword?.length,
        formErrors: this.passwordForm.errors,
        fieldErrors: {
          currentPassword: this.passwordForm.get('currentPassword')?.errors,
          newPassword: this.passwordForm.get('newPassword')?.errors,
          confirmPassword: this.passwordForm.get('confirmPassword')?.errors
        }
      });
      
      this.authService.changePassword(passwordData).subscribe({
        next: (response) => {
          console.log('✅ Contraseña cambiada exitosamente:', response);
          this.passwordSuccess = 'Contraseña cambiada correctamente';
          this.editingPassword = false;
          this.loading = false;
          
          // Resetear el formulario y visibilidad de contraseñas
          this.passwordForm.reset();
          this.resetPasswordVisibility();
          
          this.notificationService.success('Tu contraseña ha sido actualizada exitosamente', 'Contraseña Actualizada');
        },
        error: (error) => {
          console.error('❌ Error al cambiar contraseña:', error);
          
          let errorMessage = 'Error al cambiar la contraseña. Verifica tu contraseña actual.';
          if (error.status === 0) {
            errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
          } else if (error.status === 404) {
            errorMessage = 'Endpoint no encontrado. El backend no está configurado.';
          } else if (error.status === 401) {
            errorMessage = 'Contraseña actual incorrecta.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.passwordError = errorMessage;
          this.loading = false;
          this.notificationService.error(errorMessage, 'Error de Actualización');
        }
      });
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  // Métodos auxiliares
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['email']) {
        return 'Formato de email inválido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'newPassword') {
          return 'Debe incluir: minúscula, mayúscula, número y símbolo especial';
        }
        return 'Formato inválido';
      }
      if (field.errors['mismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      apellidos: 'Apellidos',
      email: 'Email',
      telefono: 'Teléfono',
      direccion: 'Dirección',
      ciudad: 'Ciudad',
      pais: 'País',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      confirmPassword: 'Confirmar contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch(field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  getUserInitials(): string {
    if (this.user?.nombre) {
      return this.user.nombre
        .split(' ')
        .map((word: string) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return '👤';
  }

  resetPasswordVisibility(): void {
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  // Métodos para manejo de imagen de perfil
  onImageUploaded(imageData: { url: string; path: string }): void {
    console.log('🖼️ Imagen subida:', imageData);
    
    // Actualizar la imagen en el usuario local
    if (this.user) {
      this.user.profile_image = imageData.url;
    }

    // Aquí puedes enviar la URL al backend para actualizar el perfil
    // Por ejemplo, actualizar el campo profile_image en la base de datos
    this.updateProfileImage(imageData.url, imageData.path);
  }

  onImageRemoved(): void {
    console.log('🗑️ Imagen removida');
    
    // Actualizar la imagen en el usuario local
    if (this.user) {
      this.user.profile_image = null;
    }

    // Aquí puedes enviar null al backend para remover la imagen
    this.updateProfileImage(null, null);
  }

  private async updateProfileImage(imageUrl: string | null, imagePath: string | null): Promise<void> {
    const updateData: any = {
      profile_image: imageUrl,
      profile_image_path: imagePath
    };

    console.log('📡 Actualizando imagen de perfil en el backend...', updateData);

    // Si estamos eliminando la imagen, primero eliminar de Supabase la anterior
    if (imageUrl === null && this.user?.profile_image_path) {
      console.log('🗑️ Eliminando imagen anterior de Supabase:', this.user.profile_image_path);
      try {
        await this.supabaseService.deleteProfileImage(this.user.profile_image_path);
        console.log('✅ Imagen anterior eliminada de Supabase');
      } catch (error: any) {
        console.warn('⚠️ No se pudo eliminar imagen anterior:', error);
      }
    }

    // Llamar al backend para actualizar la imagen usando el método específico
    this.authService.updateProfileImage(updateData).subscribe({
      next: (response) => {
        console.log('✅ Imagen de perfil actualizada en el backend:', response);
        this.notificationService.success(
          imageUrl ? 'Imagen de perfil actualizada correctamente' : 'Imagen de perfil eliminada correctamente', 
          'Éxito'
        );
        
        // Actualizar datos locales
        if (response.user) {
          this.user = { ...this.user, ...response.user };
        }
      },
      error: (error) => {
        console.error('❌ Error al actualizar imagen en el backend:', error);
        this.notificationService.error('Error al guardar la imagen de perfil', 'Error');
      }
    });
  }

  // Método temporal para debuggear autenticación (compatible con SSR)
  testAuthStatus(): void {
    const token = this.authService.getToken();
    const isAuth = this.authService.isAuthenticated();
    const currentUser = this.authService.getCurrentUser();
    
    // Verificar localStorage/sessionStorage de manera segura (solo en el browser)
    let localStorageData = { token: false, user: false };
    let sessionStorageData = { token: false, user: false };
    
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorageData = {
        token: !!localStorage.getItem('numismatica_token'),
        user: !!localStorage.getItem('numismatica_user')
      };
    }
    
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorageData = {
        token: !!sessionStorage.getItem('numismatica_token'),
        user: !!sessionStorage.getItem('numismatica_user')
      };
    }
    
    console.log('🔍 TEST - Estado completo de autenticación:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? token.substring(0, 50) + '...' : 'No token',
      isAuthenticated: isAuth,
      hasCurrentUser: !!currentUser,
      currentUser: currentUser,
      localStorage: localStorageData,
      sessionStorage: sessionStorageData,
      isBrowser: typeof window !== 'undefined'
    });

    // Mostrar alerta con el estado (solo en el browser)
    if (typeof window !== 'undefined') {
      const status = isAuth ? 'AUTENTICADO ✅' : 'NO AUTENTICADO ❌';
      alert(`Estado: ${status}\nToken: ${!!token ? 'Presente' : 'Ausente'}\nVer consola para más detalles`);
    }
  }

  // Método para probar conexión con Supabase
  async testSupabase(): Promise<void> {
    console.log('🧪 Iniciando diagnóstico completo de Supabase...');
    
    try {
      // 1. Test básico de conexión
      console.log('1️⃣ Probando conexión básica...');
      const isConnected = await this.supabaseService.testConnection();
      
      if (!isConnected) {
        throw new Error('Conexión básica falló');
      }
      
      // 2. Test de configuración del bucket y políticas
      console.log('2️⃣ Verificando configuración del bucket...');
      await this.supabaseService.checkBucketConfiguration();
      
      // 3. Si todo está bien
      console.log('✅ Todos los tests pasaron');
      this.notificationService.success('Supabase configurado correctamente', 'Éxito');
      alert('✅ Supabase completamente funcional\n\n- Conexión: OK\n- Bucket: Accesible\n- Políticas: Configuradas\n- Upload: Funcionando');
      
    } catch (error: any) {
      console.error('❌ Error en diagnóstico de Supabase:', error);
      this.notificationService.error(`Error de Supabase: ${error.message}`, 'Error');
      
      const errorMsg = error.message.includes('row-level security policy') 
        ? '❌ ERROR: Políticas RLS no configuradas\n\n📋 SOLUCIÓN:\n1. Ve a Supabase Dashboard\n2. Abre SQL Editor\n3. Ejecuta el contenido de supabase-policies.sql'
        : `❌ Error: ${error.message}\n\nVer consola para más detalles`;
        
      alert(errorMsg);
    }
  }
}