import {Component, Inject} from 'angular2/core';

import {Hexadecimal} from '../pipes/hexadecimal';
import {EightBits} from '../pipes/eightbits';
 
import {ICpu} from '../emulator/interfaces';
import {Cpu} from '../emulator/cpu';

@Component({
    selector: 'cpuStats',
    templateUrl: 'templates/cpuStats.html',
    pipes: [Hexadecimal, EightBits]
}) 
export class CpuStats {
    constructor(@Inject(Cpu)public cpu: ICpu) {        
    }    
} 