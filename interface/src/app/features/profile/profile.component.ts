import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container"><h1>Profile</h1><p>Profile page - Coming soon</p></div>`,
  styles: [`.container { max-width: 1200px; margin: 4rem auto; padding: 2rem; }`]
})
export class ProfileComponent {}
