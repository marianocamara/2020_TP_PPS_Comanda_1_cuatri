import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { IonSlides, NavController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { AuthService } from 'src/app/services/auth.service';
import { Survey, SurveyQuestionsUser } from 'src/app/models/survey';
import { DatabaseService } from 'src/app/services/database.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { Order, OrderStatus } from 'src/app/models/order';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.page.html',
  styleUrls: ['./survey.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SurveyPage implements OnInit {

  @ViewChild('slides') slides: IonSlides;
  disablePrevBtn = true;
  disableNextBtn = false;
  currentSlide = 0;
  user: User;
  success;

  // campos
  rangeValue;
  radioValue;
  selectValue;
  textValue;

  checkboxValues = [
    { val: 'comida', isChecked: false },
    { val: 'atencion', isChecked: false },
    { val: 'ambiente', isChecked: false },
    { val: 'limpieza', isChecked: false },
    { val: 'precios', isChecked: false },
    { val: 'nada', isChecked: false }
  ];

  questions = SurveyQuestionsUser;
  validationsForm: FormGroup;
  private ordersSub: Subscription;
  pendingOrder: Order[];
  
  constructor( 
    public navCtrl: NavController,
    private authService: AuthService,
    private database: DatabaseService,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    public alertController: AlertController
    ){}

    ngOnInit() {
      this.validationsForm = this.formBuilder.group({
        image1: new FormControl(null),
        image2: new FormControl(null),
        image3: new FormControl(null)
      });
    }

    ionViewWillEnter() {
      Plugins.Storage.get({ key: 'user-bd' }).then(
        (userData) => {
          if (userData.value) {
            this.user = JSON.parse(userData.value);
            this.ordersSub = this.database.GetWithQuery('idClient', '==', this.user.id, 'orders')
            .subscribe(data => {
              this.pendingOrder = (data as Order[]).filter(order => order.status === OrderStatus.Pending || order.status === OrderStatus.Confirmed
                || order.status === OrderStatus.Delivered
                || order.status === OrderStatus.Ready
                || order.status === OrderStatus.Received
                || order.status === OrderStatus.Submitted);
            });
          }
          else {
            this.user = null;
            this.logoutUser();
          }
        }, () => {
          this.logoutUser();
        }

        );

      this.success = false;
      this.slides.lockSwipes(true);
      this.rangeValue = '5';
      this.radioValue = 'si';
      this.selectValue = '';
      this.textValue = '';
      }


      doCheck() {
        const prom1 = this.slides.isBeginning();
        const prom2 = this.slides.isEnd();

        this.slides.getActiveIndex().then((val) => {
          this.currentSlide = val;
          console.log('current slide: ' + this.currentSlide);
        });

        Promise.all([prom1, prom2]).then((data) => {
          data[0] ? this.disablePrevBtn = true : this.disablePrevBtn = false;
          data[1] ? this.disableNextBtn = true : this.disableNextBtn = false;
        });
      }

      next() {
        this.slides.lockSwipes(false);
        this.slides.slideNext();
        this.slides.lockSwipes(true);
        console.log('range: ' + this.rangeValue);
        console.log('radio: ' + this.radioValue);
        console.log('select: ' + this.selectValue);
        console.log('checkbox: ' + JSON.stringify(this.checkboxValues));
        console.log('text: ' + this.textValue);
      }
      prev() {
        this.slides.lockSwipes(false);
        this.slides.slidePrev();
        this.slides.lockSwipes(true);
      }


      uploadImage(imageFieldName){
        return new Promise(resolve => {
          if (this.validationsForm.get(imageFieldName).value){
            const imagen = this.validationsForm.get(imageFieldName).value;
            imagen.name = (this.user.id).replace(/\s/g, '-') + '-' + Math.floor(Math.random() * (999 - 100 + 1) + 100);
            
            const uploadTask = this.database.uploadImage(imagen);
            uploadTask.task.on('state_changed', (snapshot) => {
              // Observe state change events such as progress, pause, and resume
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');

            }, (error) => {
              // Handle unsuccessful uploads

            }, () => {
              // Handle successful uploads on complete
              // For instance, get the download URL: https://firebasestorage.googleapis.com/...
              uploadTask.task.snapshot.ref.getDownloadURL().then((downloadURL) => {
                console.log('File available at', downloadURL);
                resolve(downloadURL);
              });
            });
          }else{
            resolve('');
          }
        });
      }

      sendSurvey(){

        this.loadingCtrl
        .create({ keyboardClose: true, message: 'Enviando encuesta...' })
        .then(loadingEl => {
          loadingEl.present();

          this.uploadImage('image1').then(value => {
            const downloadURL = value;
            this.uploadImage('image2').then(value2 => {
              const downloadURL2 = value2;
              this.uploadImage('image3').then(value3 => {
                const downloadURL3 = value3;
                const survey = {
                  date: new Date(),
                  userId : this.user.id,
                  fields: {
                    overallScore: {
                      question: SurveyQuestionsUser.Overall_Score,
                      answer: this.rangeValue
                    },
                    wouldRecomend: {
                      question: SurveyQuestionsUser.Would_Recommend,
                      answer: this.radioValue
                    },
                    bestQuality: {
                      question: SurveyQuestionsUser.Best_Quality,
                      answer: this.selectValue
                    },
                    couldImprove: {
                      question: SurveyQuestionsUser.Could_Improve,
                      answer: this.checkboxValues
                    },
                    comments: {
                      question: SurveyQuestionsUser.Comments,
                      answer: this.textValue
                    },
                    images: {
                      downloadURL,
                      downloadURL2,
                      downloadURL3
                    }
                  }
                };

                this.database.CreateOne(survey, 'surveys')
                .then(() => {
                  this.success = true;
                  this.loadingCtrl.dismiss();
                }).
                catch(() => {
                  this.loadingCtrl.dismiss();
                  this.presentToast('Ocurrió un error al querer agregarlo a la sala de espera. Por favor, reintente.');
                });


              });
            });
          });
        });
      }


      onImagePicked(imageData: string | File, pickerNumber) {
        console.log('valor form' + this.validationsForm);
        let imageFile;
        if (typeof imageData === 'string') {
          try {
            imageFile = this.base64toBlob(
              imageData.replace('data:image/jpeg;base64,', ''),
              'image/jpeg'
              );
            } catch (error) {
              console.log(error);
              alert(error);
              return;
            }
          } else {
            imageFile = imageData;
          }
        let picker = 'image' + pickerNumber;
        this.validationsForm.patchValue({ [picker] : imageFile });
        }

        base64toBlob(base64Data, contentType) {
          contentType = contentType || '';
          const sliceSize = 1024;
          const byteCharacters = window.atob(base64Data);
          const bytesLength = byteCharacters.length;
          const slicesCount = Math.ceil(bytesLength / sliceSize);
          const byteArrays = new Array(slicesCount);

          for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            const begin = sliceIndex * sliceSize;
            const end = Math.min(begin + sliceSize, bytesLength);

            const bytes = new Array(end - begin);
            for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
              bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
          }
          return new Blob(byteArrays, { type: contentType });
        }

        async presentToast(message: string) {
          const toast = await this.toastController.create({
            message,
            duration: 3000
          });
          toast.present();
        }

        goToHomePage(){
          this.navCtrl.navigateForward('/customer/main/home');
        }

        async presentAlertLogout() {
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Finalizando sesión',
            message: '¿Estás seguro de querer salir?',
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                }
              }, {
                text: 'Cerrar Sesión',
                handler: () => {
                  this.logoutUser();          
                }
              }
            ]
          });
      
          await alert.present();
        }
        
        logoutUser(){
          this.authService.logoutUser()
          .then(res => {
            // console.log(res);
            this.navCtrl.navigateBack('');
          })
          .catch(error => {
            console.log(error);
          });
        }
      
        logout() {
          if ((this.user as User).type === 'anonimo') {
            // Si el usuario anonimo esta comiendo o esperando el pedido, no lo dejo finalizar sesion
            if(this.pendingOrder.length > 0){  
              this.presentAlert("Para finalizar sesión tiene que pagar la cuenta.", "Atención");
            }else{
              this.presentAlertLogoutAnon();
            }
          } else {
            this.presentAlertLogout();
          }
        }
      
        async presentAlert(message, header) {
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: header,
            message: message,
            buttons: ['OK']
          });
      
          await alert.present();
        }
        async presentAlertLogoutAnon() {
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Finalizando sesión',
            message: '¿Estás seguro? Un usuario anónimo no puede recuperar sus datos.',
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                  console.log('Confirm Cancel: blah');
                }
              }, {
                text: 'Cerrar Sesión',
                handler: () => {
                  this.authService.logoutUser()
                    .then(res => {
                      this.database.UpdateSingleField('table', '', 'users', this.user.id)
                      .then(() =>{ this.navCtrl.navigateBack(''); });
                    })
                    .catch(error => {
                      console.log(error);
                    });
                }
              }
            ]
          });
      
          await alert.present();
        }
        
      }
