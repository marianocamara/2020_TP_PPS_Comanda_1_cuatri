import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, IonContent } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins } from '@capacitor/core';
import { User } from 'src/app/models/user';
import { AngularFirestore, } from '@angular/fire/firestore';
import { firestore } from 'firebase';
import { NotificationMessages } from 'src/app/models/notification';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.page.html',
  styleUrls: ['./chat-detail.page.scss'],
})
export class ChatDetailPage implements OnInit {
  
  isLoading = false;
  enquiryId = '';
  enquiry;
  user: User;
  newMessage: string;

  @ViewChild( IonContent, { read: IonContent, static:false}) content: IonContent;
  
  constructor(private route: ActivatedRoute,
    public navCtrl: NavController,
    private database: DatabaseService,
    private authService: AuthService,
    ) { }
    
    ngOnInit() {
      
      this.route.paramMap.subscribe(paramMap => {
        if (!paramMap.has('postId')) {
          this.navCtrl.navigateBack('/welcome');
          return;
        }
        this.isLoading = true;
        this.enquiryId = paramMap.get('postId');


        this.database.GetWithQuery('id', '==', this.enquiryId, 'enquiries')
        .subscribe(data => {
          this.enquiry = data[0];
          this.scrollDown();
          this.isLoading = false;
        });
       
      });
      
    }
    
    ionViewWillEnter() {
      this.isLoading = true;
      this.scrollDown();
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

        this.database.GetWithQuery('id', '==', this.enquiryId, 'enquiries')
        .subscribe(data => {
          this.enquiry = data[0];
          this.scrollDown();
          this.isLoading = false;
        });
      }     
            
      sendMessage(){
        const data = {
          senderId: this.user.id,
          senderName: this.user.name,
          messageBody: this.newMessage,
          createdAt: Date.now()
        };
        this.database.AppendDataToArrayField('messages', data, 'enquiries', this.enquiryId);
        this.newMessage = '';
        this.scrollDown();
        if(this.user.type != 'mozo'){
          this.createNotification();
        }        
      }

      createNotification(){
        let notification = {
          senderType: 'cliente',
          receiverType: 'mozo',
          message: NotificationMessages.New_Ticket,
          date: new Date()
        };
        this.database.CreateOne(notification, 'notifications');
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

      scrollDown(){
        this.content.scrollToBottom();
      }
            
    }  