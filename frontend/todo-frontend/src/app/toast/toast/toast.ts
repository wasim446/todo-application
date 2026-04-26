import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../toast';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})


export class ToastComponent {

  toast: ToastMessage | null = null;
  visible = false;

   toast$!: Observable<any>;

  constructor(private toastService: ToastService) {
    this.toast$ = this.toastService.toastState$;
  }
}