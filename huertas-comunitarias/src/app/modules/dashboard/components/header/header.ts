import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
})
export class Header {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
  }
}
