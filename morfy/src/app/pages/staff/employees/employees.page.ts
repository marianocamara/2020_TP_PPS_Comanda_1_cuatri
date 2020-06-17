import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IonItemSliding, LoadingController, NavController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';

import { Notification, NotificationMessages } from 'src/app/models/notification';


@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
})
export class EmployeesPage implements OnInit, OnDestroy {
  
  private employeesSub: Subscription;
  isLoading = true;
  user: User;
  inputApproved;
  inputPending;
  activeType;
  segment = 'pending';
  
  employees = [];
  
  filteredEmployees = [];
  approvedEmployees = [];
  pendingEmployees = [];
  
  types = [
    'Todos',
    'Cliente',
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
        this.employees = data;
        this.approvedEmployees = this.filterEmployeesByApproval(true);
        this.pendingEmployees = this.filterEmployeesByApproval(false);
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
      
      search(areApproved) {
        
        if (areApproved) {
          const filter = this.inputApproved.toLowerCase();
          this.approvedEmployees = this.filterEmployeesByApproval(areApproved).filter(e => {
            if (e.name.toLowerCase().includes(filter) ||
            e.type.toLowerCase().includes(filter)) {
              return e;
            }
          });
          
        } else {
          const filter = this.inputPending.toLowerCase();
          this.pendingEmployees = this.filterEmployeesByApproval(areApproved).filter(e => {
            if (e.name.toLowerCase().includes(filter) ||
            e.type.toLowerCase().includes(filter)) {
              return e;
            }
          });
          
        }        
      }     
      
      filterEmployees(type: string, areApproved) {
        if (areApproved) {
          this.approvedEmployees = type === 'Todos' ? this.filterEmployeesByApproval(true) : this.filterEmployeesByApproval(true).filter(e => e.type.toLowerCase() === type.toLowerCase());
        } else {
          this.pendingEmployees = type === 'Todos' ? this.filterEmployeesByApproval(false) : this.filterEmployeesByApproval(false).filter(e => e.type.toLowerCase() === type.toLowerCase());
        }
      }
      
      filterEmployeesByApproval(isApproved) {
        return this.employees.filter(e => e.approved === isApproved);
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