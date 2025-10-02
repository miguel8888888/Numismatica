import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegistrosService } from '../../../services/registros.service';

interface Pais {
  id: string;
  pais: string;
  bandera: string | null;
  continente?: string;
}

@Component({
  selector: 'app-paises',
  imports: [CommonModule],
  templateUrl: './paises.component.html',
  styleUrl: './paises.component.css'
})
export class PaisesComponent implements OnInit {
  paises: Pais[] = [];
  paisesFiltrados: Pais[] = [];
  filtroActivo: string = 'todos';
  billetes: any[] = []; // Para contar billetes por país

  // Mapeo de países a continentes (expandido con más países)
  continentesPorPais: { [key: string]: string } = {
    // América
    'ar': 'america', 'br': 'america', 'cl': 'america', 'co': 'america', 
    'us': 'america', 'mx': 'america', 'pe': 'america', 'ca': 'america',
    'ec': 'america', 've': 'america', 'uy': 'america', 'py': 'america',
    'bo': 'america', 'pa': 'america', 'cr': 'america', 'ni': 'america',
    'hn': 'america', 'gt': 'america', 'sv': 'america', 'bz': 'america',
    'cu': 'america', 'do': 'america', 'ht': 'america', 'jm': 'america',
    
    // Europa
    'es': 'europa', 'fr': 'europa', 'de': 'europa', 'it': 'europa',
    'gb': 'europa', 'pt': 'europa', 'nl': 'europa', 'be': 'europa',
    'ch': 'europa', 'at': 'europa', 'se': 'europa', 'no': 'europa',
    'dk': 'europa', 'fi': 'europa', 'pl': 'europa', 'cz': 'europa',
    'hu': 'europa', 'ro': 'europa', 'bg': 'europa', 'hr': 'europa',
    'gr': 'europa', 'ie': 'europa', 'sk': 'europa', 'si': 'europa',
    
    // Asia
    'cn': 'asia', 'jp': 'asia', 'in': 'asia', 'kr': 'asia',
    'th': 'asia', 'vn': 'asia', 'my': 'asia', 'sg': 'asia',
    'ph': 'asia', 'id': 'asia', 'pk': 'asia', 'bd': 'asia',
    'ir': 'asia', 'iq': 'asia', 'sa': 'asia', 'ae': 'asia',
    'tr': 'asia', 'il': 'asia', 'jo': 'asia', 'lb': 'asia',
    
    // África
    'za': 'africa', 'eg': 'africa', 'ma': 'africa', 'ng': 'africa',
    'ke': 'africa', 'gh': 'africa', 'et': 'africa', 'tz': 'africa',
    'ug': 'africa', 'mz': 'africa', 'mg': 'africa', 'ao': 'africa',
    'zm': 'africa', 'zw': 'africa', 'bw': 'africa', 'na': 'africa',
    
    // Oceanía
    'au': 'oceania', 'nz': 'oceania', 'fj': 'oceania', 'pg': 'oceania',
    'sb': 'oceania', 'vu': 'oceania', 'ws': 'oceania', 'to': 'oceania',
    
    // Casos especiales
    'unknown': 'Sin clasificar',
    '': 'Sin clasificar',
    'null': 'Sin clasificar'
  };

  constructor(
    private registrosService: RegistrosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarPaises();
    this.cargarBilletes();
  }

  cargarPaises() {
    this.registrosService.obtenerRegistrosPaises().subscribe(
      data => {
        console.log('Datos recibidos de la API:', data); // Para debug
        this.paises = data.map((pais: any) => ({
          ...pais,
          // Validar que la bandera no sea null/undefined antes de procesar
          bandera: pais.bandera || 'unknown',
          continente: this.obtenerContinente(pais.bandera)
        }));
        this.paisesFiltrados = [...this.paises];
        console.log('Países procesados:', this.paises); // Para debug
      },
      error => console.error('Error al cargar países:', error)
    );
  }

  cargarBilletes() {
    // Simular carga de billetes - reemplaza con tu servicio real
    this.billetes = [];
  }

  obtenerContinente(codigoPais: string | null | undefined): string {
    if (!codigoPais || typeof codigoPais !== 'string') {
      return 'Sin clasificar';
    }
    return this.continentesPorPais[codigoPais.toLowerCase()] || 'Sin clasificar';
  }

  filtrarPorContinente(continente: string) {
    this.filtroActivo = continente;
    if (continente === 'todos') {
      this.paisesFiltrados = [...this.paises];
    } else {
      this.paisesFiltrados = this.paises.filter((pais: Pais) => 
        pais.continente === continente
      );
    }
  }

  verDetallesPais(pais: Pais) {
    console.log('Ver detalles del país:', pais);
    // Aquí puedes navegar a una página de detalles del país
    // this.router.navigate(['/pais', pais.id]);
  }

  contarBilletesPorPais(paisId: string): number {
    // Simular conteo de billetes - reemplaza con tu lógica real
    return Math.floor(Math.random() * 50) + 1;
  }

  calcularTotalBilletes(): number {
    return this.paises.reduce((total, pais: Pais) => 
      total + this.contarBilletesPorPais(pais.id), 0
    );
  }

  calcularPaisesActivos(): number {
    return this.paises.filter((pais: Pais) => 
      this.contarBilletesPorPais(pais.id) > 0
    ).length;
  }

  irARegistrarPaises() {
    this.router.navigate(['/admin/registrar-paises']);
  }
}