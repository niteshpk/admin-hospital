import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
  transform(value: string, length: number): string {
    const ellipsis = '...';

    if (typeof value === 'undefined') {
      return value;
    }

    if (value.length <= length) {
      return value;
    }

    const truncatedText = value.slice(0, length);

    return truncatedText + ellipsis;
  }
}
