import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../index';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {
  isDark = false;
  private sub: Subscription;

  constructor(private theme: ThemeService, private cdr: ChangeDetectorRef) {
    this.sub = this.theme.theme$.subscribe((d: boolean) => {
      this.isDark = !!d;
      this.cdr.markForCheck();
    });
  }

  toggleTheme() {
    this.theme.toggle();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

}
