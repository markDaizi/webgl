"use strict";
// 创建着色器方法，输入参数：渲染上下文，着色器类型，数据源
function createShader(gl, type, source){
  var shader = gl.createShader(type) // 创建着色器对象
  gl.shaderSource(shader, source) // 提供数据源
  gl.compileShader(shader) // 编译 -> 生成着色器
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if(success){
    return shader
  }
  gl.deleteShader(shader)
}

function createProgram(gl, vertexShader, framentShader){
  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, framentShader)
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if(success){
    return program
  }

  gl.deleteProgram(program)
}
function main(){
  var canvas = document.querySelector('#canvas')
  var gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }
  var vertexShaderSource = document.querySelector('#vertex-shader-2d').text
  var fragmentShaderSource = document.querySelector('#fragment-shader-2d').text

  var vertexShader = createShader(gl,gl.VERTEX_SHADER,vertexShaderSource)
  var fragmentShader = createShader(gl,gl.FRAGMENT_SHADER, fragmentShaderSource)
  var program = createProgram(gl, vertexShader, fragmentShader)

  var positionAttributeLocation = gl.getAttribLocation(program,'a_postion')

  
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  var positions = [
    0, 0,
    0, 0.5,
    0.7, 0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 3;
  gl.drawArrays(primitiveType, offset, count); 
}

main();