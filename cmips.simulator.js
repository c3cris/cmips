function cmipsSimulator(w, h, el) {
    this.dom = document.getElementById(el);
    this.context = this.dom.getContext('2d');
    this.registers = [0, 0, 0, 0, 0, 0, 0, 0];
    this.assembler = {};
    this.height = h;
    this.width = w;
    this.dom.width = w;
    this.dom.height = h;
    this.pause = false;
    this.state = 0;
    // this.state = 0;
    this.interval = 0;
    this.code = {op:null, sr:null, tr:null, dr:null, fun:null, im:null, line:null};
    this.line = 0;
    this.done = false;
    this.k = 0;
    this.memory = {};
    this.linehighlight = true;
    this.steps = 200;
    this.screen = [];
    this.populateScreen();
    this.init();
    this.line = 0;
    this.regs = {
        '000' : 0,
        '001' : 1,
        '010' : 2,
        '011' : 3,
        '100' : 4,
        '101' : 5,
        '110' : 6,
        '111' : 7
    };

}


/**


 */
cmipsSimulator.prototype.init = function () {
    t = this;
    this.drawRegs();
    this.drawScreen();
    window.onkeydown = function (event) {

        var characterPressed = String.fromCharCode(event.keyCode);

        if (characterPressed.toUpperCase() === "X") {
            t.steps *= 2;
        } else if (characterPressed.toUpperCase() === "Z") {
            t.steps /= 2;
        }
    }


};

cmipsSimulator.prototype.run = function () {

    this.reset();
    clearTimeout(this.interval);

    //reset vars
    this.state = 1;
    this.assembler.machineCode = [];
    this.assembler.line = 0;
    this.assembler.textLine = 0;
    this.assembler.labels = {};
    this.assembler.error = false;
    this.line = 0;
    this.mark = null;

    var rawCode = this.editor.getValue();
    this.assembler.code = rawCode.split(/\r?\n/);

    this.length =  this.assembler.code.length ;

    try {

        for (var i = 0; i < this.length; i++) {
            this.assembler.textLine++;
            this.assembler.parseLabels(this.assembler.code[i]);
        }

        // console.log(this.assembler.lineMap);
        this.assembler.line = 0;
        this.assembler.textLine = 0;

    }catch(e){
        alert(e);
        this.assembler.error = true;
        // return {"bin":"","hex":""};
    }

    this.loop(this);

    // var binary = this.machineCode.join("\n");
    // var hex = this.binaryToHex(this.machineCode);


    // return {"bin":binary, "hex":hex};


};


cmipsSimulator.prototype.parse = function () {

    // for (var i = 0; i < length; i++) {

        this.assembler.textLine++;
        if ( this.mark !== null && this.linehighlight) this.mark.clear();
        if ( this.linehighlight) this.mark = this.editor.markText({line: this.assembler.textLine -1 , ch: 0}, {line: this.assembler.textLine - 1, ch: 200}, {className: "styled-background"});
        this.assembler.parseLine(this.assembler.code[this.assembler.textLine - 1], this);
        // console.log(this.assembler.code[this.assembler.textLine - 1])

        if( this.code.op != null){
            this.simulate(this.code);
            this.line++;
        }





};


cmipsSimulator.prototype.unpause = function () {

    this.state = 1;
    this.loop(this);

}


cmipsSimulator.prototype.step = function () {

    if (this.pause === true) {
        this.loop(this);
    }

}


    /**
 * Creates loop based on t
 * @param t context
 */
cmipsSimulator.prototype.loop = function (t) {

    t.parse();
    t.draw();


    if( t.done === false && t.pause === false) {
        t.interval = setTimeout(t.loop, t.steps, t);
    }else if (t.pause === true) {
        t.state = 0;
    }else{
        t.state = 0;
       setTimeout(function(t){
           t.mark.clear();
       }, t.steps, t);
    }

};



cmipsSimulator.prototype.draw = function () {

    this.drawRegs();
    this.drawScreen();
    this.drawMemory();
    this.fps();


}
cmipsSimulator.prototype.populateScreen = function () {

    for(y = 0; y < 32; y++) {
        this.screen[y] = [];
        for (x = 0; x < 32; x++) {

            this.screen[y][x] = 0;
        }
    }

}
cmipsSimulator.prototype.reset = function () {

    this.registers = [0, 0, 0, 0, 0, 0, 0, 0];
    this.memory = {};
    this.populateScreen();
    this.line = 0;

}
cmipsSimulator.prototype.fps = function () {

    writeMessage(this.context, Math.floor(this.steps * 100) / 100, 10, 10, 40, 25, "10");


}



cmipsSimulator.prototype.drawRegs = function () {

    var ctx = this.context;
    start = 70;
    width = 70;
    height = 30;
    offset = 35;
    ctx.font = '13pt Calibri';

    ctx.clearRect(0,0,width+100,height*8+60);

    for(x = 0; x < 8; x++){

        yy = offset * x + 20;
        xx = start;

        ctx.beginPath();
        ctx.moveTo(xx,yy);
        ctx.lineTo(xx+width,yy);
        ctx.lineTo(xx+width,yy+height);
        ctx.lineTo(xx,yy+height);
        ctx.lineTo(xx,yy);
        ctx.fillStyle = 'black';
        ctx.stroke();
        ctx.fillText("Reg "+x, xx-45, yy+20);
        ctx.fillStyle = 'red';

        ctx.fillText(this.registers[x],xx+10, yy+20);

    }

}

cmipsSimulator.prototype.drawMemory = function () {

    var ctx = this.context;
    start = 250;
    // width = 70;
    height = 20;
    offset = 15;
    ctx.font = '13pt Calibri';

    const keys = Object.keys(this.memory);
    ctx.clearRect(start,10,250,offset*keys.length+80);

    ctx.fillText("Memory",start,height);




    var i = 0;
    for(key in this.memory){

        console.log(this.memory[key]);
        yy = offset * i + height + 30;
        xx = start;

        ctx.fillText(key,xx, yy);
        ctx.fillText(" | ",xx+20, yy);
        ctx.fillText(this.memory[key],xx+35, yy);

        //
        // ctx.beginPath();
        // ctx.moveTo(xx,yy);
        // ctx.lineTo(xx+width,yy);
        // ctx.lineTo(xx+width,yy+height);
        // ctx.lineTo(xx,yy+height);
        // ctx.lineTo(xx,yy);
        // ctx.fillStyle = 'black';
        // ctx.stroke();
        // ctx.fillText("Reg "+x, xx-45, yy+20);
        // ctx.fillStyle = 'red';
        //
        // ctx.fillText(this.registers[x],xx+10, yy+20);
        i++;
    }

}

cmipsSimulator.prototype.drawScreen = function () {


    var ctx = this.context;
    start_x = 500;
    start_y = 20;
    width = 32;
    height = 32;
    offset = 8;

    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            if (this.screen[y][x] == 1) {
                ctx.fillStyle = "white";
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fillRect(start_x + x * offset, start_y + y * offset, offset, offset);

        }
    }


}


cmipsSimulator.prototype.simulate = function (code) {


    switch(code.op) {
        case "ADDI":
            this.registers[this.regs[code.tr]] = this.registers[this.regs[code.sr]] + code.im;
            break;
        case "ADDIU":
            this.registers[this.regs[code.tr]] = this.registers[this.regs[code.sr]] + code.im;
            break;01
        // case "ADDI":
        //     this.registers[this.regs[code.tr]] = this.registers[this.regs[code.sr]] + code.im;
        //     break;

        case "AND":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.tr]] & this.regs[code.sr];
            break;
        case "OR":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.tr]] | this.regs[code.sr];
            break;
        case "NOR":
            break;
        case "XOR":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.tr]] ^ this.regs[code.sr];
            break;

        case "SLL":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.tr]] << this.regs[code.sr];
            break;
        case "SRL":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.tr]] >> this.regs[code.sr];
            break;
        case "SRA":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.tr]] >>> this.regs[code.sr];
            break;
        case "SLT":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.sr]] < this.registers[this.regs[code.tr]] ? 1 : 0;
            break;
        case "SLTI":
            this.registers[this.regs[code.tr]] = this.registers[this.regs[code.sr]] < code.im ? 1 : 0;
            break;
        case "SLTU":
            this.registers[this.regs[code.tr]] = this.registers[this.regs[code.sr]] < code.im ? 1 : 0;
            break;

        case "SUB":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.sr]] - this.registers[this.regs[code.tr]];
            break;
        case "SUBU":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.sr]] - this.registers[this.regs[code.tr]];
            break;
         case "ADD":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.sr]] + this.registers[this.regs[code.tr]];
            break;

        case "BEQ":
            if ( this.registers[this.regs[code.tr]] ===  this.registers[this.regs[code.sr]]){

                this.line = this.line - code.im - 1;
                this.assembler.textLine =  this.assembler.lineMap[this.line + 1] - 1;
            }
            break;
        case "BNE":
            if ( this.registers[this.regs[code.tr]] !==  this.registers[this.regs[code.sr]]){
                this.line = this.line - code.im;
                this.assembler.textLine =  this.assembler.lineMap[this.line] - 1;
            }
            break;
        case "SUBIU":
            this.registers[this.regs[code.tr]] = this.registers[this.regs[code.sr]] - code.im;
            break;
        case "SHW":
            this.memory[this.registers[this.regs[code.sr]] + code.im] = this.registers[this.regs[code.tr]];
            break;
        case "LHW":
            this.registers[this.regs[code.tr]] =  this.memory[this.registers[this.regs[code.sr]] + code.im];
            break;
        case "JUMP":
            this.line = code.im;
            this.assembler.textLine = this.assembler.lineMap[code.im] - 1;
            break;
        case "JAL":
            this.registers[7] = this.line + 1;
            this.line = code.im;
            this.assembler.textLine = this.assembler.lineMap[code.im] - 1;

            break;
        case "JR":
            this.line = this.registers[7] - 1;
            this.assembler.textLine = this.assembler.lineMap[this.line] - 1 ;
            break;
        case "SYS":
            var x = this.registers[this.regs[code.tr]];
            var y = this.registers[this.regs[code.sr]];
            this.screen[y][x] = code.im;
            if( code.im == 2) this.populateScreen();
            break;
        default:
            alert("error");
    }

    this.code =  {op:null, sr:null, tr:null, dr:null, fun:null, im:null};




}












    function writeMessage(context, message, x, y, w, h, size) {

    context.clearRect(x, y-h, w, h);
    context.font = size + 'pt Calibri';
    context.fillStyle = 'black';
    context.fillText(message, x, y);
}

function getMousePos(canvas, evt) {
    var ratio = 20;
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((evt.clientX - rect.left) / ratio),
        y: Math.floor((evt.clientY - rect.top) / ratio)
    };
}
