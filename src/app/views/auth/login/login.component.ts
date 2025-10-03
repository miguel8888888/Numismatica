import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      const { email, password, rememberMe } = this.loginForm.value;

      this.authService.login(email, password, rememberMe).subscribe({
        next: (response: any) => {
          console.log('✅ Login exitoso:', response);
          this.loading = false;
          
          // Verificar que la sesión se estableció correctamente
          if (response.access_token || response.token) {
            console.log('🔐 Token recibido, redirigiendo...');
            // Redirigir a la URL original o al dashboard por defecto
            const returnUrl = this.route?.snapshot?.queryParams?.['returnUrl'] || '/admin/dashboard';
            console.log('🧭 Redirigiendo a:', returnUrl);
            this.router.navigateByUrl(returnUrl);
          } else {
            this.error = 'Error en la respuesta del servidor. Token no encontrado.';
          }
        },
        error: (error: any) => {
          console.error('❌ Error en login:', error);
          
          // Manejo de diferentes tipos de error
          if (error.status === 401) {
            this.error = 'Credenciales incorrectas. Verifica tu email y contraseña.';
          } else if (error.status === 403) {
            this.error = 'Cuenta bloqueada o inactiva. Contacta al administrador.';
          } else if (error.status === 0) {
            this.error = 'No se puede conectar al servidor. Verifica tu conexión.';
          } else if (error.error?.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Error inesperado. Intenta nuevamente.';
          }
          
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['email']) {
        return 'Formato de email inválido';
      }
      if (field.errors['minlength']) {
        return `La contraseña debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Contraseña'
    };
    return labels[fieldName] || fieldName;
  }
}