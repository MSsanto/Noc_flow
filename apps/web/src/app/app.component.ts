import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="shell">
      <section class="hero" aria-labelledby="page-title">
        <p class="eyebrow">PORTFOLIO · FULL STACK · CLOUD</p>
        <h1 id="page-title">{{ title }}</h1>
        <p>
          Evolução cloud do gerenciador de ocorrências de rede, com Angular,
          FastAPI, testes automatizados e Azure.
        </p>
        <div class="status" role="status">
          <span class="status__dot" aria-hidden="true"></span>
          {{ phase() }}
        </div>
      </section>
    </main>
  `,
})
export class AppComponent {
  readonly title = 'NOC Flow Cloud';
  readonly phase = signal('Fundação da arquitetura v2');
}
