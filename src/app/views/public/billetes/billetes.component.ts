import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrosService } from '../../../services/registros.service';

interface Billete {
  id: string;
  anverso: string;
  reverso: string;
  pais: string;
  denominacion: string;
  precio: number;
  bandera?: string;
}

@Component({
  selector: 'app-billetes',
  imports: [CommonModule],
  templateUrl: './billetes.component.html',
  styleUrl: './billetes.component.css'
})
export class BilletesComponent implements OnInit {
  billetes: Billete[] = [];
  loading = true;
  error = false;

  constructor(private registrosService: RegistrosService) {}

  ngOnInit(): void {
    this.cargarBilletes();
  }

  cargarBilletes(): void {
    this.loading = true;
    this.error = false;
    
    // Llamada real a la API
    this.registrosService.obtenerRegistrosBilletes().subscribe({
      next: (data) => {
        console.log('Billetes obtenidos:', data);
        this.billetes = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar billetes:', error);
        this.error = true;
        this.loading = false;
        this.billetes = [];
      }
    });
  }

  comprarBillete(billete: Billete): void {
    console.log('Comprando billete:', billete);
    // TODO: Implementar lógica de compra
    alert(`¡Próximamente podrás comprar: ${billete.denominacion} de ${billete.pais}!`);
  }

  verMasInformacion(billete: Billete): void {
    console.log('Ver más información:', billete);
    // TODO: Implementar modal o navegación a detalle
    alert(`Más información de: ${billete.denominacion} de ${billete.pais}\n\nPrecio: $${billete.precio}\n\nPróximamente más detalles...`);
  }

  obtenerCodigoPais(nombrePais: string): string {
    const paises: { [key: string]: string } = {
      'España': 'es',
      'Estados Unidos': 'us',
      'México': 'mx',
      'Francia': 'fr',
      'Alemania': 'de',
      'Italia': 'it',
      'Reino Unido': 'gb',
      'Japón': 'jp',
      'China': 'cn',
      'Brasil': 'br',
      'Argentina': 'ar',
      'Colombia': 'co',
      'Perú': 'pe',
      'Chile': 'cl'
    };
    return paises[nombrePais] || 'world';
  }

  trackByBillete(index: number, billete: Billete): string {
    return billete.id;
  }

  onImageError(event: any, tipo: 'anverso' | 'reverso'): void {
    console.log(`Error cargando imagen ${tipo}:`, event);
    // Imagen placeholder en caso de error
    event.target.src = `https://via.placeholder.com/300x150/cccccc/666666?text=Imagen+no+disponible`;
  }
}
