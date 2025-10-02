import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  loading = false;
  success = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = false;

      const { email } = this.forgotForm.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response: any) => {
          console.log('Recuperación exitosa:', response);
          this.success = true;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error en recuperación:', error);
          this.error = 'No se pudo enviar el email de recuperación. Verifica que el email esté registrado.';
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotForm.controls).forEach(key => {
      const control = this.forgotForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return 'Email es requerido';
      }
      if (field.errors['email']) {
        return 'Formato de email inválido';
      }
    }
    return '';
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}