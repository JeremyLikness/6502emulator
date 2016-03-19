import {IDisplayService} from './interfaces';
import {Constants} from '../globalConstants';

export class DisplayService implements IDisplayService {
    
    constructor() {
        this.pixels = new Array<number>(Constants.Display.Size);
        this.callback = (address: number, value: number) => {};
    }
    
    public pixels: number[];
    public callback: (address: number, value: number) => void;
    
    public draw(address: number, value: number): void {
        var target: number = address & Constants.Display.Max;
        this.pixels[target] = value & Constants.Memory.ByteMask; 
        this.callback(address, value);
    };
    
}