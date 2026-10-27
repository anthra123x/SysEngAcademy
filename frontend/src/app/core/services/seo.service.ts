import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private readonly defaultTitle = 'SysEng Academy — Aprende Programación e Ingeniería de Software';
  private readonly defaultDescription = 'Rutas de aprendizaje interactivas, cursos prácticos con editores de código en tiempo real, retos de algoritmia y mentor con inteligencia artificial para estudiantes de ingeniería.';
  private readonly defaultKeywords = 'aprender a programar, ingenieria de software, ingenieria de sistemas, retos de programacion, codelab, python, javascript, backend, frontend, inteligencia artificial';
  private readonly defaultImage = 'https://www.sysengacademy.site/og-image.png';
  private readonly siteUrl = 'https://www.sysengacademy.site';

  constructor() {
    this.listenToRouteChanges();
  }

  private listenToRouteChanges(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }

      const routeData = route.snapshot.data;
      const title = routeData['title'] || this.defaultTitle;
      const description = routeData['description'] || this.defaultDescription;
      const keywords = routeData['keywords'] || this.defaultKeywords;
      const canonicalUrl = `${this.siteUrl}${event.urlAfterRedirects.split('?')[0].split('#')[0]}`;

      this.updateMetadata({
        title,
        description,
        keywords,
        url: canonicalUrl,
      });
    });
  }

  /**
   * Actualiza dinámicamente los metadatos SEO y etiquetas Open Graph / Twitter
   */
  updateMetadata(config: SeoConfig): void {
    const title = config.title || this.defaultTitle;
    const description = config.description || this.defaultDescription;
    const keywords = config.keywords || this.defaultKeywords;
    const image = config.image || this.defaultImage;
    const url = config.url || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : this.siteUrl);
    const type = config.type || 'website';

    // 1. Title del documento
    this.titleService.setTitle(title);

    // 2. Metadatos estándar
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });

    // 3. Open Graph (Facebook, WhatsApp, LinkedIn, Discord)
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ property: 'og:site_name', content: 'SysEng Academy' });
    this.metaService.updateTag({ property: 'og:locale', content: 'es_LA' });

    // 4. Twitter Cards
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });

    // 5. Canonical Link
    this.updateCanonicalUrl(url);
  }

  /**
   * Mantiene la etiqueta <link rel="canonical"> sincronizada
   */
  private updateCanonicalUrl(url: string): void {
    if (typeof document === 'undefined') return;

    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
