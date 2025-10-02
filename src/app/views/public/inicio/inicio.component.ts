import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  constructor(private router: Router) {}

  irAContinente(continente: string) {
    console.log('Navegando a continente:', continente);
    this.router.navigate(['/explorar-billetes'], { 
      queryParams: { continente: continente }
    });
  }
}
