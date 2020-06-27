import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/services/database.service';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  private enquiriesSub: Subscription;
  enquiries = [];
  userEnquiries = [];
  isLoading = true;
  user: User;

  constructor(private database: DatabaseService,
    private route: ActivatedRoute,
    private authService: AuthService,
    public navCtrl: NavController,
    ) { }

  ngOnInit() {

    this.enquiriesSub = this.database.GetAll('enquiries').subscribe(data => {
      this.enquiries = data;
      this.isLoading = false;
      console.log(this.enquiries);
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

      this.enquiriesSub = this.database.GetAll('enquiries').subscribe(data => {
        this.enquiries = data;
        this.isLoading = false;
        console.log(this.enquiries);
      });
    } 

  ngOnDestroy() {
    if (this.enquiriesSub) {
      this.enquiriesSub.unsubscribe();
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

}
