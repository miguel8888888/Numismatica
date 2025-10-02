import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BilletesComponent } from './billetes.component';

describe('BilletesComponent', () => {
  let component: BilletesComponent;
  let fixture: ComponentFixture<BilletesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BilletesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BilletesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
