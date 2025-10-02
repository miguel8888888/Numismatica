import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  formularioContacto = {
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  };

  enviandoFormulario = false;

  enviarFormulario() {
    this.enviandoFormulario = true;
    
    // Simular envío del formulario
    setTimeout(() => {
      alert('¡Gracias por contactarnos! Te responderemos pronto.');
      this.limpiarFormulario();
      this.enviandoFormulario = false;
    }, 2000);
  }

  limpiarFormulario() {
    this.formularioContacto = {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    };
  }
}