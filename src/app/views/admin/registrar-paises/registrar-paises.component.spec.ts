import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarPaisesComponent } from './registrar-paises.component';

describe('RegistrarPaisesComponent', () => {
  let component: RegistrarPaisesComponent;
  let fixture: ComponentFixture<RegistrarPaisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarPaisesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarPaisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
