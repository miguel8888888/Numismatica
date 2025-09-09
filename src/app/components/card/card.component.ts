import { Component, OnInit } from '@angular/core';
// import { CurrencyPipe } from '@angular/common';
import { Input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
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

  constructor() {}

  ngOnInit(): void {
    this.urlDriveAnverso = this.limpiarUrl(this.anverso);
    this.urlDriveReverso = this.limpiarUrl(this.reverso);
    this.urlDriveBandera = this.limpiarUrl(this.bandera);
  }

  limpiarUrl(url: string): string {
    // Elimina cualquier parte que tenga /view y cualquier otra continuidad
    url = url.replace(/\/view.*$/, '');

    // Extrae el id y construye la url de thumbnail
    const match = url.match(/\/d\/([^\/]+)/);
    if (match && match[1]) {
      url = `https://drive.google.com/thumbnail?id=${match[1]}`;
    }
    console.log(url);
    // Retorna la URL limpia
    return url;
  }

  formatCOP(valor: number | string): string {
    // Convierte a número si viene como string
    const numero = typeof valor === 'string' ? Number(valor) : valor;
    // Formatea con puntos cada tres dígitos y símbolo $
    return '$' + numero.toLocaleString('es-CO', { minimumFractionDigits: 0 });
  }
}
