'use strict'

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // 创建一个program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");

  // 创建一个positionBuffer
  var positionBuffer = gl.createBuffer();

  // 把数据绑定在ARRAY_BUFFER
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var translation = [0, 0];
  var width = 100;
  var height = 30;
  var color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();

  // Setup a ui.
  webglLessonsUI.setupSlider("#x", {
    slide: updatePosition(0),
    max: gl.canvas.width
  });
  webglLessonsUI.setupSlider("#y", {
    slide: updatePosition(1),
    max: gl.canvas.height
  });

  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  // 绘制场景
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // 告诉WebGL如何从裁剪空间对应到像素
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 清空画布
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 使用我们的程序
    gl.useProgram(program);

    // 启用属性
    gl.enableVertexAttribArray(positionLocation);

    // 绑定位置缓冲
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 设置矩形参数
    setRectangle(gl, translation[0], translation[1], width, height);

    // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
    var size = 2; // 每次迭代运行提取两个单位数据
    var type = gl.FLOAT; // 每个单位的数据类型是32位浮点型
    var normalize = false; // 不需要归一化数据
    var stride = 0; // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
    var offset = 0; // 从缓冲起始位置开始读取
    gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset)

    // 设置分辨率
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // 设置颜色
    gl.uniform4fv(colorLocation, color);

    // 绘制矩形
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}


function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
    ]),
    gl.STATIC_DRAW);
}
main()