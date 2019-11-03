const child_process = require('child_process');
const os = require('os');

// This handles the windowState of a single notebook document.
export class Kernel {

  constructor(state) {
    this.state = state
    //this.nodePath = "/Users/korsimoro/.nvm/versions/node/v8.1.1/bin/node"
    //this.nodePath = "/tmp/wrapper"
    this.nodePath = "node"
    this.proc = undefined
    this.outputKey = undefined

    // https://dzone.com/articles/understanding-execfile-spawn-exec-and-fork-in-node
    const options = {}
    const child = child_process.spawn(this.nodePath,['-i'],options)
    //const child = child_process.fork('./test.js',{silent:true})
    console.log("FORKED:",child)

    child.stdin._writableState.highWaterMark = 0
    child.stdout._readableState.highWaterMark = 1
    child.stderr._readableState.highWaterMark = 1

    this.proc = child

    const kernel=this
    child.stdout.on('data', (data) => {
      console.log("KERNEL.js GOT DATA", String(data, 'UTF-8'));
      if(kernel.outputKey)
        kernel.state.receiveTextOutput(data,kernel.outputKey)
      else
        kernel.state.receiveUnsolicitedTextOutput(data)
    });

    child.stdout.on('close', () => {
      console.log("CLOSE")
    })
    child.stdout.on('end', () => {
      console.log("END")
    })
    child.stdout.on('error', () => {
      console.log("ERROR")
    })

    child.stderr.on('data', (data) => {
      console.log("ERROR")
      if(kernel.outputKey)
        kernel.state.receiveTextError(data,kernel.outputKey)
      else
        kernel.state.receiveUnsolicitedTextError(data)
    });

    // not sure if we want to handle this differently
    child.on('exit', (code,signal) => {
      kernel.state.reportKernelDeath()
    });

    child.on('close', (code,signal) => {
      kernel.state.reportKernelDeath()
    });

    // TODO - what to do?
    child.on('error', (error) => {
      console.log("FAILED TO START",error)
    });

  }


  run(key,code) {
    //const escapedCode = code.
      //replace(/"/g, '\\"')
      //replace(/\n/g,'\\\\n')

    const escapedCode = code;
    console.log("eval(\""+escapedCode+"\")")

    if (code[code.length - 1] != os.EOL)
      code = code + os.EOL;

    this.proc.stdin.cork()
    const result = this.proc.stdin.write(code);
    this.proc.stdin.uncork()
    console.log("RUN CODE")
    this.outputKey = key
  }

  quit() {
    this.proc.kill()
  }

}
