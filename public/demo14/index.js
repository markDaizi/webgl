function main() {
  var canvas = document.querySelector('#canvas')
  canvas.style.width = '1280px'
  canvas.style.height = '720px'
  var gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);
  gl.useProgram(program)

  const vertices = new Float32Array([
    -1.0, 1.0, -1.0, 0.0, 1.0,
    -1.0, -1.0, -1.0, 0.0, 0.0,
    1.0, 1.0, -1.0, 1.0, 1.0,
    1.0, -1.0, -1.0, 1.0, 0.0
  ]);

  const FSIZE = vertices.BYTES_PER_ELEMENT;
  const vertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(program, 'a_Position');
  const a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * FSIZE, 0);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 5 * FSIZE, 3 * FSIZE);

  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_TexCoord);
  const colorTexture = gl.createTexture();
  const u_ColorSampler = gl.getUniformLocation(program, 'u_ColorSampler');
  const imageWidth = gl.getUniformLocation(program, 'imageWidth');
  const imageHeight = gl.getUniformLocation(program, 'imageHeight');
  const focal = gl.getUniformLocation(program, 'focal');
  gl.clearColor(1.0, 1.0, 1.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw(0);

  function draw(focalNum = 417.0) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);



    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, colorTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.uniform1i(u_ColorSampler, 0);
    gl.uniform1f(imageWidth, image.width);
    gl.uniform1f(imageHeight, image.height);
    gl.uniform1f(focal, focalNum);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  webglLessonsUI.setupSlider("#x", {
    slide: debounce(updateBlur(),200,false),
    max: 100
  });

  function updateBlur() {
    return function (event, ui) {
      gl.uniform1f(focal, parseFloat(ui.value));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }


  function debounce(fn, delay, immediate) {
    let timer
    let result
    return function(...args) {
      if (timer) clearTimeout(timer)
      if (immediate) {
        if (timer) {
          timer = setTimeout(() => timer = null, delay)
        } else {
          result = fn.apply(this, args)
          return result
        }
      } else {
        timer = setTimeout(() => fn.apply(this, args), delay)
      }
    }
  }
  
}


var image = new Image();
image.src = "./1.png"; // MUST BE SAME DOMAIN!!!
image.crossOrigin = '*';
image.onload = function () {
  main()
};