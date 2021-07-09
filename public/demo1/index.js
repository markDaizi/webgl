'use strict'
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
function createProgram(gl, vertexShader, fragmentShader){
  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  // 两个着色器 link（链接）到一个 program（着色程序）
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if(success){
    return program
  }
  gl.deleteProgram(program)
}
function main(){
  var canvas = document.querySelector('#c')
  var gl = canvas.getContext('webgl')
  if(!gl){
    return
  }
  var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
  //创建定点着色器和片着色器
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader)
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  //  创建一个缓冲
  var positionBuffer = gl.createBuffer()
  // 将绑定点绑定到缓冲数据（positionBuffer）
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer)
  
  var positions = [
    10, 20,
    80, 20,
    10, 30,
    10, 30,
    80, 20,
    80, 30,
  ];
  //通过绑定点向缓冲中存放数据
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // 清空画布
  gl.clearColor(0,0,0,0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 告诉它用我们之前写好的着色程序（一个着色器对）
  gl.useProgram(program)
  //启用对应属性
  gl.enableVertexAttribArray(positionAttributeLocation)

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  
  // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
  var size = 2          // 每次迭代运行提取两个单位数据
  var type = gl.FLOAT   // 每个单位的数据类型是32位浮点型
  var normalize = false // 不需要归一化数据
  var stride = 0        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
                        // 每次迭代运行运动多少内存到下一个数据开始点
  var offset = 0        //从缓冲起始位置开始读
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  
       // draw
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}
main()

function minWindow(s,t){
  let need={},window={}
  for(let c of t){
    if (!need[c]) {
      need[c] = 1;
    } else {
      need[c]++;
    }
  }
  let left=0,right=0
  let valid = 0
  let start=0,len = s.length+1
  while(right<s.length){
    let c = s[right]
    right++
    
    if(check(need,c)){
       if (!window[c]) {
            window[c] = 1;
        } else {
            window[c]++;
        }
      if(window[c]===need[c]){
        valid++
      }
    }

    //判断左侧窗口是否要收缩
    while(valid===Object.keys(need).length){
      //更新最小覆盖子串
      if(right-left < len){
        start = left
        len = right -left
      }
      let d = s[left]
      left++
      if(check(need,d)){
        if(window[d]===need[d]){
          valid--
        }
        window[d]--
      }
    }
  }
  return len === s.length+1 ?
    "":s.substr(start, len)
}
function check(obj,str){
  return !!obj[str]
}
console.log(minWindow("ADOBECODEBANC","ABC"))