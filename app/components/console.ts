import {Component, Inject, ElementRef} from 'angular2/core'; 
import {IConsoleService} from '../services/interfaces';
import {ConsoleService} from '../services/consoleService';

@Component({
    selector: 'console',
    templateUrl: 'templates/console.html'
}) 
export class Console {
    
    public lines: string[];
    private div: HTMLDivElement;
    
    constructor(
        private element: ElementRef,
        @Inject(ConsoleService)private consoleService: IConsoleService) {
        this.lines = consoleService.lines;
    }    
    
    ngAfterViewInit() {
        var div = <HTMLDivElement>this.element.nativeElement.getElementsByTagName('div')[0];   
        this.consoleService.logEvent.asObservable().debounceTime(100).subscribe(data => {
            window.setTimeout(() => div.scrollTop = div.scrollHeight, 0);
        }); 
    }
    
    public clear(): void {
        this.lines.length = 0;
        this.lines.push("Consoled cleared.");
    }
} 