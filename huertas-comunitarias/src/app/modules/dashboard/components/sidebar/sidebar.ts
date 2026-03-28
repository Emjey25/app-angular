import { Component, output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  menuSelected = output<string>();

  menuItems = [
    { icon: '📊', label: 'Dashboard', route: 'dashboard' },
    { icon: '🌿', label: 'Mis Huertas', route: 'huertas' },
    { icon: '🌱', label: 'Cultivos', route: 'cultivos' },
    { icon: '🤝', label: 'Voluntarios', route: 'voluntarios' },
    { icon: '📋', label: 'Tareas', route: 'tareas' },
  ];

  activeItem = 'dashboard';

  selectItem(route: string): void {
    this.activeItem = route;
    this.menuSelected.emit(route);
  }
}
