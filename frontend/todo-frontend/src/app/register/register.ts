import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../model/user';
import { ChangeDetectorRef } from '@angular/core';
import { Auth } from '../services/auth';
import { FormsModule } from "@angular/forms";
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../toast/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf, ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  errorMessage = '';
  successMessage = '';

  validationErrors: any = {};
  registerForm!: FormGroup;


  user: User = new User();


  constructor(private toastService: ToastService, private fb: FormBuilder, private route: ActivatedRoute, private authService: Auth, private cd: ChangeDetectorRef, private router: Router) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(4)
      ]],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,50}$/
        ),
        Validators.minLength(4),
        Validators.maxLength(50)
      ]]
    });
  }

  registerUser() {

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const registerData = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registration is successful.', response);

        this.toastService.show("Registration is successful!", "success");
        this.errorMessage = '';
        this.validationErrors = {};
        setTimeout(() => {
          this.registerForm.reset();
        }, 1000);
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Registration failed:', error);

        // Extract message safely
        const backendMessage =
          error?.error?.message ||   // if backend sends object
          error?.error ||            // if backend sends string
          'Something went wrong';

        if (error.status === 409) {
          this.errorMessage = backendMessage;

          this.toastService.show(this.errorMessage, "error");

        } else if (error.status === 400) {
          this.errorMessage = backendMessage || "Invalid request data!";
          this.toastService.show(this.errorMessage, "error");

        } else {
          this.errorMessage = "Registration failed! Please try again later.";

          this.toastService.show(this.errorMessage, "error");
        }

        this.successMessage = '';
        this.cd.detectChanges();
      }
    });
  }

}
