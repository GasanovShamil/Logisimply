import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'siret'
})
export class SiretPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value.length !== 14)
      return value;

    return value.substring(0, 3) + " " + value.substring(3, 6) + " " + value.substring(6, 9) + " " + value.substring(9, 14);
  }

}
