import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {

  user = { imageUrl: 'assets/img/team-4-800x800.jpg'};

  constructor() { }

  ngOnInit() {
  }


  goToProfile() {

  }

}
