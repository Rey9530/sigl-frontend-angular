import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confidence-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confidence-badge.html',
  styleUrl: './confidence-badge.scss'
})
export class ConfidenceBadge {
  readonly confianza = input<number>(0);
  readonly showPercent = input<boolean>(true);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly badgeClass = computed(() => {
    const conf = this.confianza();
    if (conf >= 80) return 'bg-success';
    if (conf >= 50) return 'bg-warning text-dark';
    return 'bg-danger';
  });

  readonly sizeClass = computed(() => {
    switch (this.size()) {
      case 'sm': return 'badge-sm';
      case 'lg': return 'badge-lg';
      default: return '';
    }
  });
}
