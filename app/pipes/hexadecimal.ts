import {Pipe, Inject} from 'angular2/core';

@Pipe({
  name: 'hexadecimal'
})
export class Hexadecimal {
	constructor() {}
  transform(input:number, args: string[]) : string {
    var value = Number(input);
    return "0x" + value.toString(16).toUpperCase();
  }
}