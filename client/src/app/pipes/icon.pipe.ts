import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'icon'
})
export class IconPipe implements PipeTransform {

  transform(value: any): any {
    let res;
    switch (value) {
      case 'draft': {
        res = 'notes';
        break;
      }
      case 'sent': {
        res = 'mail';
        break;
      }
      case 'lock': {
        res = 'lock';
        break;
      }
      case 'payed': {
        res = 'euro_symbol';
        break;
      }
    }
    return res;
  }

}
