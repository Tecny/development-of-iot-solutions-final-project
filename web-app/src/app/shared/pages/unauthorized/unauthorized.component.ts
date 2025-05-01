import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  imports: [],
  template: `
    <p>Unauthorized content</p>
  `,
  styleUrl: './unauthorized.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnauthorizedComponent {

}
