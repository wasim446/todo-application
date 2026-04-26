import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { Dashboard } from './dashboard/dashboard';
import { AuthGuard } from './auth-guard';
import { Profile } from './features/profile/profile';
import { Admin } from './admin/admin';
import { adminGuard } from './guards/admin-guard';
import { AdminDashboard } from './admin/dashboard/dashboard';
import { ManageUsers } from './admin/manage-users/manage-users';
import { ManageRoles } from './admin/manage-roles/manage-roles';
import { SystemLogs } from './admin/system-logs/system-logs';


export const routes: Routes = [
      { path: '', component: Home },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
      { path: 'profile', component: Profile, canActivate: [AuthGuard] },
      {
            path: 'admin', component: Admin, canActivate: [adminGuard],
            children: [
                  { path: 'dashboard', component: AdminDashboard },
                  { path: 'manageUsers', component: ManageUsers },
                  { path: 'manageRoles', component: ManageRoles },
                  { path: 'system-logs', component: SystemLogs }
            ]
      }



      // console.log("Routes loaded");
];
