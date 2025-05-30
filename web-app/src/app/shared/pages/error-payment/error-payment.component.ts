import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-error-payment',
  imports: [],
  template: `
    <p>An error occurred with your payment</p>
    <p>You can close this window and try again</p>
  `,
  styles: [`
    p {
      font-family: 'Poppins', sans-serif;
      font-size: 1.25rem;
      text-align: center;
      color: #e74c3c;
      background-color: #fdecea;
      padding: 1.5rem 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      margin: 3rem auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPaymentComponent {

}
