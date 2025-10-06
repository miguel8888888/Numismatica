import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { WhatsappButtonComponent } from '../../components/whatsapp-button/whatsapp-button.component';

@Component({
  selector: 'app-landing',
  imports: [
    CommonModule,
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
export class LandingComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  isMobile = false;

  menuItems = [
    { 
      titulo: 'Inicio', 
      ruta: '/inicio', 
      icono: 'fas fa-home' 
    },
    { 
      titulo: 'Explorar', 
      ruta: '/explorar-billetes', 
      icono: 'fas fa-search' 
    },
    { 
      titulo: 'Nosotros', 
      ruta: '/nosotros', 
      icono: 'fas fa-users' 
    },
    { 
      titulo: 'Destacados', 
      ruta: '/destacados', 
      icono: 'fas fa-star' 
    }
  ];

  ngOnInit() {
    this.checkScreenSize();
    this.setupResizeHandler();
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined' && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private resizeHandler!: () => void;

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) {
        this.mobileMenuOpen = false;
      }
    } else {
      // En el servidor, asumimos desktop por defecto
      this.isMobile = false;
      this.mobileMenuOpen = false;
    }
  }

  private setupResizeHandler(): void {
    if (typeof window !== 'undefined') {
      this.resizeHandler = () => {
        this.checkScreenSize();
      };
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}