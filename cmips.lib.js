function cMips (type) {

    this.opCode = { "ADD"   : "0000",
                    "SUB"   : "0000",
                    "ADDU"  : "0000",
                    "SUBU"  : "0000",
                    "AND"   : "0000",
                    "OR"    : "0000",
                    "NOR"   : "0000",
                    "XOR"   : "0000",
                    "SLL"   : "0001",
                    "SRL"   : "0001",
                    "SRA"   : "0001",
                    "SLLR"  : "0001",
                    "SRLR"  : "0001",
                    "SLT"   : "0001",
                    "SLTU"  : "0001",
                    "JR"    : "0001",
                    "MULT"  : "0010",
                    "MULTU" : "0010",
                    "DIV"   : "0010",
                    "DIVU"  : "0010",
                    "MFHI"  : "0010",
                    "MFLO"  : "0010",
                    "ADDI"  : "0100",
                    "ADDIU" : "0101",
                    "SUBIU" : "0110",
                    "SLTI"  : "0111",
                    "SLTIU" : "1000",
                    "LHW"   : "1001",
                    "SHW"   : "1010",
                    "JUMP"  : "1011",
                    "JAL"   : "1100",
                    "BEQ"   : "1101",
                    "BNE"   : "1110",
                    "SYS"   : "1111" }
    this.hex =     {"0000"  : "0",
                    "0001"  : "1",
                    "0010"  : "2",
                    "0011"  : "3",
                    "0100"  : "4",
                    "0101"  : "5",
                    "0110"  : "6",
                    "0111"  : "7",
                    "1000"  : "8",
                    "1001"  : "9",
                    "1010"  : "A",
                    "1011"  : "B",
                    "1100"  : "C",
                    "1101"  : "D",
                    "1110"  : "E",
                    "1111"  : "F"}
    this.registers = {  "$0"  : '000',
                        "$z"  : '000',
                        "$1"  : '001',
                        "$2"  : '010',
                        "$3"  : '011',
                        "$4"  : '100',
                        "$5"  : '101',
                        "$6"  : '110',
                        "$7"  : '111',
                        "$V"  : '101',
                        "$SP" : '110',
                        "$RA" : '111',
                      };
    this.functionCode = { "ADD"   : "000",
                          "SUB"   : "001",
                          "ADDU"  : "010",
                          "SUBU"  : "011",
                          "AND"   : "100",
                          "OR"    : "101",
                          "NOR"   : "110",
                          "XOR"   : "111",
                          "SLL"   : "000",
                          "SRL"   : "001",
                          "SRA"   : "010",
                          "SLLR"  : "011",
                          "SRLR"  : "100",
                          "SLT"   : "101",
                          "SLTU"  : "110",
                          "JR"    : "111",
                          "MULT"  : "000",
                          "MULTU" : "001",
                          "DIV"   : "010",
                          "DIVU"  : "011",
                          "MFHI"  : "100",
                          "MFLO"  : "101"}

    this.code = "";
    this.keywordsR = /^(ADDU?|SUBU?|AND|X?N?OR|S(L|R)LR?|SRA|SLTU?|JR|MULTU?|DIVU?|MF(HI|LO))\b/i;
    this.keywordsI = /^(ADDIU?|SUBIU|SLTIU?|(L|S)HW|B(EQ|NE)|SYS)\b/i;
    this.keywordsJ = /^J(AL|UMP)?\b/i;
    this.variables = /^(\$[0-8]|\$ra|\$sp)\b/i;
    this.numbers = /^(0x[\da-f]+|0[0-7]|0b[01]+|-?\d+)\b/i;
    this.labels = {};
    this.textlabels = {};
    this.context = 0;
    this.machineCode = [];
    this.line = 0;
    this.textLine = 0;
    this.error = false;

    this.parse = function(e){

      //reset vars
      this.machineCode = [];
      this.line = 0;
      this.textLine = 0;
      this.labels = {};
      this.textlabels = {};
      this.error = false;


      var rawCode = this.editor.getValue();
      this.code = rawCode.split(/\r?\n/);
      var length =  this.code.length ;
      try {
        
        for (var i = 0; i < length; i++) {
          this.textLine++;
          this.parseLabels(this.code[i]);
        }

        this.textLine = 0;
        this.line = 0;
        for (var i = 0; i < length; i++) {

          this.textLine++;
          this.parseLine(this.code[i]);
        }
      }catch(e){
        alert(e);
        this.error = true;
        return {"bin":"","hex":""};
      }
      console.log(this.machineCode);

      var binary = this.machineCode.join("\n");
      var hex = this.binaryToHex(this.machineCode);


      return {"bin":binary, "hex":hex};

    }

    this.binaryToHex = function(arr){
      var hex = "";
      var length =  arr.length ;
      for (var i = 0; i < length; i++) {
        for(var x = 0; x < 4; x++){
         hex += this.hex[arr[i].slice(0+x*4, 4+x*4)];
        }

        if(i<length-1) hex += "\n";
      
      }
      return hex;
    }

    this.parseLabels = function(line){

      line = line.replace(/^\s+/, "");

      //tag
      if(match = /^\S+\:/.exec(line)){
        match = match[0];
        match = match.replace(/:/, "");
        match = match.toUpperCase();
        this.labels[match] = this.line;
        this.textlabels[match] = this.textLine;
        return true;
      }

      //comment
      if(match = /^(#|\/\/)/.exec(line)){
        return true;
      }

      if(line.length == 0)
      {
        return true;
      }

     this.line++;
     return true;

    }

    this.parseLine = function(line, simulator){


      this.context = 0;

      line = line.replace(/^\s+/, "");
      var match = "";
      var machineCode = {};
      var operation = "";

      //tag I don't erase the labels
      if(match = /^\S+\:/.exec(line)){
        //match = match[0];
        //match = match.replace(/:/, "");
        //match = match.toUpperCase();
        //this.labels[match] = this.line;
        return true;
      }


      //comment
      if(match = /^(#|\/\/)/.exec(line)){
        return true;
      }

      if(line.length == 0)
      {
        return true;
      }

    
      match = "";
      if(match = this.keywordsR.exec(line)){
        match = match[0];
        this.context = 1;
        operation = match.toUpperCase();
        line = line.replace(this.keywordsR, "");
        machineCode.opCode = this.opCode[operation];
        machineCode.functionCode = this.functionCode[operation];

      }else if(match = this.keywordsI.exec(line)){
        match = match[0];
        this.context = 2;
        operation = match.toUpperCase();
        line = line.replace(this.keywordsI, "");
        machineCode.opCode = this.opCode[operation]; 

      }else if(match = this.keywordsJ.exec(line)){
        match = match[0];
        this.context = 3;
        operation = match.toUpperCase();
        line = line.replace(this.keywordsJ, "");
        machineCode.opCode = this.opCode[operation]; 

      }else{
          throw "Operation not recognized " + "| Line #" +this.textLine;
      }



      /**
        Vars
      **/
      line = line.replace(/^\s+/, "");

      //add $d, $s, $t
      //std
      if(this.context == 1){
        //varD
        if(match = this.variables.exec(line)){
          match = match[0];
          match = match.toUpperCase();
          line = line.replace(this.variables, "");
          machineCode.regD = this.registers[match]; 
        }else{
          throw "Reg Destination not recognized" + "| Line #" +this.textLine;
        }

        line = line.replace(/^(\s+|\s*,\s*)/, "");

        if(/JR?/.test(operation) === true)
        {
          machineCode.regS =  machineCode.regD;
          machineCode.regD = "000";
          machineCode.regT = "000";

        }else{

          //varS
          if(match = this.variables.exec(line)){
            match = match[0];
            match = match.toUpperCase();
            line = line.replace(this.variables, "");
            machineCode.regS = this.registers[match]; 
          }else{
            throw "Reg Source not recognized" + "| Line #" +this.textLine;
          }

          line = line.replace(/^(\s+|\s*,\s*)/, "");


          if(/MULTU?|DIVU?/.test(operation) === true)
          {
            machineCode.regT = "000";
          }else{
            //varT
            if(match = this.variables.exec(line)){
              match = match[0];
              match = match.toUpperCase();
              line = line.replace(this.variables, "");
              machineCode.regT = this.registers[match]; 


            }else{

              throw "Reg Target not recognized" + "| Line #" +this.textLine;

            }

          }
        }
        this.machineCode.push([]);
        this.machineCode[this.line] = machineCode.opCode + machineCode.regS + machineCode.regT + machineCode.regD + machineCode.functionCode;

        if ( typeof simulator !== "undefined" ){
            simulator.code = {op: operation, sr: machineCode.regS, tr: machineCode.regT, dr: machineCode.regD};
        }

      //addi $t, $s, imm
      //sti
      }else if(this.context == 2){
        //varD
        if(match = this.variables.exec(line)){
          match = match[0];
          match = match.toUpperCase();
          line = line.replace(this.variables, "");
          machineCode.regT = this.registers[match]; 
        }else{
          throw "Reg Target not recognized" + "| Line #" +this.textLine;
        }

        line = line.replace(/^(\s+|\s*,\s*)/, "");

        //varS
        if(match = this.variables.exec(line)){
          match = match[0];
          match = match.toUpperCase();
          line = line.replace(this.variables, "");
          machineCode.regS = this.registers[match]; 
        }else{
          throw "Reg Source not recognized" + "| Line #" +this.textLine;
        }

        line = line.replace(/^(\s+|\s*,\s*)/, "");

        //varImm
        if(match = this.numbers.exec(line)){
          match = match[0];
          line = line.replace(this.numbers, "");
          match = parseInt(match);
          immediate = match;
          machineCode.regI = this.intToBinary(match, 6); 

           if(machineCode.regI === null){
            throw "IMMEDIATE number is bigger then 63 bin " + "| Line #" +this.textLine;
          }

        }else{

            throw "IMMEDIATE not found " + "| Line #" +this.textLine;

          }
        this.machineCode.push([]);
        this.machineCode[this.line] = machineCode.opCode + machineCode.regS + machineCode.regT + machineCode.regI;

        if ( typeof simulator !== "undefined" ){
          simulator.code = {op: operation, sr: machineCode.regS, tr: machineCode.regT, im: immediate};
        }

      //j target
      }else if(this.context == 3){

        if(match = /^\S+/.exec(line)){
          match = match[0];
          match = match.toUpperCase();
          machineCode.jump = this.labels[match];
          machineCode.textjump = this.textlabels[match];

          machineCode.regJ = this.intToBinary(machineCode.jump, 12); 

          if(machineCode.regJ === null){
            throw "JUMP number is bigger then 4095 bin " + "| Line #" +this.textLine;
          }

        }else{

          throw "label not found " + "| Line #" +this.textLine;
        }
        this.machineCode.push([]);
        this.machineCode[this.line] = machineCode.opCode + machineCode.regJ;

        if ( typeof simulator !== "undefined" ){
            simulator.code = {op:operation, im:machineCode.textjump, line:this.textLine};
        }
      }



     this.line++;
     return true;
    }


    this.intToBinary = function(n, max){
      var bin = "";
      bin = n.toString(2);

      while(bin.length < max){
        bin = "0"+bin;
      }

      if(bin.length > max){
        return null;
      }
      return bin;

    }

  }