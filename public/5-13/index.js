'use strict'

function main() {
  var image = new Image()
  image.src = '../4.png'
  image.onload = () => {
    render(image)
  }
}

function initShader() {
  var canvas = document.querySelector('#canvas')
  var gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }

  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"])

  aPositionHandle = gl.getAttribLocation(programId, "aPosition");
  uTextureSamplerHandle = gl.getUniformLocation(programId, "sTexture");
  aTextureCoordHandle = gl.getAttribLocation(programId, "aTexCoord");

  widthOfsetHandle = gl.getUniformLocation(programId, "widthOfset");
  heightOfsetHandle = gl.getUniformLocation(programId, "heightOfset");
  gaussianWeightsHandle = gl.getUniformLocation(programId, "gaussianWeights");
  blurRadiusHandle = gl.getUniformLocation(programId, "blurRadius");
}

function GLRenderer() {
  let vertexData = [
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0
  ]


  let textureVertexData = [
    1.0, 0.0,
    0.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
  ]
  vertexBuffer =  new ArrayBuffer(vertexData.length * 4)

  textureVertexBuffer =  new ArrayBuffer(textureVertexData.length * 4)
}

function render(image) {
  initShader()
  var positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  setRectangle(gl, 0, 0, image.width, image.height);
  //给矩形提供纹理坐标
  var texcoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
  ]), gl.STATIC_DRAW)
  // 创建纹理
  var texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // 设置参数，让我们可以绘制任何尺寸的图像
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  // 将图像上传到纹理
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

  var resolutionLocation = gl.getUniformLocation(program, "u_resolution")
  webglUtils.resizeCanvasToDisplaySize(gl.canvas)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.useProgram(program)

  GLES20.uniform1i(uTextureSamplerHandle, 0);
  gl.enableVertexAttribArray(aPositionHandle)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)


  var size = 2; // 2 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 12; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    aTextureCoordHandle, size, type, normalize, stride, textureVertexBuffer);

  // Turn on the texcoord attribute
  gl.enableVertexAttribArray(aTextureCoordHandle);
  gl.vertexAttribPointer(aTextureCoordHandle, 2, GLES20.GL_FLOAT, false, 8, textureVertexBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);


  var size = 2; // 2 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    texcoordLocation, size, type, normalize, stride, offset);

  // set the resolution
  gl.uniform1f(widthOfsetHandle, 1.0/gl.canvas.width);
  // 设置图像的大小
  gl.uniform1f(heightOfsetHandle, 1.0/image.height);
  gl.uniform1i(blurRadiusHandle, blurRadius);
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
}
main()