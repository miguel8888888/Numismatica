import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-destacados',
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-20">
      <div class="text-center mb-16">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">Billetes Destacados</h1>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          Descubre las piezas más raras, populares y valiosas de nuestra colección
        </p>
      </div>
      
      <!-- Próximamente -->
      <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-12 text-center border border-yellow-200">
        <i class="fas fa-star text-yellow-500 text-6xl mb-6"></i>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Próximamente</h2>
        <p class="text-gray-600 text-lg">
          Estamos preparando una selección especial de billetes destacados para ti. 
          ¡Vuelve pronto para descubrir estas piezas únicas!
        </p>
      </div>
    </div>
  `,
  styles: ``
})
export class DestacadosComponent {

}