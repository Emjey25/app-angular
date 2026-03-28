import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.html',
})
export class StatsCard {
  title = input('');
  value = input<string | number>(0);
  icon = input('');
}
