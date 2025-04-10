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
}
