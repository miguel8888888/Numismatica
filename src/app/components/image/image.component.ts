import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-image',
  imports: [],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent {
  @Input() imageSrc: string = 'assets/images/Legarix logo.svg';
  @Input() imageClass: string = 'inline-block h-8 w-8 rounded-full';
}
