const vshader = `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;

    varying vec2 v_TexCoord;

    void main(){
        gl_Position = a_Position;
        v_TexCoord = a_TexCoord;
    }

`;


const fshader = `
precision highp float;

uniform sampler2D u_ColorSampler;
uniform float imageWidth;
uniform float imageHeight;
uniform float focal;

varying vec2 v_TexCoord;

vec4 sharpLine(float focal, sampler2D sampler,float width,float height){
    vec4 sumVec4 = vec4(0.0);
    vec2 textureSize = vec2(width,height);
    vec2 onePixel = vec2(1.0, 1.0) /textureSize;
    float sum = 0.0;
    sumVec4 =
    texture2D(sampler, v_TexCoord + onePixel * vec2( 0, -1)) * (-1.0 * focal) +
    texture2D(sampler, v_TexCoord + onePixel * vec2(-1,  0)) * (-1.0 * focal) +
    texture2D(sampler, v_TexCoord + onePixel * vec2( 0,  0)) * (4.0 * focal + 1.0) +
    texture2D(sampler, v_TexCoord + onePixel * vec2( 1,  0)) * (-1.0 * focal) +
    texture2D(sampler, v_TexCoord + onePixel * vec2( 0,  1)) * (-1.0 * focal);
    sum = 4.0*(-1.0 * focal)+(4.0 * focal + 1.0);
    return vec4((sumVec4 / sum).rgb, 1);
}

void main(){

    gl_FragColor = sharpLine(float(focal), u_ColorSampler, imageWidth, imageHeight);

}
`;

const screenFshader = `
precision highp float;

uniform sampler2D u_ColorSampler;
uniform float imageWidth;
uniform float imageHeight;
uniform float focal;

varying vec2 v_TexCoord;

vec4 sharpLine(float focal, sampler2D sampler,float width,float height){
    vec4 sumVec4 = vec4(0.0);
    vec2 textureSize = vec2(width,height);
    vec2 onePixel = vec2(1.0, 1.0) /textureSize;
    float sum = 0.0;
    sumVec4 =
       texture2D(sampler, v_TexCoord + onePixel * vec2( 0, -1)) * (-1.0 * focal) +
       texture2D(sampler, v_TexCoord + onePixel * vec2(-1,  0)) * (-1.0 * focal) +
       texture2D(sampler, v_TexCoord + onePixel * vec2( 0,  0)) * (4.0 * focal + 1.0) +
       texture2D(sampler, v_TexCoord + onePixel * vec2( 1,  0)) * (-1.0 * focal) +
       texture2D(sampler, v_TexCoord + onePixel * vec2( 0,  1)) * (-1.0 * focal);
    sum = 4.0*(-1.0 * focal)+(4.0 * focal + 1.0);
    return vec4((sumVec4 / sum).rgb, 1);
}

void main(){

    gl_FragColor = sharpLine(float(focal), u_ColorSampler, imageWidth, imageHeight);

}
`;


const loadShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    if(shader === null){
        console.log('unable to create shader');
        return;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let complied = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(!complied){
        let error = gl.getShaderInfoLog(shader);
        console.log(error);
        return null;
    }
    return shader;
}


const canvas = document.querySelector('#canvas');
canvas.style.width = '1280px'
canvas.style.height = '720px'

const gl = context = canvas.getContext('webgl')
const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);

if(!vertexShader || !fragmentShader){
    throw Error('shader create error');
}
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

const vertices = new Float32Array([
    -1.0, 1.0, -1.0, 0.0, 1.0,
    -1.0, -1.0, -1.0, 0.0, 0.0,
    1.0, 1.0, -1.0, 1.0, 1.0,
    1.0, -1.0, -1.0, 1.0, 0.0
]);

const screenProgram = gl.createProgram();
const screenFragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, screenFshader);
gl.attachShader(screenProgram, vertexShader);
gl.attachShader(screenProgram, screenFragmentShader);



const createFrameBuffer = (gl) => {
    const framebuffer = gl.createFramebuffer();
    // 新建纹理对象作为帧缓冲区的颜色缓冲区对象
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, canvas.width, canvas.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // 新建渲染缓冲区对象作为帧缓冲区的深度缓冲区对象
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    // 检测帧缓冲区对象的配置状态是否成功
    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
       console.log('Frame buffer object is incomplete: ' + e.toString());
       return;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    return texture;
}

const drawToBuffer = (focalNum) => {

    gl.linkProgram(program);
    gl.useProgram(program);

    // 绑定framebuffer
    const frameTexture = createFrameBuffer(gl);

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

    gl.clearColor(1.0, 1.0, 1.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    const colorTexture = gl.createTexture();
    const u_ColorSampler = gl.getUniformLocation(program, 'u_ColorSampler');
    const imageWidth = gl.getUniformLocation(program, 'imageWidth');
    const imageHeight = gl.getUniformLocation(program, 'imageHeight');
    const focal = gl.getUniformLocation(program, 'focal');

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, colorTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(u_ColorSampler, 0);
    gl.uniform1f(imageWidth, image.width);
    gl.uniform1f(imageHeight, image.height);
    gl.uniform1f(focal, focalNum);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return frameTexture;
}

const drawToScreen = (colorTexture, focalNum) => {
    gl.linkProgram(screenProgram);
    gl.useProgram(screenProgram);

    const FSIZE = vertices.BYTES_PER_ELEMENT;

    const vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(screenProgram, 'a_Position');
    const a_TexCoord = gl.getAttribLocation(screenProgram, 'a_TexCoord');

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * FSIZE, 0);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 5 * FSIZE, 3 * FSIZE);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_TexCoord);

    const u_ColorSampler = gl.getUniformLocation(screenProgram, 'u_ColorSampler');
    const imageWidth = gl.getUniformLocation(screenProgram, 'imageWidth');
    const imageHeight = gl.getUniformLocation(screenProgram, 'imageHeight');
    const focal = gl.getUniformLocation(screenProgram, 'focal');

    gl.clearColor(1.0, 1.0, 1.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, colorTexture);

    gl.uniform1i(u_ColorSampler, 0);
    gl.uniform1f(imageWidth, image.width);
    gl.uniform1f(imageHeight, image.height);
    gl.uniform1f(focal, focalNum);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
var image = new Image();
image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
image.crossOrigin = '*';
image.onload = function () {
  changeCall(0)
};
function changeCall(value){
  const texture = drawToBuffer(value);
  drawToScreen(texture, value);
}
webglLessonsUI.setupSlider("#x", {
  slide: updateBlur(),
  max: 100
});

function updateBlur() {
  return function (event, ui) {
    changeCall(ui.value/100)
  };
}
