import {AbstractControl} from '@angular/forms';

export class PasswordValidation {

    static MatchPassword(ac: AbstractControl) {
       const password = ac.get('password').value;
       const confirmPassword = ac.get('confirmPassword').value;
        if (password !== confirmPassword) {
            ac.get('confirmPassword').setErrors( {MatchPassword: true} );
        } else {
            return null;
        }
    }
}
