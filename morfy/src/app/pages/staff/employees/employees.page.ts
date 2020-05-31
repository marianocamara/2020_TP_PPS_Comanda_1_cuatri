import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IonItemSliding, LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
})
export class EmployeesPage implements OnInit {

  user = { imageUrl: 'assets/img/team-4-800x800.jpg'};
  input;

  employees = [
    { name: 'Braian',
      lastName: 'Cardozo',
      type: 'Mozo',
      imgUrl: 'http://bdatechnical.com/wp-content/uploads/2019/06/empty-profile-250x250.jpg'
    },
    { name: 'Mariano',
      lastName: 'Camara',
      type: 'Cocinero',
      imgUrl: 'https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg'
    },
    { name: 'Ariel',
      lastName: 'Traut',
      type: 'Dueño',
      imgUrl: 'http://bdatechnical.com/wp-content/uploads/2019/06/empty-profile-250x250.jpg'
    },
    {
      name: 'Pepe',
      lastName: 'Pepon',
      type: 'Supervisor',
      imgUrl: 'https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg'
    },
    { name: 'Pepin',
      lastName: 'Pepon',
      type: 'Bartender',
      imgUrl: 'http://bdatechnical.com/wp-content/uploads/2019/06/empty-profile-250x250.jpg'
    },
  ];

  filteredEmployees = [];

  types = [
    'Todos',
    'Dueño',
    'Supervisor',
    'Metre',
    'Cocinero',
    'Mozo',
    'Bartender',
  ];

  constructor( private loadingCtrl: LoadingController ) { }

  ngOnInit() {
    this.filterEmployees('Todos');
  }


  goToProfile() {}


  search() {
    const filter = this.input.toLowerCase();
    this.filteredEmployees = this.employees.filter(e => {
      if (e.name.toLowerCase().includes(filter) ||
          e.lastName.toLowerCase().includes(filter) ||
          e.type.toLowerCase().includes(filter)) {
        return e;
      }
    });
  }


  filterEmployees(type: string) {
    this.filteredEmployees = type === 'Todos' ? this.employees : this.employees.filter(e => e.type === type);
  }


  confirm(item: IonItemSliding) {
    item.close();
    this.loadingCtrl.create({ message: 'Confirmando...' }).then(loadingEl => {
      loadingEl.present();
      setTimeout (() => {
        loadingEl.dismiss();
     }, 1000);
    });
  }

}
