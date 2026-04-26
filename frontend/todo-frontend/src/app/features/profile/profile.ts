import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Profiles } from '../../model/profiles';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user';
import { ToastService } from '../../toast/toast';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule,
    ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})

export class Profile {

  selectedFile?: File;
  submitted = false;
  profileForm!: FormGroup;   // for formGroup
  message: string = '';      // for message
  loading: boolean = false;  // for loading
  profile!: Profile;         // for profile
  photoUrl?: string;
  userId?: number;
  previewUrl: string | null = null;
  profilePhoto: string | null = null;
  validationErrors: any = {};
  todayDate = new Date().toISOString().split('T')[0];


  constructor(
    private fb: FormBuilder,
    private authService: Auth, @Inject(PLATFORM_ID) private platformId: Object
    , private cd: ChangeDetectorRef, private userService: UserService, private toastService: ToastService) { }


  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      dateOfBirth: [null, [Validators.required]],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{5,10}$/)
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]],
      title: [''],
      experience: [''],
      bio: [''],
      skills: [''],
      photoId: ['']
    });

    if (isPlatformBrowser(this.platformId)) {
      this.userService.getPhoto().subscribe(photo => {
        if (photo) {
          this.previewUrl = photo;
        } else {
          // memory empty (refresh case)
          this.loadPhotoFromBackend();
        }
      });
    }
    this.loadProfile();

  }

  loadPhotoFromBackend() {
    this.authService.getPhoto().subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          this.profilePhoto = 'assets/default-user.png';
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          this.previewUrl = base64;
          this.userService.setPhoto(base64);
          this.cd.detectChanges();
        };

        reader.readAsDataURL(blob);
      },
      error: () => {
        this.previewUrl = null;
      }
    });

  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (data) => {

        if (data) {
          this.profileForm.patchValue({
            fullName: data.fullName,
            dateOfBirth: data.dateOfBirth,
            street: data.street,
            city: data.city,
            state: data.state,
            country: data.country,
            postalCode: data.postalCode,
            phoneNumber: data.phoneNumber,
            title: data.title,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
            photoId: data.photoId
          });
        }

      },
      error: (err) => {
        console.log("No profile data found");
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);

    console.log("File selected:", file);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    const updatedProfile: Profiles = {
      ...this.profile,
      ...this.profileForm.value
    };

    this.authService.updateProfile(updatedProfile).subscribe({
      next: () => {
        this.message = "Profile Updated Successfully";
      }
    });
  }


  // Upload Photo.
  uploadPhoto() {
    console.log(this.selectedFile); // 
    if (!this.selectedFile) return;

    this.authService.uploadPhoto(this.selectedFile).subscribe({
      next: (response) => {
        this.message = "Photo uploaded successfully!";

        this.toastService.show(this.message, "success");
        this.profileForm.patchValue({
          photoId: response.photoId
        });
        this.photoUrl = response.photoId;
        this.selectedFile = undefined;
        console.log("Photo Id : " + this.photoUrl);

      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  // update profile. 
  updateProfile() {

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched(); // shows all errors
      return; // STOP API CALL
    }

    this.submitted = true;
    const profileData = this.profileForm.value;

    this.authService.updateProfile(profileData).subscribe({
      next: () => {
        this.showSuccessToast();
        this.message = "Profile updated successfully!";
        this.toastService.show(this.message, "success");
        this.validationErrors = {};
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || "Failed to update profile. Please try again.";
        this.toastService.show(errorMsg, "error");
        this.validationErrors = err.error;

      }
    });
  }
  showSuccessToast() {
    const toastElement = document.getElementById('successToast');
    const toast = new (window as any).bootstrap.Toast(toastElement, {
      delay: 2000   // 2 seconds
    });
    toast.show();
  }

}
