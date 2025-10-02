import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-button',
  imports: [CommonModule],
  templateUrl: './whatsapp-button.component.html',
  styleUrl: './whatsapp-button.component.css',
  encapsulation: ViewEncapsulation.None
})
export class WhatsappButtonComponent {
  @Input() phoneNumber: string = '573134350427';
  @Input() message: string = '¡Hola! Me interesa conocer más sobre sus billetes. ¿Podrían brindarme más información?';

  openWhatsApp() {
    const encodedMessage = encodeURIComponent(this.message);
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
}
