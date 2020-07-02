import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';
import { MessagesIndex } from '../models/messagesIndex';
import { auth } from 'firebase/app';
import { Plugins } from '@capacitor/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import 'firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    public afAuth: AngularFireAuth,
    public db: DatabaseService,
    private router: Router,
    private afs: AngularFirestore
  ) { }

  errorMessages = {
    'invalid-argument': 'Se ha ingresado un argumento invalido.',
    'invalid-disabled-field': 'El valor ingrsado para la propiedad de usuario no es valido.',
    'user-not-found': 'No existe ningun registro del usuario.',
    'email-already-exists': 'Ya existe un usuario registrado con ese email.',
    'email-already-in-use': 'Ya existe un usuario registrado con ese email.',
    'wrong-password': 'La contraseña que ha ingresado no es valida.'

    /* ADD HERE THE OTHERs IDs AND THE CORRESPONDING MESSAGEs */

  } as MessagesIndex;


  signUp(value, imageUrl, isAnonymous?) {
    let type;
    if(isAnonymous !== undefined){
    type = isAnonymous ? 'anonimo' : 'cliente';
    }else{
      type = value["type"];
    }
    console.log(value.password);
    return new Promise<any>((resolve, reject) => {
      (isAnonymous ? this.afAuth.signInAnonymously() : this.afAuth.createUserWithEmailAndPassword(value.email, value.password))
        .then(
          result => {
            if (result) {
              this.db.CreateOne({
                type: type,
                name: value.name + ' ' + value.lastName,
                id: result.user.uid,
                dni: value.dni,
                email: result.user.email,
                approved: false,
                status: "recent_enter",
                imageUrl
              },
                'users').then(() => {
                  if(isAnonymous !== undefined){
                    resolve(this.saveInStorage(result.user));
                    }
                    else{
                      resolve();
                    }
                });
            }
          },
          err => reject(err)
        );
    });
  }

  signIn(value) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.signInWithEmailAndPassword(value.email, value.password)
        .then(
          res => {
            resolve(this.saveInStorage(res.user));
          },
          err => reject(err));
    });
  }


  logoutUser(alert?) {
    return new Promise((resolve, reject) => {
      if (this.afAuth.currentUser) {
        this.afAuth.signOut()
          .then(() => {
            console.log('LOG Out');
            localStorage.removeItem('user');
            // localStorage.removeItem('user-bd');
            Plugins.Storage.remove({ key: 'user-bd' });
            resolve();
          }).catch((error) => {
            reject();
          });
      }
    });
  }

  userDetails() {
    return this.afAuth.currentUser;
  }


  saveInStorage(user) {
    return new Promise((resolve, reject) => {
      this.db.GetOne('users', user.uid)
        .then(result => {
          Plugins.Storage.set({ key: 'user-bd', value: JSON.stringify(result) });
          console.log(JSON.stringify(result));
          resolve(result);
        });
    });
  }


  // translate errors
  public printErrorByCode(code: string): string {
    code = code.split('/')[1];
    if (this.errorMessages[code]) {
      return (this.errorMessages[code]);
    } else {
      return ('Ha ocurrido un error desconocido. \n Código del error:: ' + code);
    }
  }


  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }


  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: any = this.afs.doc(`users/${user.uid}`);

    const data = {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      imageUrl: user.photoURL
    };

    return userRef.set(data, { merge: true });
  }

  approveUser(id, userApproved) {
    userApproved ? this.afs.doc(`users/${id}`).update({ approved: false }) : this.afs.doc(`users/${id}`).update({ approved: true });
  }


}
