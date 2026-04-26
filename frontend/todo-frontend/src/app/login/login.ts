import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../services/auth';
import { NgIf } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../toast/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf, CommonModule,
    ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = '';
  password = '';

  errorMessage = '';
  successMessage = '';
  backendErrorMessage: string = '';
  validationErrors: any = {};
  loginForm!: FormGroup;


  constructor(private toastService: ToastService, private fb: FormBuilder, private route: ActivatedRoute, private authService: Auth, private cd: ChangeDetectorRef, private router: Router) { }


  ngOnInit(): void {
    this.loginForm = this.fb.group({
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

  onLogin() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginData = this.loginForm.value;

    console.log("Button clicked");
    console.log("Email:", this.email);

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login success', response);
        this.toastService.show("Login is successful!", "success");

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl');

        this.router.navigateByUrl(returnUrl || '/dashboard');
        // this.router.navigate(['/dashboard']);
        this.cd.detectChanges();

      },
      error: (error) => {
        console.error('Login failed.............', error);

        if (error.status === 401 || error.status === 403) {

          this.backendErrorMessage =
            error.error?.message || "Invalid email or password! try again";

          this.toastService.show(this.backendErrorMessage, "error");
        }
        else if (error.status === 400 && error.error) {
          // Backend validation errors (email, password)
          // Show first validation message in toast
          const firstError = Object.values(error.error)[0] as string;
          this.toastService.show(firstError, "error");
        }
        else {
          this.toastService.show("Something went wrong. Try again", "error");
        }
        this.cd.detectChanges();
      }
    });
  }


}
