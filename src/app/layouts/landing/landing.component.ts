import { Component, ChangeDetectorRef } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CardComponent } from '../../components/card/card.component';
import { RegistrosService } from '../../services/registros.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-landing',
  imports: [HeaderComponent, FooterComponent, CardComponent, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

  valores: any = [];

  constructor(
    private registrosService: RegistrosService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.registrosService.obtenerRegistrosBilletes().subscribe(
      data => {
        this.valores = data.registros;
        console.log('Datos obtenidos:', data);
      },
      error => {
        console.error('Error al obtener los datos:', error);
      }
    );
    this.cd.detectChanges();
  }
}
