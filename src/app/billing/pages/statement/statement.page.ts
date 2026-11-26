import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Statement } from '../../model/billing';
import { BillingService } from '../../services/billing.service';
import { parseError } from '../../../core/errors/api-error';
import { Badge } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { LabelPipe } from '../../../shared/pipes/label.pipe';
import { MesPipe } from '../../../shared/pipes/mes.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { downloadBlob } from '../../../shared/utils/download';

/** Estado de cuenta mensual de una cuenta (con mora hasta hoy) y su PDF. */
@Component({
  selector: 'app-statement',
  templateUrl: './statement.page.html',
  styleUrl: './statement.page.scss',
  imports: [RouterLink, Badge, ErrorAlert, SolesPipe, LabelPipe, FechaPipe, MesPipe],
})
export class StatementPage implements OnInit {
  private readonly billingApi = inject(BillingService);
  id = input.required<string>();
  year = input.required<string>();
  month = input.required<string>();
  s = signal<Statement | null>(null);
  error = signal<string | null>(null);
  downloading = signal(false);

  ngOnInit(): void {
    this.billingApi.getStatement(Number(this.id()), Number(this.year()), Number(this.month())).subscribe({
      next: (s) => this.s.set(s),
      error: (e) => this.error.set(parseError(e).message),
    });
  }

  pdf(): void {
    this.downloading.set(true);
    const [y, m] = [Number(this.year()), Number(this.month())];
    this.billingApi.getStatementPdf(Number(this.id()), y, m).subscribe({
      next: (b) => {
        this.downloading.set(false);
        downloadBlob(b, `estado-de-cuenta-${this.id()}-${y}-${String(m).padStart(2, '0')}.pdf`);
      },
      error: (e) => {
        this.downloading.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }
}
