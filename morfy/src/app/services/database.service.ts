import { Injectable } from '@angular/core';

import { AngularFirestore, } from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { OrderStatus } from '../models/order';
import { firestore } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage
    ) { }


  CreateOne(objeto: any, collection: string) {
    let id;
    if (objeto.id) {
      id = objeto.id;
    } else {
      id = this.afs.createId();
      objeto.id = id;
    }
    return this.afs.collection(collection).doc(id).set(objeto);
  }


  GetOne(collection, id) {
    return new Promise<any>((resolve, reject) => {
      this.afs.collection(`${collection}`).doc(id).valueChanges().pipe(take(1)).subscribe(snapshots => {
        resolve(snapshots);
      });
    });
  }


  GetAll(collection): Observable<any[]> {
    return this.afs.collection<any>(collection).valueChanges()
    .pipe (res => res );
  }


  GetWithQuery(key: string, operator: any, value: any, collection: string): Observable<any[]> { // operator= '==' '<=' etc
    return this.afs.collection(collection, ref => ref.where(key, operator, value)).valueChanges()
    .pipe (res => res );
  }


  GetDocRef(collection: string, docId: string) {
    return this.afs.collection(collection).doc(docId);
  }


  UpdateOne(objeto: any, collection: string) {
    const id = objeto.id;
    const objetoDoc = this.afs.doc<any>(`${collection}/${id}`);
    return objetoDoc.update(objeto);
  }


  UpdateSingleField(key: string, value: any, collection: string, docId: string) {
    return this.afs.collection(collection).doc(docId).update({[key]: value});
  }


  AppendDataToArrayField(key: string, value: any, collection: string, docId: string){
    const ref = this.afs.collection(collection).doc(docId);
    return ref.update({
      [key]: firestore.FieldValue.arrayUnion(value)
    });
  }


  DeleteOne(id: any, collection: string) {
    const objetoDoc = this.afs.collection(`${collection}`).doc(id);
    return objetoDoc.delete();
  }


  uploadImage(image: File) {
    // The storage ref
    const storageRef = this.storage.ref('morfy-images/' + image.name);
    // Upload the file
    const uploadTask = storageRef.put(image);

    return uploadTask;
  }

  GetPendingOrder(userId) {
    return this.afs.collection('orders', ref => ref.where('idClient', '==', userId).where('status', '==', OrderStatus.Pending))
    .valueChanges()
    .pipe (res => res );
  }

}
