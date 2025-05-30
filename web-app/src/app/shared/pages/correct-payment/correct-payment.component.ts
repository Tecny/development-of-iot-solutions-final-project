import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-correct-payment',
  imports: [],
  template: `
    <p>Your payment was correct</p>
    <p>You can close this window</p>
  `,
  styles: [`
    p {
      font-family: 'Poppins', sans-serif;
      font-size: 1.25rem;
      text-align: center;
      color: #2ecc71;
      background-color: #ecfdf5;
      padding: 1.5rem 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      max-width: 500px;
      margin: 3rem auto;
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorrectPaymentComponent {

}
