import { Component, OnInit, Inject, PLATFORM_ID, Input } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';


@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit {
  @Input() anverso: string = '';
  @Input() reverso: string = '';
  @Input() bandera: string = '';
  @Input() precio: string = 'No definido';
  @Input() denominacion: string = 'No Definido';

  urlDriveAnverso: string = '';
  urlDriveReverso: string = '';
  urlDriveBandera: string = '';
  hover: boolean = false;
  isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}


  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    this.urlDriveAnverso = this.limpiarUrl(this.anverso);
    this.urlDriveReverso = this.limpiarUrl(this.reverso);
    console.log("this.bandera", this.bandera);
    this.urlDriveBandera = this.bandera;
  }

  limpiarUrl(url: string): string {
    // Verificar si la URL existe
    if (!url) {
      console.warn('URL no definida o vacía');
      return '';
    }

    // Si es una URL de Supabase, devolverla tal como está
    if (url.includes('supabase.co')) {
      console.log('URL de Supabase detectada:', url);
      return url;
    }

    // Si es una URL de Google Drive, procesarla como antes
    if (url.includes('drive.google.com')) {
      // Elimina cualquier parte que tenga /view y cualquier otra continuidad
      url = url.replace(/\/view.*$/, '');

      // Extrae el id y construye la url de thumbnail
      const match = url.match(/\/d\/([^\/]+)/);
      if (match && match[1]) {
        url = `https://drive.google.com/thumbnail?id=${match[1]}`;
      }
      console.log('URL de Google Drive procesada:', url);
      return url;
    }

    // Si no es ninguna de las dos, devolver la URL tal como está
    console.log('URL desconocida, devolviendo tal como está:', url);
    return url;
  }

  formatCOP(valor: number | string): string {
    // Convierte a número si viene como string
    const numero = typeof valor === 'string' ? Number(valor) : valor;
    // Formatea con puntos cada tres dígitos y símbolo $
    return '$' + numero.toLocaleString('es-CO', { minimumFractionDigits: 0 });
  }

  comprarBillete(): void {
    console.log('Comprando billete:', this.denominacion);
    // Aquí irá la lógica de compra
    alert(`¡Interesado en comprar el billete ${this.denominacion}! Funcionalidad en desarrollo.`);
  }

  verMasInformacion(): void {
    console.log('Viendo más información del billete:', this.denominacion);
    // Aquí irá la lógica para mostrar más información
    alert(`Información detallada del billete ${this.denominacion}. Funcionalidad en desarrollo.`);
  }
}
