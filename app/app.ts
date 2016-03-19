import {Component, Inject, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {FORM_DIRECTIVES} from 'angular2/common';
import {HTTP_PROVIDERS} from 'angular2/http';

import {Console} from './components/console';
import {CpuStats} from './components/cpuStats';
import {Display} from './components/display';
import {Compiler} from './components/compiler';

import {Compiler as CompilerService} from './emulator/compiler';
import {OpCodes} from './emulator/opsCodes';
import {Cpu} from './emulator/cpu';

import {IConsoleService} from './services/interfaces';
import {ConsoleService} from './services/consoleService';
import {DisplayService} from './services/displayService';

import {Constants} from './globalConstants';

@Component({
    selector: 'emulator',
    directives: [Console, CpuStats, Display, Compiler],
    templateUrl: 'templates/app.html'
})
export class AppComponent {
    constructor(@Inject(ConsoleService)private consoleService: IConsoleService) {}
    ngAfterViewInit(): void {
        this.consoleService.log("Application initialized.");
    }
 }
 
bootstrap(AppComponent, [
    OpCodes,
    CompilerService,
    ConsoleService,
    DisplayService,
    HTTP_PROVIDERS,
    Cpu
    ]);