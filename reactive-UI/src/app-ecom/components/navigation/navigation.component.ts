import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import $ from 'jquery';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements AfterViewInit {
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
    console.log('Searching for:', this.searchTerm);
    // You can add functionality to handle the search
  }
}
