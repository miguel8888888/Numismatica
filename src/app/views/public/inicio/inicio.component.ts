import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators, FormsModule  } from '@angular/forms';
import { FooterComponent } from '../../../components/footer/footer.component';
import { CardComponent } from '../../../components/card/card.component';
import { RegistrosService } from '../../../services/registros.service';
import {CommonModule} from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-inicio',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FooterComponent,
    CardComponent
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  

  billetes: any = [];
  paises: any = [];
  paisSeleccionado: any = null;
  apiUrl = `${environment.fastAPI}`;
  urlImagen: any;

   mostrarDropdown = false;


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
    // this.cd.detectChanges();
    this.consultarPaises();
    this.consultarBilletes();
  }

  ngOnInit() {
    
  }
  
  consultarBilletes() {
    this.registrosService.obtenerRegistrosBilletes().subscribe(
      data => {
        this.billetes = data;
        console.log('Datos obtenidos:', data);
      },
      error => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }
  
  consultarPaises() {
    console.log('Llamando a obtenerRegistrosPaises...');
    this.registrosService.obtenerRegistrosPaises().subscribe(
      data => {
        this.paises = data;
        console.log('Datos de países obtenidos:', data);
      },
      error => {
        console.error('Error al obtener los datos de países:', error);
      }
    );
  }
  
    async onBanderaFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        console.log('evento', event);
        if (input.files && input.files.length > 0) {
          this.urlImagen = event;
        }
    }


  registrarImagen(event: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        this.registrosService.subirImagen(formData).subscribe(
          response => {
            console.log('Imagen subida con éxito:', response);
            resolve(response.url);
          },
          error => {
            console.error('Error al subir la imagen:', error);
            reject(error);
          }
        );
      } else {
        resolve('');
      }
    });
  }
  async onFileChange(event: any) {
    try {
      const imageUrl = await this.registrarImagen(event);
      this.formPais.patchValue({ bandera: imageUrl });
      console.log('URL de la imagen subida:', imageUrl);
    } catch (error) {
      console.error('Error al registrar la imagen:', error);
    }
  }

  registrarPais(nuevoPais: any) {
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
    
  async onSubmit() {
    const url = await this.registrarImagen(this.urlImagen);
    this.formPais.get('bandera')!.setValue(url);
    if (this.formPais.valid) {
      const nuevoPais = this.formPais.value;
      this.registrarPais(nuevoPais);

      console.log('Nuevo país:', nuevoPais);

    }
  }

  
  seleccionarPais(pais: any) {
    if (pais === 'Todos') {
      this.paisSeleccionado = null;
      this.consultarBilletes();
      return;
    }
    this.paisSeleccionado = pais;
    this.mostrarDropdown = false;
    this.billetes = this.billetes.filter((billete: any) => billete.pais === pais.id);
    console.log('País seleccionado:', pais, this.billetes);
  }

  irAContinente(continente: string) {
    // this.billetes = this.billetes.filter((billete: any) => billete.continente === continente);
    console.log('Continente seleccionado:', continente);
  }

}
