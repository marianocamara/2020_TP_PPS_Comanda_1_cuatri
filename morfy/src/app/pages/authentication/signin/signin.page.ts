import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController, LoadingController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Status } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

  constructor(
    public actionSheetController: ActionSheetController,
    private navCtrl: NavController,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    public toastController: ToastController,
    private database: DatabaseService
    ) { }

    validationsForm: FormGroup;
    errorMessage = '';

    validation_messages = {
      email: [
        { type: 'required', message: 'El email es un campo requerido.' },
        { type: 'pattern', message: 'Por favor ingrese un email válido.' }
      ],
      password: [
        { type: 'required', message: 'La contraseña es un campo requerido.' },
        { type: 'minlength', message: 'La contraseña debe tener al menos 6 caracteres.' }
      ]
    };

    ngOnInit() {

      this.validationsForm = this.formBuilder.group({
        email: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        password: new FormControl('', Validators.compose([
          Validators.minLength(6),
          Validators.required
        ])),
      });

    }


    loginUser(value) {
      this.loadingCtrl
      .create({ keyboardClose: true, message: 'Ingresando...' })
      .then(loadingEl => {
        loadingEl.present();
        this.authService.signIn(value)
        .then(res => {
          
          this.errorMessage = '';

          //Si no tiene estado, le pongo que es primer ingreso
          if(typeof res !== 'undefined'){
          if(typeof res.status === 'undefined' || res.status === null ){
            const data = {
              id: res.id,
              email: res.email,
              name: res.name,
              imageUrl: res.imageUrl,
              approved: res.approved,
              dni: res.dni,
              type: res.type,
              status: "recent_enter"
            };
            
            this.database.UpdateOne(JSON.parse(JSON.stringify(data)), 'users')
            .then( () => {
              console.log('Status added');
            });
          }
        }

          
          this.loadingCtrl.dismiss();
          if (res.approved) {
          //if (true) {
            if ( res.type === 'cliente') {
              this.navCtrl.navigateForward('/customer');
            } else {
              this.navCtrl.navigateForward('/staff');
            }
          } else {
            this.navCtrl.navigateForward('/approval');
          }
          
        }, err => {
          this.loadingCtrl.dismiss();
          this.presentToast(this.authService.printErrorByCode (err.code));
        });
      });
    }


    goToSignUpPage() {
      this.navCtrl.navigateForward('/signup');
    }

    async presentActionSheet() {
      const actionSheet = await this.actionSheetController.create({
        cssClass: 'users',
        buttons: [{
          text: 'Dueño',
          icon: 'person-add-outline',
          handler: () => {
            this.validationsForm.controls.email.setValue('guillermo@dueno.com');
            this.validationsForm.controls.password.setValue('guillermopass');
          }
        }, {
          text: 'Supervisor',
          role: 'destructive',
          icon: 'person-outline',
          handler: () => {
            this.validationsForm.controls['email'].setValue("tomas@supervisor.com");
            this.validationsForm.controls['password'].setValue("tomaspass");
          }
        }, {
          text: 'Metre',
          icon: 'person-outline',
          handler: () => {
            this.validationsForm.controls['email'].setValue("sandra@metre.com");
            this.validationsForm.controls['password'].setValue("sandrapass");
          }
        }, {
          text: 'Mozo',
          icon: 'person-outline',
          handler: () => {
            this.validationsForm.controls['email'].setValue("luciano@mozo.com");
            this.validationsForm.controls['password'].setValue("lucianopass");
          } 
        }, {
          text: 'Cocinero',
          icon: 'person-outline',
          handler: () => {
            this.validationsForm.controls['email'].setValue("tony@cocinero.com");
            this.validationsForm.controls['password'].setValue("tonypass");
          } 
        }, {
          text: 'Bartender',
          icon: 'person-outline',
          handler: () => {
            this.validationsForm.controls.email.setValue('alicia@barwoman.com');
            this.validationsForm.controls.password.setValue('aliciapass');
          }
        }, {
          text: 'Cliente',
          icon: 'person-outline',
          handler: () => {
            this.validationsForm.controls.email.setValue('camaramariano@gmail.com');
            this.validationsForm.controls.password.setValue('marianopass');
          }
        },{
          text: 'Cliente Nico',
          icon: 'person-outline',
          handler: () => {
            this.validationsForm.controls.email.setValue('nicolas@cliente.com');
            this.validationsForm.controls.password.setValue('nicolaspass');
          }
        }, {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }]
      });
      await actionSheet.present();
    }

    signInGoogle(){

      this.loadingCtrl
      .create({ keyboardClose: true, message: 'Ingresando...' })
      .then(loadingEl => {
        loadingEl.present();
        this.authService.googleSignin()
        .then(res => {
          console.log(res);
          this.errorMessage = '';
          this.loadingCtrl.dismiss();
          this.navCtrl.navigateForward('/home');
        }, err => {
          this.loadingCtrl.dismiss();
          this.errorMessage =  this.authService.printErrorByCode (err.code);
        });
      });
    }

    async presentToast(message: string) {
      const toast = await this.toastController.create({
        message,
        duration: 3000
      });
      toast.present();
    }


  }
