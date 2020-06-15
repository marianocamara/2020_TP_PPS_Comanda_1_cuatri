import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';
import { NavController, IonSlides } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';
import { map } from 'rxjs/operators';
import { WaitingListEntry } from 'src/app/models/waiting-list-entry';


@Component({
  selector: 'app-waiting-list',
  templateUrl: './waiting-list.page.html',
  styleUrls: ['./waiting-list.page.scss'],
})
export class WaitingListPage implements OnInit {

  user: User;
  isLoading = true;
  @ViewChild('slides') slides: IonSlides;
  disablePrevBtn = true;
  disableNextBtn = false;
  myPosition = 8;
  // waitingList = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
  waitingList: WaitingListEntry[] = [];



  // Optional parameters to pass to the swiper instance.
  // See http://idangero.us/swiper/api/ for valid options.
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    clickable: true
  };

  constructor( public navCtrl: NavController,
               private authService: AuthService,
               private database: DatabaseService ) { }

  ngOnInit() {
    this.isLoading = true;
    Plugins.Storage.get({ key: 'user-bd' }).then(
      (userData) => {
        if (userData.value) {
          this.user = JSON.parse(userData.value);
          this.database.GetWithQuery('id', '==', this.user.id, 'users')
            .subscribe(user => {
              if (user.length > 0) { this.user = user[0]; }
              else { this.logout(); }
              this.database.GetAll('waiting-list')
                .subscribe(list => {
                  this.waitingList = (list as WaitingListEntry[]).sort((a, b) => (a.date as any).localeCompare(b.date));
                  this.myPosition = this.waitingList.findIndex(customer => customer.id === this.user.id) + 1;
                  this.isLoading = false;
                  console.log(this.waitingList);
                  console.log(this.myPosition);
                });
            });
        }
        else {
          this.user = null;
          this.logout();
        }
      }, () => {
        this.logout();
      }
    );
  }

  // next() {
  //   this.slides.slideNext();
  // }

  // prev() {
  //   this.slides.slidePrev();
  // }

  // doCheck() {
  //   let prom1 = this.slides.isBeginning();
  //   let prom2 = this.slides.isEnd();

  //   Promise.all([prom1, prom2]).then((data) => {
  //     data[0] ? this.disablePrevBtn = true : this.disablePrevBtn = false;
  //     data[1] ? this.disableNextBtn = true : this.disableNextBtn = false;
  //   });
  // }


  ionViewWillEnter() {
    if (!this.user) {
      this.logout();
    }
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


  formatTitle = () => {
    return this.user.table ? `${this.user.table}` : `${this.myPosition}`;
  }


}
