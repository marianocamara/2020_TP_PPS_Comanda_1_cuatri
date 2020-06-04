import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IonItemSliding, LoadingController, NavController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';



@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
})
export class EmployeesPage implements OnInit, OnDestroy {

  private employeesSub: Subscription;
  isLoading = true;
  user: User; // = { imageUrl: 'assets/img/team-4-800x800.jpg'};
  input;
  activeType;

  employees = [
    // { name: 'Braian',
    //   lastName: 'Cardozo',
    //   type: 'Mozo',
    //   imageUrl: 'http://bdatechnical.com/wp-content/uploads/2019/06/empty-profile-250x250.jpg'
    // },
    // { name: 'Mariano',
    //   lastName: 'Camara',
    //   type: 'Cocinero',
    //   imageUrl: 'https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg'
    // },
    // { name: 'Ariel',
    //   lastName: 'Traut',
    //   type: 'Dueño',
    //   imageUrl: 'http://bdatechnical.com/wp-content/uploads/2019/06/empty-profile-250x250.jpg'
    // },
    // {
    //   name: 'Pepe',
    //   lastName: 'Pepon',
    //   type: 'Supervisor',
    //   imageUrl: 'https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg'
    // },
    // { name: 'Pepin',
    //   lastName: 'Pepon',
    //   type: 'Bartender',
    //   imageUrl: 'http://bdatechnical.com/wp-content/uploads/2019/06/empty-profile-250x250.jpg'
    // },
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

  constructor( private loadingCtrl: LoadingController,
               private authService: AuthService,
               public navCtrl: NavController,
               private database: DatabaseService ) { }

  ngOnInit() {
    this.isLoading = true;
    this.employeesSub = this.database.GetAll('users').subscribe(data => {
      this.employees = data.filter(e => e.type !== 'cliente' && e.type !== 'anonimo');
      this.filterEmployees('Todos');
      this.isLoading = false;
    });
  }


  ionViewWillEnter() {
    this.isLoading = true;
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
        }
        else {
          this.logout();
        }
      }, () => {
        this.logout();
      }
    );
  }


  logout() {
    this.authService.logoutUser()
    .then(res => {
      // console.log(res);
      this.navCtrl.navigateBack('');
    })
    .catch(error => {
      console.log(error);
    });
  }


  goToProfile() {}


  search() {
    console.log(this.input);
    const filter = this.input.toLowerCase();
    this.filteredEmployees = this.employees.filter(e => {
      if (e.name.toLowerCase().includes(filter) ||
          e.type.toLowerCase().includes(filter)) {
        return e;
      }
    });
  }


  filterEmployees(type: string) {
    this.filteredEmployees = type === 'Todos' ? this.employees : this.employees.filter(e => e.type.toLowerCase() === type.toLowerCase());
  }


  confirm(item: IonItemSliding, userId, userApproved) {
    item.close();
    this.loadingCtrl.create({ message: 'Confirmando...' }).then(loadingEl => {
      loadingEl.present();
      this.authService.approveUser(userId, userApproved);
      setTimeout (() => {
        loadingEl.dismiss();
     }, 1000);
    });
  }



  ngOnDestroy() {
    if (this.employeesSub) {
      this.employeesSub.unsubscribe();
    }
  }

  

}
