
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private storageKey = 'ccai-theme-dark';
    private themeSubject = new BehaviorSubject<boolean>(false);
    theme$ = this.themeSubject.asObservable();

    constructor() {
        // Apply saved theme on init
        const saved = localStorage.getItem(this.storageKey);
        if (saved === 'true') {
            document.documentElement.classList.add('dark-theme');
            this.themeSubject.next(true);
        }
    }

    isDark(): boolean {
        return document.documentElement.classList.contains('dark-theme');
    }

    enable() {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem(this.storageKey, 'true');
        this.playFlow();
        this.themeSubject.next(true);
    }

    disable() {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem(this.storageKey, 'false');
        this.playFlow();
        this.themeSubject.next(false);
    }

    toggle() {
        if (this.isDark()) {
            this.disable();
        } else {
            this.enable();
        }
    }

    private playFlow() {
        // Add a transient class that triggers a flowing overlay animation on the body
        const el = document.body;
        el.classList.add('theme-water');
        // remove after animation duration
        window.setTimeout(() => el.classList.remove('theme-water'), 900);
    }
}
