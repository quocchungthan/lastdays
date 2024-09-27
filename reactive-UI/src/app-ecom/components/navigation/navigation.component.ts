import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import $ from 'jquery';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements AfterViewInit {
  constructor(private _router: Router) {}
  
  ngAfterViewInit(): void {
    $('.header').on('click', '.search-toggle', function(e) {
      var selector = $(this).data('selector');
    
      $(selector).toggleClass('show').find('.search-input').focus();
      $(this).toggleClass('active');
    
      e.preventDefault();
    });
  }
  searchTerm: string = '';

  onSearch() {
    if (!this.searchTerm) {
      this._router.navigate(['/']);
      return;
    }
    // Navigate to the home page with the search term as a query parameter
    this._router.navigate(['/'], { queryParams: { 'tim-kiem': this.searchTerm } });
  }
}
