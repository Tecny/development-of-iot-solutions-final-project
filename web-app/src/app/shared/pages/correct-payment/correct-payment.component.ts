import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-correct-payment',
  imports: [],
  template: `
    <div class="correct-payment-container">
      <div class="correct-payment-card">
        <svg viewBox="0 0 24 24" class="correct-payment-icon">
          <path fill="currentColor"
                d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z">
          </path>
        </svg>
        <div class="correct-payment-center">
          <h3 class="correct-payment-title">¡Pago correcto!</h3>
          <p class="correct-payment-message">¡Gracias por completar tu pago seguro! Puedes cerrar esta ventana y volver a la aplicación.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .correct-payment-container {
      background-color: #fff;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
    }

    .correct-payment-card {
      background-color: #fff;
      padding: 1.5rem;
      margin-left: auto;
      margin-right: auto;
    }

    .correct-payment-icon {
      color: #16a34a;
      width: 4rem;
      height: 4rem;
      display: block;
      margin: 0 auto;
    }

    .correct-payment-title {
      font-size: 2rem;
      color: #111827;
      font-weight: 600;
      text-align: center;
    }

    .correct-payment-message {
      font-size: 1.25rem;
      text-align: center;
      color: #2ecc71;
      background-color: #ecfdf5;
      padding: 1.5rem 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      max-width: 500px;
      margin: 1rem auto;
    }

    .correct-payment-center {
      text-align: center;
      padding: 0;

      h3 {
        margin-top: 0.2rem;
        margin-bottom: 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorrectPaymentComponent {

}
