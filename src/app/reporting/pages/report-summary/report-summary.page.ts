import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { parseError } from '../../../core/errors/api-error';
import { PeriodReport } from '../../model/reporting';
import { ReportingService } from '../../services/reporting.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { firstDayOfMonthLima, todayLima } from '../../../shared/utils/lima-date';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-reports',
  templateUrl: './report-summary.page.html',
  styleUrl: './report-summary.page.scss',
  imports: [FormsModule, ErrorAlert, SolesPipe, FechaPipe, Icon],
})
export class ReportSummaryPage implements OnInit {
  private readonly reportingApi = inject(ReportingService);
  from = firstDayOfMonthLima();
  to = todayLima();
  r = signal<PeriodReport | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error.set(null);
    this.reportingApi.reportSummary(this.from, this.to).subscribe({
      next: (r) => this.r.set(r),
      error: (e) => this.error.set(parseError(e).message),
    });
  }
}
