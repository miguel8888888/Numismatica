import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { WhatsappButtonComponent } from '../../components/whatsapp-button/whatsapp-button.component';

@Component({
  selector: 'app-landing',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    FooterComponent,
    WhatsappButtonComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
}