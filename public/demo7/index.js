'use strict'

function main() {
  var canvas = document.querySelector('#canvas')
  var gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);
  gl.useProgram(program)

  var positionLocation = gl.getAttribLocation(program, 'a_position')

  var resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  var colorLocation = gl.getUniformLocation(program, 'u_color')
  var translationLocation = gl.getUniformLocation(program, 'u_translation')
  var rotationLocation = gl.getUniformLocation(program, "u_rotation")
  var scaleLocation = gl.getUniformLocation(program, "u_scale")

  var positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  setGeometry(gl)

  var translation = [0, 0]
  var rotation = [0, 1]
  var scale = [1, 1]
  var color = [Math.random(), Math.random(), Math.random(), 1]

  drawScene()
  // Setup a ui.
  webglLessonsUI.setupSlider("#x", {
    slide: updatePosition(0),
    max: gl.canvas.width
  });
  webglLessonsUI.setupSlider("#y", {
    slide: updatePosition(1),
    max: gl.canvas.height
  })
  $("#rotation").gmanUnitCircle({
    width: 200,
    height: 200,
    value: 0,
    slide: function(e,u) {
      rotation[0] = u.x;
      rotation[1] = u.y;
      drawScene();
    }
  })
  webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2})
  webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2})

  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }
  function updateScale(index) {
    return function(event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }


  function drawScene(){
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0,0,gl.canvas.width,gl.canvas.height)

    gl.clear(gl.COLOR_BUFFER_BT)

    gl.enableVertexAttribArray(positionLocation)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)


    var size = 2
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset
    )

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)

    gl.uniform4fv(colorLocation, color) //设置颜色
    gl.uniform2fv(translationLocation, translation) //设置平移
    gl.uniform2fv(rotationLocation, rotation) //设置旋转
    gl.uniform2fv(scaleLocation, scale) //设置缩放

    var primitiveType = gl.TRIANGLES
    var offset = 0
    var count = 18
    gl.drawArrays(primitiveType, offset, count)
  }
}
function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // left column
          0, 0,
          30, 0,
          0, 150,
          0, 150,
          30, 0,
          30, 150,

          // top rung
          30, 0,
          100, 0,
          30, 30,
          30, 30,
          100, 0,
          100, 30,

          // middle rung
          30, 60,
          67, 60,
          30, 90,
          30, 90,
          67, 60,
          67, 90,
      ]),
      gl.STATIC_DRAW);
}
main()