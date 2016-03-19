import {Component, Inject} from 'angular2/core';
import {Palette} from '../emulator/palette';
import {IDisplayService, IConsoleService} from '../services/interfaces';
import {DisplayService} from '../services/displayService';
import {ConsoleService} from '../services/consoleService';
import {Constants} from '../globalConstants';

interface IPixel {
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string
}

@Component({
    selector: 'display',
    templateUrl: 'templates/display.html'
})
export class Display {
    
    public canvasWidth: number;
    public canvasHeight: number;
    
    public pixelBuffer: IPixel[];
    private palette: string[];
    
    constructor(
        @Inject(DisplayService)private displayService: IDisplayService,
        @Inject(ConsoleService)private consoleService: IConsoleService) {
            this.canvasHeight = Constants.Display.CanvasYMax;
            this.canvasWidth = Constants.Display.CanvasXMax;
            consoleService.log("Initializing the display...");
            this.pixelBuffer = new Array<IPixel>(Constants.Display.Size);
            var paletteGenerator = new Palette();
            this.palette = paletteGenerator.getPalette();
            consoleService.log("Palette has been generated.");     
            for (let y: number = 0; y < Constants.Display.YMax; y+=1 ) {
                for (let x: number = 0; x < Constants.Display.XMax; x+=1 ) {
                    let idx: number = y * Constants.Display.XMax + x;
                    let xOffs: number = x * Constants.Display.XFactor; 
                    let yOffs: number = y * Constants.Display.YFactor;
                    this.pixelBuffer[idx] = {
                        x: xOffs,
                        y: yOffs, 
                        width: Constants.Display.XFactor,
                        height: Constants.Display.YFactor, 
                        fill: this.palette[0]
                    }; 
                }
            }       
            
            displayService.callback = (address: number, value: number) => {
                var safeAddress: number = address & Constants.Display.Max; 
                var safeValue: number = value & Constants.Memory.ByteMask; 
                this.pixelBuffer[safeAddress].fill = this.palette[safeValue];    
            };
            
            consoleService.log("Build pixel map. Display initialized.");
            
        }        
}