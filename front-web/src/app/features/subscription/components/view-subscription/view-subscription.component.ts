import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Subscription} from '../../models/subscription.model';
import {SubscriptionService} from '../../services/subscription.service';
import {TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-view-subscription',
  imports: [
    TitleCasePipe
  ],
  templateUrl: './view-subscription.component.html',
  styleUrl: './view-subscription.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSubscriptionComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);

  subscriptionInfo= signal<Subscription | null>(null);

  ngOnInit(){
    this.loadSubscriptionInfo();
  }

  loadSubscriptionInfo() {
    this.subscriptionService.getSubscriptionInfo().subscribe({
      next: (user) => {
        this.subscriptionInfo.set(user);
      },
      error: () => this.subscriptionInfo.set(null),
    });
  }

  upgradeSubscription(newPlanType: string) {
    this.subscriptionService.upgradeSubscription(newPlanType).subscribe({
      next: (response) => {
        const approvalUrl = response.approval_url;
        const paymentWindow = window.open(approvalUrl, 'PayPal Payment', 'width=800, height=600');
        if (paymentWindow) {
          const interval = setInterval(() => {
            if (paymentWindow.closed) {
              clearInterval(interval);
              this.loadSubscriptionInfo();
            }
          }, 1000);
        } else {
          console.error('No se pudo abrir la ventana de pago.');
        }
      },
      error: () => console.error('Error during recharge.')
    });
  }
}
