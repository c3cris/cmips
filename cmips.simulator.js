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
    this.steps = 400;
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
            console.log("X");
            t.steps *= 2;
        } else if (characterPressed.toUpperCase() === "Z") {
            t.steps /= 2;
        }
    }


};

cmipsSimulator.prototype.run = function () {


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
        if ( this.mark !== null) this.mark.clear();
        this.mark = this.editor.markText({line: this.assembler.textLine -1 , ch: 0}, {line: this.assembler.textLine - 1, ch: 200}, {className: "styled-background"});
        this.assembler.parseLine(this.assembler.code[this.line], this);
        this.line++;

        if( this.code.op != null){
            this.simulate(this.code);
        }


        console.log(this.assembler.code[this.line])


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
    this.populateScreen();
    this.line = 0;

}
cmipsSimulator.prototype.fps = function () {

    writeMessage(this.context, this.steps, 300, 20, 60, 35, "14");


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

cmipsSimulator.prototype.drawScreen = function () {


    var ctx = this.context;
    start_x = 500;
    start_y = 40;
    width = 32;
    height = 32;
    offset = 7;

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
            break;
         case "ADD":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.sr]] + this.registers[this.regs[code.tr]];
            break;
        case "SLT":
            this.registers[this.regs[code.dr]] = this.registers[this.regs[code.sr]] < this.registers[this.regs[code.tr]] ? 1 : 0;
            break;
        case "BEQ":
            if ( this.registers[this.regs[code.tr]] ===  this.registers[this.regs[code.sr]]){
                this.line = this.assembler.textLine - code.im;
                this.assembler.textLine = this.assembler.textLine - code.im;
            }
            break;
        case "JUMP":
            this.line = code.im - 1;
            this.assembler.textLine = code.im - 1;
            break;
        case "JAL":
            this.line = code.im - 1;
            this.assembler.textLine = code.im - 1;
            this.registers[7] = code.line;
            break;
        case "JR":
            this.line = this.registers[7] ;
            this.assembler.textLine = this.registers[7] ;
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