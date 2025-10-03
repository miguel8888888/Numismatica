import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  loading = false;
  success = false;
  error = '';
  token = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener token de los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.error = 'Token de recuperación inválido o expirado';
      }
    });
    
    this.initForm();
  }

  initForm(): void {
    this.resetForm = this.fb.group({
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

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
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

  onSubmit(): void {
    if (this.resetForm.valid && this.token) {
      this.loading = true;
      this.error = '';
      this.success = false;

      const { newPassword } = this.resetForm.value;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (response: any) => {
          console.log('Reset exitoso:', response);
          this.success = true;
          this.loading = false;
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error: any) => {
          console.error('Error en reset:', error);
          this.error = error.error?.message || 'Token inválido o expirado. Solicita un nuevo enlace de recuperación.';
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.resetForm.controls).forEach(key => {
      const control = this.resetForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.resetForm.get(fieldName);
    if (field?.errors) {
      console.log('🔍 Errores de validación para', fieldName + ':', field.errors);
      console.log('🔍 Valor actual:', field.value);
      
      if (field.errors['required']) {
        return fieldName === 'newPassword' ? 'La contraseña es requerida' : 'Confirma tu contraseña';
      }
      if (field.errors['minlength']) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      if (field.errors['pattern']) {
        return 'Debe incluir: minúscula, mayúscula, número y símbolo especial (@$!%*?&.)';
      }
      if (field.errors['mismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }
    return '';
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  backToForgot(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}