import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrosService } from '../../../services/registros.service';

interface PaisRegistro {
  id?: string;
  pais: string;
  bandera: string;
  continente?: string;
  fechaCreacion?: Date;
}

@Component({
  selector: 'app-registrar-paises',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-paises.component.html',
  styleUrl: './registrar-paises.component.css'
})
export class RegistrarPaisesComponent implements OnInit {
  formularioPais: FormGroup;
  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  imagenPreview: string | null = null;
  paisesRecientes: PaisRegistro[] = [];

  // Lista de códigos de países más comunes para el selector
  codigosPaises = [
    { codigo: 'ar', nombre: 'Argentina' },
    { codigo: 'br', nombre: 'Brasil' },
    { codigo: 'cl', nombre: 'Chile' },
    { codigo: 'co', nombre: 'Colombia' },
    { codigo: 'us', nombre: 'Estados Unidos' },
    { codigo: 'mx', nombre: 'México' },
    { codigo: 'pe', nombre: 'Perú' },
    { codigo: 'es', nombre: 'España' },
    { codigo: 'fr', nombre: 'Francia' },
    { codigo: 'de', nombre: 'Alemania' },
    { codigo: 'it', nombre: 'Italia' },
    { codigo: 'gb', nombre: 'Reino Unido' },
    { codigo: 'pt', nombre: 'Portugal' },
    { codigo: 'cn', nombre: 'China' },
    { codigo: 'jp', nombre: 'Japón' },
    { codigo: 'in', nombre: 'India' },
    { codigo: 'kr', nombre: 'Corea del Sur' },
    { codigo: 'au', nombre: 'Australia' },
    { codigo: 'ca', nombre: 'Canadá' },
    { codigo: 'ru', nombre: 'Rusia' }
  ];

  constructor(
    private fb: FormBuilder,
    private registrosService: RegistrosService,
    private router: Router
  ) {
    this.formularioPais = this.fb.group({
      pais: ['', [Validators.required, Validators.minLength(2)]],
      bandera: ['', Validators.required],
      continente: [''],
      descripcion: ['']
    });
  }

  ngOnInit() {
    this.cargarPaisesRecientes();
  }

  onSubmit() {
    if (this.formularioPais.valid) {
      this.cargando = true;
      const paisData = this.formularioPais.value;
      
      this.registrosService.crearRegistroPais(paisData).subscribe({
        next: (response) => {
          this.mostrarMensaje('País registrado exitosamente', 'success');
          this.formularioPais.reset();
          this.imagenPreview = null;
          this.cargarPaisesRecientes();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al registrar país:', error);
          this.mostrarMensaje('Error al registrar el país. Inténtalo de nuevo.', 'error');
          this.cargando = false;
        }
      });
    } else {
      this.mostrarMensaje('Por favor, completa todos los campos requeridos.', 'error');
      this.marcarCamposComoTocados();
    }
  }

  onCodigoPaisChange(event: any) {
    const codigo = event.target.value;
    this.formularioPais.patchValue({ bandera: codigo });
  }

  onArchivoSeleccionado(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      // Crear FormData para subir imagen
      const formData = new FormData();
      formData.append('file', archivo);
      
      this.registrosService.subirImagen(formData).subscribe({
        next: (response) => {
          this.imagenPreview = response.url;
          this.formularioPais.patchValue({ bandera: response.url });
        },
        error: (error) => {
          console.error('Error al subir imagen:', error);
          this.mostrarMensaje('Error al subir la imagen', 'error');
        }
      });
    }
  }

  cargarPaisesRecientes() {
    this.registrosService.obtenerRegistrosPaises().subscribe({
      next: (paises) => {
        // Tomar los últimos 5 países registrados
        this.paisesRecientes = paises.slice(-5).reverse();
      },
      error: (error) => {
        console.error('Error al cargar países recientes:', error);
      }
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 5000);
  }

  marcarCamposComoTocados() {
    Object.keys(this.formularioPais.controls).forEach(key => {
      this.formularioPais.get(key)?.markAsTouched();
    });
  }

  obtenerErrorCampo(campo: string): string {
    const control = this.formularioPais.get(campo);
    if (control?.errors && control?.touched) {
      if (control.errors['required']) {
        return `El campo ${campo} es requerido`;
      }
      if (control.errors['minlength']) {
        return `El campo ${campo} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  irAListaPaises() {
    this.router.navigate(['/paises']);
  }

  limpiarFormulario() {
    this.formularioPais.reset();
    this.imagenPreview = null;
    this.mensaje = '';
    this.tipoMensaje = '';
  }
}
