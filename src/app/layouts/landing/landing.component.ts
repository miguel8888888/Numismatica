import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn  } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CardComponent } from '../../components/card/card.component';
import { RegistrosService } from '../../services/registros.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-landing',
  imports: [
    HeaderComponent,
    FooterComponent,
    CardComponent,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

  billetes: any = [];
  paises: any = [];

  formPais: FormGroup;

  constructor(
    private registrosService: RegistrosService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    this.formPais = this.fb.group({
      pais: ['', Validators.required],
      bandera: ['', Validators.required],
    });

  }

  ngOnInit() {
    // this.registrosService.obtenerRegistrosBilletes().subscribe(
    //   data => {
    //     this.billetes = data.registros;
    //     console.log('Datos obtenidos:', data);
    //   },
    //   error => {
    //     console.error('Error al obtener los datos:', error);
    //   }
    // );
    // this.cd.detectChanges();
    this.consultarPaises();

  }
  
  consultarPaises() {
    console.log('Llamando a obtenerRegistrosPaises...');
    this.registrosService.obtenerRegistrosPaises().subscribe(
      data => {
        this.paises = data;
        this.cd.detectChanges();
        console.log('Datos de países obtenidos:', data);
      },
      error => {
        console.error('Error al obtener los datos de países:', error);
      }
    );
  }
    
  onSubmit() {
    if (this.formPais.valid) {
      const nuevoPais = this.formPais.value;
      console.log('Nuevo país:', nuevoPais);
      this.registrosService.crearRegistroPais(nuevoPais).subscribe(
        response => {
          console.log('Registro agregado:', response);
          this.formPais.reset();
          this.consultarPaises(); // Actualiza la lista de países después de agregar uno nuevo
        },
        error => {
          console.error('Error al agregar el registro:', error);
        }
      );
    }
  }
}
