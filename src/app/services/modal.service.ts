import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalData {
  isOpen: boolean;
  billeteId?: number;
  type?: 'billete-detail' | 'general';
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalData>({ isOpen: false });
  public modal$ = this.modalSubject.asObservable();

  openBilleteDetail(billeteId: number): void {
    this.modalSubject.next({ 
      isOpen: true, 
      billeteId, 
      type: 'billete-detail' 
    });
  }

  closeModal(): void {
    this.modalSubject.next({ isOpen: false });
  }
}