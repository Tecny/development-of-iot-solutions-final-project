import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-error-payment',
  imports: [],
  template: `
    <div class="error-payment-container">
      <div class="error-payment-card">
        <svg viewBox="0 0 24 24" class="error-payment-icon">
          <path fill="currentColor"
                d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.95 15.364a1 1 0 01-1.414 1.414L12 13.414l-3.536 3.536a1 1 0 01-1.414-1.414L10.586 12 7.05 8.464a1 1 0 111.414-1.414L12 10.586l3.536-3.536a1 1 0 011.414 1.414L13.414 12l3.536 3.536z">
          </path>
        </svg>
        <div class="error-payment-center">
          <h3 class="error-payment-title">¡Pago fallido!</h3>
          <p class="error-payment-message">Desafortunadamente, tu pago no pudo ser procesado. Por favor, intenta nuevamente</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-payment-container {
      background-color: #fff;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
    }

    .error-payment-card {
      background-color: #fff;
      padding: 1.5rem;
      margin-left: auto;
      margin-right: auto;
    }

    .error-payment-icon {
      color: #e74c3c;
      width: 4rem;
      height: 4rem;
      display: block;
      margin: 0 auto;
    }

    .error-payment-title {
      font-size: 2rem;
      color: #111827;
      font-weight: 600;
      text-align: center;
    }

    .error-payment-message {
      font-size: 1.25rem;
      text-align: center;
      color: #e74c3c;
      background-color: #fdecea;
      padding: 1.5rem 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      max-width: 500px;
      margin: 1rem auto;
    }

    .error-payment-center {
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
export class ErrorPaymentComponent {}
