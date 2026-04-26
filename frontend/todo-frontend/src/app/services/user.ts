import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

  private photoSubject = new BehaviorSubject<string | null>(null);
  photo$ = this.photoSubject.asObservable();

  setPhoto(url: string | null) {
    this.photoSubject.next(url);
  }

  getPhoto() {
    return this.photo$;
  }
}