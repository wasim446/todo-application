import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  constructor(
    private authService: Auth,
    private router: Router
  ) { }



}
