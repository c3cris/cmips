# cMips
#### by pidbaq (Cris Ghiurea)

## Compiler/Simulation
[https://c3cris.github.io/cmips](https://c3cris.github.io/cmips)

CMips is a proof of concept of a 16 bit subset of MIPS designed by [pidbaq](http://www.pidbaq.com).  cMips contains most features of a full working CPU using RISC design with a 32 by 32 bit monitor. 

Included in the repo you will find an assembler for easy programming.  It also contains demo code to get you started or you can use the web interface to assemble your own application.

### Screenshot

![cMips Screenshot](docs/images/labeled_schematic.png)

### JS Assembler for the CPU

https://c3cris.github.io/cmips/


### Example
The Fibonacci sequence in cMips Assembly
```
addi  $1 $0 1     # a = 1
addi  $2 $0 0     # b = 0
loop:
    addi $3 $1 0  # c = a
    add $1 $1 $2  # a = a + b
    addi $2 $3 0  # b = c
jump loop         # jump to loop
```

c equivalent: 
```c
int a = 1;
int b = 0;
int c = 0;
while (true){
  c = a;
  a = a + b;
  b = c;
}
```

Binary:
```
0100000001000001
0100000010000000
0100001011000000
0000001010001000
0100011010000000
1011000000000010
```


### OP Codes and Registers

https://github.com/c3cris/cmips/wiki

cMips has 3 types of instruction formats R, I and J in 16 bit:

| Type | 15-12 | 11-9 | 8-6 | 5-3 | 2-0 |
|------|-------|------|-----|-----|-----|
| R    | op    | r1   | r2  | r3  | f   |
| I    | op    | r1   | r2  | #   | #   |
| J    | op    | #    | #   | #   | #   |

op = op code of the instruction  
r1 = register 1 bit | source reg  
r2 = register 2 bit | target/source  
r3 = register 3 bit | destination in R type  
\# = immediate bit 


| Type | Code  |    | 1 | 2 | 3 | 4 | 5   - 10 | 11 | 12 | 13 | 14 | 15 | 16 |
|------|-------|----|---|---|---|---|----------|----|----|----|----|----|----|
| R    | ADD   | 0  |   |   |   |   |     -    |    |    |    |    |    |    |
| R    | SUB   | 0  |   |   |   |   |     -    |    |    |    |    |    | 1  |
| R    | ADDU  | 0  |   |   |   |   |     -    |    |    |    |    | 1  |    |
| R    | SUBU  | 0  |   |   |   |   |     -    |    |    |    |    | 1  | 1  |
| R    | AND   | 0  |   |   |   |   |     -    |    |    |    | 1  |    |    |
| R    | OR    | 0  |   |   |   |   |     -    |    |    |    | 1  |    | 1  |
| R    | NOR   | 0  |   |   |   |   |     -    |    |    |    | 1  | 1  |    |
| R    | XOR   | 0  |   |   |   |   |     -    |    |    |    | 1  | 1  | 1  |
| R    | SLL   | 1  |   |   |   | 1 |     -    |    |    |    |    |    |    |
| R    | SRL   | 1  |   |   |   | 1 |     -    |    |    |    |    |    | 1  |
| R    | SRA   | 1  |   |   |   | 1 |     -    |    |    |    |    | 1  |    |
| R    | SLLR  | 1  |   |   |   | 1 |     -    |    |    |    |    |    |    |
| R    | SRLR  | 1  |   |   |   | 1 |     -    |    |    |    |    |    |    |
| R    | SLT   | 1  |   |   |   | 1 |     -    |    |    |    |    |    |    |
| R    | SLTU  | 1  |   |   |   | 1 |     -    |    |    |    |    |    |    |
| R    | JR    | 1  |   |   |   | 1 |     -    |    |    |    |    |    |    |
| R    | MULT  | 2  |   |   | 1 |   |     -    |    |    |    |    |    |    |
| R    | MULTU | 2  |   |   | 1 |   |     -    |    |    |    |    |    | 1  |
| R    | DIV   | 2  |   |   | 1 |   |     -    |    |    |    |    | 1  |    |
| R    | DIVU  | 2  |   |   | 1 |   |     -    |    |    |    |    | 1  | 1  |
| R    | MFHI  | 2  |   |   | 1 |   |     -    |    |    |    | 1  |    |    |
| R    | MFLO  | 2  |   |   | 1 |   |     -    |    |    |    | 1  |    | 1  |
| R    |       | 2  |   |   | 1 |   |     -    |    |    |    | 1  | 1  |    |
| R    |       | 2  |   |   | 1 |   |     -    |    |    |    | 1  | 1  | 1  |
| R    |       | 3  |   |   | 1 | 1 |     -    |    |    |    |    |    |    |
| R    |       | 3  |   |   | 1 | 1 |     -    |    |    |    |    |    | 1  |
| R    |       | 3  |   |   | 1 | 1 |     -    |    |    |    |    | 1  |    |
| R    |       | 3  |   |   | 1 | 1 |     -    |    |    |    |    | 1  | 1  |
| R    |       | 3  |   |   | 1 | 1 |     -    |    |    |    | 1  |    |    |
| R    |       | 3  |   |   | 1 | 1 |     -    |    |    |    | 1  |    | 1  |
| R    |       | 3  |   |   | 1 | 1 |     -    |    |    |    | 1  | 1  |    |
| R    |       | 3  |   |   | 1 | 1 |     -    |    |    |    | 1  | 1  | 1  |
| I    | ADDI  | 4  |   | 1 |   |   |     -    | 64 | -  | -  | -  | -  | -  |
| I    | ADDIU | 5  |   | 1 |   | 1 |     -    | 64 | -  | -  | -  | -  | -  |
| I    | SUBIU | 6  |   | 1 | 1 |   |     -    | 64 | -  | -  | -  | -  | -  |
| I    | SLTI  | 7  |   | 1 | 1 | 1 |     -    | 64 | -  | -  | -  | -  | -  |
| I    | SLTIU | 8  | 1 |   |   |   |     -    | 64 | -  | -  | -  | -  | -  |
| I    | LHW   | 9  | 1 |   |   | 1 |     -    | 64 | -  | -  | -  | -  | -  |
| I    | SHW   | 10 | 1 |   | 1 |   |     -    | 64 | -  | -  | -  | -  | -  |
| J    | J     | 11 | 1 |   | 1 | 1 | 4096- -  | -  | -  | -  | -  | -  | -  |
| J    | JAL   | 12 | 1 | 1 |   |   | 4096- -  | -  | -  | -  | -  | -  | -  |
| I    | BE    | 13 | 1 | 1 |   | 1 |     -    | 64 | -  | -  | -  | -  | -  |
| I    | BNE   | 14 | 1 | 1 | 1 |   |     -    | 64 | -  | -  | -  | -  | -  |
| I    | Syscall | 15 | 1 | 1 | 1 | 1 |     -    |    |    |    |    |    |    |
* Empty commands are unused opcodes for future implementation.

Registers:

| # | Name  | Type           |
|---|-------|----------------|
| 0 | $0    | zero           |
| 1 | $1    | general        |
| 2 | $2    | general        |
| 3 | $3    | general        |
| 4 | $4    | general        |
| 5 | $5/v  | general        |
| 6 | $sp/6   | stack pointer  |
| 7 | $ra/7   | return address |


## Installation

### Simulator

This repo uses logisim-win-2.7.1.exe simulator which can be found at:  [https://sourceforge.net/projects/circuit/files/](https://sourceforge.net/projects/circuit/files/)

#### Circuit

cMips.circ is the main logism file containing the CPU.

#### Rom Programs

* draw_checkers.dat 
  * Demonstates writing to the simulated monitor
* fib.dat
  * Calculates fibinacci's sequence until it overflows 
* mult_12345.dat
  * A demo of multiplication by addition. 

### cMips Dependencies

* Jquery 2.2.4 (included)
* Code Mirror
  * Install using **npm install codemirror**



