import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AmplifyService } from 'aws-amplify-angular';
import { PasswordValidation } from './password-validation';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ChangePasswordComponent>,
    private amplifyService: AmplifyService,
    private snackbar: MatSnackBar,
    fb: FormBuilder
  ) {
      this.form = fb.group({
        oldPassword: [''],
        password: [''],
        confirmPassword: ['']
      }, {
        validator: PasswordValidation.MatchPassword
      });
   }

   ngOnInit() {}

  onSubmit() {
    this.amplifyService.auth().currentAuthenticatedUser()
      .then(user => {
        const { oldPassword, confirmPassword } = this.form.value;
        // Send confirmPassword here because it already valid
        this.amplifyService.auth().changePassword(user, oldPassword, confirmPassword)
          .then(() => {
            this.snackbar.open('Password changed!', '', { duration: 5000 });
            this.dialogRef.close(this.form.value);
          })
          .catch((error) => this.snackbar.open(error.message, '', { duration: 5000 }));
      });
  }

  isPassword() {
    const { password, confirmPassword } = this.form.value;

    return password !== confirmPassword ||
           !this.form.touched ||
           this.form.status === 'INVALID';
  }

  close() {
    this.dialogRef.close();
  }

}
