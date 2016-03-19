import {Pipe, Inject} from 'angular2/core';

@Pipe({
  name: 'eightbits'
})
export class EightBits {
	constructor() {}
  transform(input:number, args: string[]) : string {
    var padding: string = "00000000";
    var result: string; 
    var value = Number(input);
    result = padding + value.toString(2);
    return result.substring(result.length - 8, result.length);    
  }
}