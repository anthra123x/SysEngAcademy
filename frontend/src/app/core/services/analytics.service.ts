import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    __GA_MEASUREMENT_ID__?: string;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private router = inject(Router);

  // ID de Medición de Google Analytics 4 (GA4)
  // Puede configurarse aquí directamente, vía window.__GA_MEASUREMENT_ID__ o en localStorage('syseng_ga_id')
  readonly defaultMeasurementId = 'G-XXXXXXXXXX';

  private measurementId: string = this.resolveMeasurementId();
  private isInitialized = false;

  constructor() {
    this.init();
    this.listenToRouteChanges();
  }

  private resolveMeasurementId(): string {
    if (typeof window !== 'undefined') {
      const winId = window.__GA_MEASUREMENT_ID__;
      const storedId = localStorage.getItem('syseng_ga_id');
      if (winId && winId !== 'G-XXXXXXXXXX') return winId;
      if (storedId && storedId !== 'G-XXXXXXXXXX') return storedId;
    }
    return this.defaultMeasurementId;
  }

  /**
   * Inicializa Google Analytics inyectando gtag.js dinámicamente si no existe
   */
  init(customId?: string): void {
    if (typeof window === 'undefined') return;

    if (customId && customId !== 'G-XXXXXXXXXX') {
      this.measurementId = customId;
      try {
        localStorage.setItem('syseng_ga_id', customId);
      } catch {}
    }

    if (!this.measurementId || this.measurementId === 'G-XXXXXXXXXX') {
      // Configuración en modo seguro: la arquitectura está lista para cuando se ingrese el ID real
      return;
    }

    if (this.isInitialized) return;

    // Inicializar dataLayer y función gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    // En SPAs como Angular, deshabilitamos el page_view automático en carga inicial para evitar conteos duplicados
    window.gtag('config', this.measurementId, {
      send_page_view: false,
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    // Inyectar script de Google Tag Manager de forma asíncrona
    const scriptId = 'google-analytics-gtag';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.measurementId)}`;
      document.head.appendChild(script);
    }

    this.isInitialized = true;
  }

  /**
   * Rastrea las transiciones de rutas del SPA automáticamente
   */
  private listenToRouteChanges(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  /**
   * Envía un evento de vista de página virtual (Page View) para la navegación SPA
   */
  trackPageView(url: string, title?: string): void {
    if (typeof window === 'undefined' || !window.gtag) return;
    if (!this.measurementId || this.measurementId === 'G-XXXXXXXXXX') return;

    const pageTitle = title || document.title;
    const pageLocation = window.location.origin + url;

    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: pageTitle,
      page_location: pageLocation,
    });
  }

  /**
   * Envía eventos personalizados de interacción
   */
  trackEvent(eventName: string, params: Record<string, any> = {}): void {
    if (typeof window === 'undefined' || !window.gtag) return;
    if (!this.measurementId || this.measurementId === 'G-XXXXXXXXXX') return;

    window.gtag('event', eventName, params);
  }

  /**
   * Helper: Rastreo de autenticación
   */
  trackAuth(method: 'google' | 'github' | 'email', type: 'login' | 'register'): void {
    const eventName = type === 'login' ? 'login' : 'sign_up';
    this.trackEvent(eventName, {
      method: method,
    });
  }

  /**
   * Helper: Rastreo de visualización de curso
   */
  trackCourseView(courseSlug: string, courseTitle?: string): void {
    this.trackEvent('view_item', {
      item_type: 'course',
      item_id: courseSlug,
      item_name: courseTitle || courseSlug,
    });
  }

  /**
   * Helper: Rastreo de reto resuelto en CodeLab
   */
  trackChallengeSubmit(challengeSlug: string, language: string, passed: boolean): void {
    this.trackEvent('codelab_challenge_submission', {
      challenge_id: challengeSlug,
      programming_language: language,
      success: passed,
    });
  }

  /**
   * Helper: Rastreo de consultas al Asistente IA
   */
  trackAiInteraction(action: 'ask' | 'feedback' | 'diagnostic'): void {
    this.trackEvent('ai_interaction', {
      action: action,
    });
  }
}
