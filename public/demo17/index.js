const vshader = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  
  uniform vec2 u_resolution;
  uniform float u_flipY;
  
  varying vec2 v_texCoord;
  
  void main() {
      vec2 zeroToOne = a_position / u_resolution;
  
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;
  
      gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);
      v_texCoord = a_texCoord;
  }`
const fshader = `
precision mediump float;
    
    // our texture
    uniform sampler2D u_image;
    uniform vec2 u_textureSize;
    uniform float u_kernel[9];
    uniform float u_kernelWeight;
    
    varying vec2 v_texCoord;
    
    void main() {
       vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
       vec4 colorSum =
           texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
           texture2D(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
           texture2D(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
           texture2D(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
           texture2D(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
           texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
           texture2D(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
           texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
           texture2D(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;
       gl_FragColor = vec4((colorSum / u_kernelWeight).rgb, 1);
    }
    `
var kernels = [
  0, 0, 0,
  0, 1, 0,
  0, 0, 0
]

function main() {
  var image = new Image();
  image.crossOrigin = '*'
  image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
  image.onload = function () {
    render(image);
  };
}

const loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (shader === null) {
    console.log('unable to create shader');
    return;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  let complied = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!complied) {
    let error = gl.getShaderInfoLog(shader);
    console.log(error);
    return null;
  }
  return shader;
}

function render(image) {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  // canvas.style.width = '1280px'
  // canvas.style.height = '720px'
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    throw Error('shader create error');
  }
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, image.width, image.height);

  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
  ]), gl.STATIC_DRAW);

  function createAndSetupTexture(gl) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 设置材质，这样我们可以对任意大小的图像进行像素操作
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  }

  // 创建一个纹理并写入图像
  var originalImageTexture = createAndSetupTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // create 2 textures and attach them to framebuffers.
  var textures = [];
  var framebuffers = [];
  for (var ii = 0; ii < 2; ++ii) {
    var texture = createAndSetupTexture(gl);
    textures.push(texture);

    // 设置纹理大小和图像大小一致
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null);

    // 创建一个帧缓冲
    var fbo = gl.createFramebuffer();
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // 绑定纹理到帧缓冲
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }

  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
  var kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
  var kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");
  var flipYLocation = gl.getUniformLocation(program, "u_flipY");

  drawEffects(kernels);
  webglLessonsUI.setupSlider("#x", {
    slide: updateBlur(),
    max: 100
  });

  function updateBlur() {
    return function (event, ui) {
      kernels = [
        0 * ui.value / 100, -1 * ui.value / 100, 0 * ui.value / 100,
        -1 * ui.value / 100, 4 * ui.value / 100 + 1, -1 * ui.value / 100,
        0 * ui.value / 100, -1 * ui.value / 100, 0 * ui.value / 100
      ]
      console.log(kernels);
      drawEffects()
    };
  }

  function computeKernelWeight(kernel) {
    var weight = kernel.reduce(function (prev, curr) {
      return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
  }

  function drawEffects() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(texcoordLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);


    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
      texcoordLocation, size, type, normalize, stride, offset);
    gl.uniform2f(textureSizeLocation, image.width, image.height);

    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);
    gl.uniform1f(flipYLocation, 1);

    // 最后将结果绘制到画布
    gl.uniform1f(flipYLocation, -1); // 需要绕y轴翻转
    setFramebuffer(null, gl.canvas.width, gl.canvas.height);
    drawWithKernel();
  }

  function setFramebuffer(fbo, width, height) {
    // 设定当前使用帧缓冲
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    //告诉着色器分辨率
    gl.uniform2f(resolutionLocation, width, height);

    gl.viewport(0, 0, width, height);
  }


  function drawWithKernel() {
    // 设置卷积和权重
    gl.uniform1fv(kernelLocation, kernels);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels));

    // Draw the rectangle.
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
}

main();