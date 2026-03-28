import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Header } from '../../components/header/header';
import { StatsCard } from '../../components/stats-card/stats-card';

@Component({
  selector: 'app-main',
  imports: [Sidebar, Header, StatsCard],
  templateUrl: './main.html',
})
export class Main {
  stats = [
    { title: 'Huertas Activas', value: 5, icon: '🌿' },
    { title: 'Cosechas Próximas', value: 3, icon: '🌾' },
    { title: 'Voluntarios Hoy', value: 12, icon: '🤝' },
  ];

  tareas = [
    { tarea: 'Riego Diario', asignado: 'Ana R.', estado: 'Pendiente' },
    { tarea: 'Siembra Lechuga', asignado: 'Juan P.', estado: 'En Proceso' },
  ];

  cultivos = [
    { nombre: 'Tomate Cherry', estado: 'Fruición', color: 'bg-red-500' },
    { nombre: 'Zanahoria', estado: 'Crecimiento', color: 'bg-orange-500' },
    { nombre: 'Acelga', estado: 'Lista', color: 'bg-green-500' },
  ];
}
