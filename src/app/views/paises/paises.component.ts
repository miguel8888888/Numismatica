import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrosService } from '../../services/registros.service';
import { CardComponent } from '../../components/card/card.component';

@Component({
  selector: 'app-paises',
  imports: [CommonModule, CardComponent],
  template: `
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-6">Gestión de Países</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-card 
          *ngFor="let pais of paises"
          [bandera]="pais.bandera"
          [precio]="'N/A'"
          [denominacion]="pais.pais"
        ></app-card>
      </div>
    </div>
  `
})
export class PaisesComponent implements OnInit {
  paises: any[] = [];

  constructor(private registrosService: RegistrosService) {}

  ngOnInit() {
    this.registrosService.obtenerRegistrosPaises().subscribe(
      data => this.paises = data,
      error => console.error('Error:', error)
    );
  }
}