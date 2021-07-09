<template>
  <canvas class="webgl"></canvas>
</template>

<script>
export default {
  mounted() {
    const vsSource = `
    attribute vec3 aVertexPosition;
      attribute vec4 aVertexColor;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      varying lowp vec4 vColor;

      void main(void) {
        gl_Position = uProjectionMatrix* uModelViewMatrix * vec4(aVertexPosition, 1.0);
        vColor = aVertexColor;
      }
  `;
    const fsSource = `
    varying lowp vec4 vColor;

      void main(void) {
        gl_FragColor = vColor;
      }
  `;
    const canvas = document.querySelector('.webgl');
    const gl = canvas.getContext('webgl');
    const shaderProgram = this.initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(
          shaderProgram,
          'vertexColorAttribute'
        ),
        modelViewMatrix: gl.getUniformLocation(
          shaderProgram,
          'uModelViewMatrix'
        ),
      },
    };
    const buffers = this.initBuffers(gl);

    // Draw the scene
    this.drawScene(gl, programInfo, buffers);
  },
  methods: {
    initShaderProgram(gl, vsSource, fsSource) {
      const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

      // 创建着色器程序

      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      // 创建失败， alert
      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
          'Unable to initialize the shader program: ' +
            gl.getProgramInfoLog(shaderProgram)
        );
        return null;
      }

      return shaderProgram;
    },
    loadShader(gl, type, source) {
      const shader = gl.createShader(type);

      // Send the source to the shader object

      gl.shaderSource(shader, source);

      // Compile the shader program

      gl.compileShader(shader);

      // See if it compiled successfully

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(
          'An error occurred compiling the shaders: ' +
            gl.getShaderInfoLog(shader)
        );
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    },
    initBuffers(gl) {
      const positionBuffer = gl.createBuffer();
      const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
      gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        WebGLRenderingContext.ARRAY_BUFFER,
        new Float32Array(positions),
        WebGLRenderingContext.STATIC_DRAW
      );

      const colorBuffer = gl.createBuffer();
      const colors = [
        1.0,
        1.0,
        1.0,
        1.0, // 白
        1.0,
        0.0,
        0.0,
        1.0, // 红
        0.0,
        1.0,
        0.0,
        1.0, // 绿
        0.0,
        0.0,
        1.0,
        1.0, // 蓝
      ];

      gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(
        WebGLRenderingContext.ARRAY_BUFFER,
        new Float32Array(colors),
        WebGLRenderingContext.STATIC_DRAW
      );

      return {
        position: positionBuffer,
        color: colorBuffer,
      };
    },
    drawScene(gl, programInfo, buffers) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
      gl.clearDepth(1.0); // Clear everything
      gl.enable(gl.DEPTH_TEST); // Enable depth testing
      gl.depthFunc(gl.LEQUAL); // Near things obscure far things
      // eslint-disable-next-line no-undef
      const { mat4 } = glMatrix;
      // Clear the canvas before we start drawing on it.

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Create a perspective matrix, a special matrix that is
      // used to simulate the distortion of perspective in a camera.
      // Our field of view is 45 degrees, with a width/height
      // ratio that matches the display size of the canvas
      // and we only want to see objects between 0.1 units
      // and 100 units away from the camera.

      const fieldOfView = (45 * Math.PI) / 180; // in radians
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const zNear = 0.1;
      const zFar = 100.0;
      const projectionMatrix = mat4.create();

      // note: glmatrix.js always has the first argument
      // as the destination to receive the result.
      mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

      // Set the drawing position to the "identity" point, which is
      // the center of the scene.
      const modelViewMatrix = mat4.create();

      // Now move the drawing position a bit to where we want to
      // start drawing the square.

      mat4.translate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [-0.0, 0.0, -6.0]
      ); // amount to translate

      // Tell WebGL how to pull out the positions from the position
      // buffer into the vertexPosition attribute.
      {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      }

      // Tell WebGL to use our program when drawing

      gl.useProgram(programInfo.program);

      // Set the shader uniforms

      gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
      );
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
      );

      {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
      }
    },
  },
};
</script>

<style></style>
