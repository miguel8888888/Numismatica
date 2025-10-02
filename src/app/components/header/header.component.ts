import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() bgHeader: string = 'bg-nav';
  @Input() contentHeader: number = 2;


  // constructor() {
  //   // Inicializar el color de fondo del header
  //   this.bgHeader = 'bg-nav';
  // }
}
