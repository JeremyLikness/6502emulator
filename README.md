# 6502emulator

Emulator for the 6502 chipset written with TypeScript and Angular 2.

Visit [my blog](http://csharperimage.jeremylikness.com/) for regular Angular articles.

This is a 6502 emulator written specifically to demonstrate the structure and functions of Angular 2 and TypeScript. It is 
not a full hardware emulator and not optimized for speed, but rather for readability. It is not completed (I do accept pull requests) 
because not all op codes are implemented and the binary-packed decimal tests fail, but the other tests and programs run successfully. 

The emulator features a full assembler/compiler with support for labels, a disassembler, a memory dump, and enables you to debug and 
step through programs. 

## Getting Started 

Navigate to the parent directory of the location you wish to place the project (it will create the `6502emulator` folder for you).

Grab the repo: 

`git clone https://github.com/JeremyLikness/6502emulator.git` 

Navigate to the directory:

`cd 6502emulator` 

If you want the typings (Angular 2 is fairly self-documenting, so I just included ones for `Node.js`) install the utility:

`npm install -g typings` 

Then:

`typings install` 

Now install the package dependencies: 

`npm install` 

You'll probably get a lot of noise and errors but as long as the final list shows `rxjs`, `angular2` etc. and the final line is not 
an error, you should be good. 

Now you can compile and run it: 

`npm start` 

That should be it! Follow the directions to load, compile, and run your first 6502 program. The display is memory-mapped, meaning you
create graphics by setting a value 0 - 255 to a memory address (the `globalConstants.ts` contains all of the information you need). 

Thanks, 

Jeremy Likness
[@JeremyLikness](https://twitter.com/JeremyLikness) 
