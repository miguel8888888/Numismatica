import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { ImageComponent } from '../image/image.component';

@Component({
  selector: 'app-header',
  imports: [ImageComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() bgHeader: string = 'bg-nav';
  @Input() contentHeader: number = 1;


  // constructor() {
  //   // Inicializar el color de fondo del header
  //   this.bgHeader = 'bg-nav';
  // }
}
