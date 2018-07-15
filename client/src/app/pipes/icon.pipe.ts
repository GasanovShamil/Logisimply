import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'icon'
})
export class IconPipe implements PipeTransform {

  transform(value: any, color?: any): any {
    let res;
    switch (value) {
      case 'draft': {
        res = 'notes';
        break;
      }
      case 'sent': {
        res = 'mail';
      }
      case 'lock': {
        res = 'lock';
      }
      case 'payed': {
        res = 'attach_money';
      }
    }
    return res;
  }

}
