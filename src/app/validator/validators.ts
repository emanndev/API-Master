import { AbstractControl, ValidatorFn } from '@angular/forms';

const PROFANITY_LIST = ['damn', 'hell', 'badword'];
const UNSAFE_CHARS = /[<>&;]/; // Disallow <, >, &, ;

export function restrictedContentValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value as string;
    if (!value) {
      return null;
    }
    // Check for profanity
    const hasProfanity = PROFANITY_LIST.some((word) =>
      value.toLowerCase().includes(word)
    );
    // Check for unsafe characters
    const hasUnsafeChars = UNSAFE_CHARS.test(value);
    return hasProfanity || hasUnsafeChars
      ? { restrictedContent: 'Input contains prohibited words or characters.' }
      : null;
  };
}
