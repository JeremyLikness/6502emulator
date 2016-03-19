import {Component, Inject} from 'angular2/core'; 
import {IConsoleService} from '../services/interfaces';
import {ConsoleService} from '../services/consoleService';

@Component({
    selector: 'console',
    templateUrl: 'templates/console.html'
}) 
export class Console {
    
    public lines: string[];
    
    constructor(@Inject(ConsoleService)private consoleService: IConsoleService) {
        this.lines = consoleService.lines;
    }    
} 