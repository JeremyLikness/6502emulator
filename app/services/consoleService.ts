import {IConsoleService} from './interfaces';
import {Constants} from '../globalConstants';

export class ConsoleService implements IConsoleService {
    
    public lines: string[];

    constructor() {
        this.lines = [];
    }

    public log(message: string): void {
        this.lines.push(message);
        
        if (this.lines.length > Constants.Display.ConsoleLines) {
            this.lines.splice(0, 1);
        }            
    }
}