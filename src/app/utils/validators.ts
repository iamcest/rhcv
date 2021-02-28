import { FormArray, FormControl, ValidatorFn, ValidationErrors, FormGroup } from '@angular/forms';
export function validateFormArray(array: FormArray) {
  if (!array.controls || !Array.isArray(array.controls) || !array.controls.length) {
    return { arrayLength: true };
  }
  if (array.controls.find(c => c.status === 'INVALID')) {
    return { arrayItemsInvalid: true };
  }
  return null;
}

 export function validateUniqueTime(inputGroup: FormGroup) {
  return (control: FormControl) => {
    if (inputGroup) {
      const inputArray = inputGroup.get('times') as FormArray;
      if (inputArray.length > 1) {
        for (let i = 0; i < inputArray.length; i++) {
          const timeGroup = control.parent?.get('index');
          if (timeGroup?.value !== i) {
            if (inputArray.at(i).value.time === control.value) {
              return { isDuplicated: true };
            }
          }
        }
      }
    }
    return null;
  };
}
