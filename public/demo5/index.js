"use strict";
var scale = [1, 1]
var translation = [0, 0]
var blurR = 0
var sigma = 0
function main() {
  var image = new Image();
  image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg"; // MUST BE SAME DOMAIN!!!
  image.crossOrigin = '*';
  image.onload = function () {
    render(image);
  };

}


function calGaussParams (x) {
  let output = [0, 0];
  if (x == 0) {
    //0时不模糊
    output = [0, 0.1];
  } else if (x <= 0.5) {
    //x值小于0.5时,模糊半径为1,sigma为0.1到2,计算过程如下
    output = [1, 0.1 + x * 2 / 0.5]
  } else if (x <= 0.8) {
    //x值小于0.8时,模糊半径为2,sigma为0.5到4.5,计算过程如下
    output = [2, 0.5 + 4 / 0.3 * (x - 0.5)]
  } else {
    //x值小于等于1时,模糊半径为3,sigma为1到10,计算过程如下
    output = [3, 1 + 9 / 0.2 * (x - 0.8)]
  }
  return output
};
function render(image) {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, image.width, image.height);

  // provide texture coordinates for the rectangle.
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

    // Set up texture so we can render any size image and so we are
    // working with pixels.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    
    return texture;
  }
  webglLessonsUI.setupSlider("#x", {
    slide: updateScale(0),
    max: 100
  });
  function updateScale(index) {
    return function (event, ui) {
      translation[index] = ui.value;
       [blurR, sigma] = calGaussParams(ui.value/100)
       drawEffects()
    };
  }
  // Create a texture and put the image in it.
  var originalImageTexture = createAndSetupTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // create 2 textures and attach them to framebuffers.
  var textures = [];
  var framebuffers = [];
  for (var ii = 0; ii < 2; ++ii) {
    var texture = createAndSetupTexture(gl);
    textures.push(texture);

    // make the texture the same size as the image
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Create a framebuffer
    var fbo = gl.createFramebuffer();
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // Attach a texture to it.
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
  var kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
  var coreSizeLocation = gl.getUniformLocation(program, "coreSize");
  var widthLocation = gl.getUniformLocation(program, "width");
  var heightLocation = gl.getUniformLocation(program, "height");
  var kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");
  var flipYLocation = gl.getUniformLocation(program, "u_flipY");

  // Define several convolution kernels
  var kernels = {
    normal: [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0
    ],
    gaussianBlur: [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.045
    ],
    gaussianBlur2: [
      1, 2, 1,
      2, 4, 2,
      1, 2, 1
    ],
    gaussianBlur3: [
      0, 1, 0,
      1, 1, 1,
      0, 1, 0
    ],
    unsharpen: [
      -1, -1, -1,
      -1, 9, -1,
      -1, -1, -1
    ],
    sharpness: [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ],
    sharpen: [
      -1, -1, -1,
      -1, 16, -1,
      -1, -1, -1
    ],
    edgeDetect: [
      -0.125, -0.125, -0.125,
      -0.125, 1, -0.125,
      -0.125, -0.125, -0.125
    ],
    edgeDetect2: [
      -1, -1, -1,
      -1, 8, -1,
      -1, -1, -1
    ],
    edgeDetect3: [
      -5, 0, 0,
      0, 0, 0,
      0, 0, 5
    ],
    edgeDetect4: [
      -1, -1, -1,
      0, 0, 0,
      1, 1, 1
    ],
    edgeDetect5: [
      -1, -1, -1,
      2, 2, 2,
      -1, -1, -1
    ],
    edgeDetect6: [
      -5, -5, -5,
      -5, 39, -5,
      -5, -5, -5
    ],
    sobelHorizontal: [
      1, 2, 1,
      0, 0, 0,
      -1, -2, -1
    ],
    sobelVertical: [
      1, 0, -1,
      2, 0, -2,
      1, 0, -1
    ],
    previtHorizontal: [
      1, 1, 1,
      0, 0, 0,
      -1, -1, -1
    ],
    previtVertical: [
      1, 0, -1,
      1, 0, -1,
      1, 0, -1
    ],
    boxBlur: [
      0.111, 0.111, 0.111,
      0.111, 0.111, 0.111,
      0.111, 0.111, 0.111
    ],
    triangleBlur: [
      0.0625, 0.125, 0.0625,
      0.125, 0.25, 0.125,
      0.0625, 0.125, 0.0625
    ],
    emboss: [
      -2, -1, 0,
      -1, 1, 1,
      0, 1, 2
    ]
  };

  drawEffects();

  function computeKernelWeight(kernel) {
    var weight = kernel.reduce(function (prev, curr) {
      return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
  }

  function drawEffects() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset);

    // Turn on the texcoord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // bind the texcoord buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      texcoordLocation, size, type, normalize, stride, offset);

    // set the size of the image
    gl.uniform2f(textureSizeLocation, image.width, image.height);

    // start with the original image
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

    // don't y flip images while drawing to the textures
    gl.uniform1f(flipYLocation, 1);

    // loop through each effect we want to apply.


    // finally draw the result to the canvas.
    gl.uniform1f(flipYLocation, -1); // need to y flip for canvas
    setFramebuffer(null, gl.canvas.width, gl.canvas.height);
    drawWithKernel(setGaussMatrix(blurR, sigma));
  }

  function setFramebuffer(fbo, width, height) {
    // make this the framebuffer we are rendering to.
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // Tell the shader the resolution of the framebuffer.
    gl.uniform2f(resolutionLocation, width, height);

    // Tell webgl the viewport setting needed for framebuffer.
    gl.viewport(0, 0, width, height);
  }


  function drawWithKernel(gaussianBlur) {
    // set the kernel and it's weight
    gl.uniform1fv(kernelLocation, gaussianBlur);
    gl.uniform1iv(coreSizeLocation, blurR);
    gl.uniform1iv(widthLocation, gl.canvas.width);
    gl.uniform1iv(heightLocation, gl.canvas.height);
    
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(gaussianBlur));

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

function setGaussMatrix(blurRadius, sigma) {
  let g = 0;
  let tx = blurRadius * 2 + 1;
  let gaussianWeights = new Array(tx * tx);
  for (let x = -blurRadius; x <= blurRadius; x++) {
    for (let y = -blurRadius; y <= blurRadius; y++) {
      let s = x * x + y * y;
      let a =(1.0 / 2.0 * Math.PI * Math.pow(sigma, 2.0)) * Math.exp(-s / (2.0 * Math.pow(sigma, 2.0)));
      gaussianWeights[g] = a;
      g++;
    }
  }
  console.log(gaussianWeights);
  return gaussianWeights
}

  function setGaussBlur(imageData, options) {
    const {
      gaussBlurStrength,
      radius = (gaussBlurStrength / 100) || 5,
      sigma = radius / 3
    } = options
    const {
      data: pixels,
      width,
      height
    } = imageData

    const gaussMatrix = []
    let gaussSum = 0
    let r, g, b, a

    a = 1 / (Math.sqrt(2 * Math.PI) * sigma)
    b = -1 / (2 * sigma * sigma)
    // 生成高斯矩阵
    for (let i = 0, x = -radius; x <= radius; x++, i++) {
      g = a * Math.exp(b * x * x)
      gaussMatrix[i] = g
      gaussSum += g
    }
    // 归一化, 保证高斯矩阵的值在[0,1]之间
    for (let i = 0, len = gaussMatrix.length; i < len; i++) {
      gaussMatrix[i] /= gaussSum
    }
    // x 方向一维高斯运算
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        r = g = b = a = 0
        gaussSum = 0
        for (let j = -radius; j <= radius; j++) {
          const k = x + j
          if (k >= 0 && k < width) { // 确保 k 没超出 x 的范围
            // r,g,b,a 四个一组u
            const i = (y * width + k) * 4
            r += pixels[i] * gaussMatrix[j + radius]
            g += pixels[i + 1] * gaussMatrix[j + radius]
            b += pixels[i + 2] * gaussMatrix[j + radius]
            // a += pixels[i + 3] * gaussMatrix[j];
            gaussSum += gaussMatrix[j + radius]
          }
        }
        const i = (y * width + x) * 4
        // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
        // console.log(gaussSum)
        pixels[i] = r / gaussSum
        pixels[i + 1] = g / gaussSum
        pixels[i + 2] = b / gaussSum
        // pixels[i + 3] = a
      }
    }
    // y 方向一维高斯运算
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        r = g = b = a = 0
        gaussSum = 0
        for (let j = -radius; j <= radius; j++) {
          const k = y + j
          if (k >= 0 && k < height) { // 确保 k 没超出 y 的范围
            const i = (k * width + x) * 4
            r += pixels[i] * gaussMatrix[j + radius]
            g += pixels[i + 1] * gaussMatrix[j + radius]
            b += pixels[i + 2] * gaussMatrix[j + radius]
            // a += pixels[i + 3] * gaussMatrix[j];
            gaussSum += gaussMatrix[j + radius]
          }
        }
        const i = (y * width + x) * 4
        pixels[i] = r / gaussSum
        pixels[i + 1] = g / gaussSum
        pixels[i + 2] = b / gaussSum
      }
    }
    return imageData
  }

  // func CalFilter(imgData *common.JsImageData4, weight float64, calChannel int) {
  // 	var data = []float64{0,-1 * weight,0,
  // 		-1 * weight,4 * weight + 1,-1 * weight,
  // 		0,-1 * weight,0}
  // 	var kn = convolution.NewCKernel(&data, 1)
  // 	var cm = convolution.CKernel2CrossMatrix(kn)
  // 	//convolution.Cal(imgData, kn, calChannel)
  // 	cm.CalNew(imgData, calChannel)
  // }

  function func(radius) {
    let size = 2 * radius + 1;
    let matrix = new Array(size);
    let sigama = radius / 3;
    let sigamaDouble = 2 * sigama * sigama;
    let sqlPi = Math.sqrt(2 * Math.PI);
    let sigamaPi = sigama * sqlPi;
    let row = 0;
    let sum = 0;
    for (let i = -radius; i <= radius; i++) {
      let x = i * i;
      matrix[row] = Math.exp(-x / sigamaDouble) / sigamaPi;
      sum += matrix[row];
      row++;
    }
    //归一处理目的是让权重总值等于1。
    //否则的话，使用总值大于1的滤镜会让图像偏亮，小于1的滤镜会让图像偏暗。
    for (let i = 0; i < size; i++) {
      matrix[i] /= sum;
    }
    return matrix
  }