import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
})
export class EmployeesPage implements OnInit {

  user = { imageUrl: 'assets/img/team-4-800x800.jpg'};

  constructor() { }

  ngOnInit() {
  }


  goToProfile() {}

}
