<template>
  <div class="transitions"></div>
</template>

<script>
// import GLTransitions from 'gl-transitions'
// import createREGLTransition from 'regl-transition'
// import * as createREGL from 'regl'

export default {
  mounted() {
    const GLTransitions = require('gl-transitions');
    const createREGL = require('regl');
    const createREGLTransition = require('regl-transition');

    const delay = 1;
    const duration = 1.5;
    const imgSrcs = ['/1.jpg', '/2.jpg', '/3.jpg'];

    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.onabort = reject;
        img.src = src;
        img.width = 500;
      });

    const regl = createREGL();
    const transitions = GLTransitions.map((t) => createREGLTransition(regl, t));
    console.log(transitions);
    Promise.all(imgSrcs.map(loadImage)).then((imgs) => {
      const slides = imgs.map((img) => regl.texture(img));
      regl.frame(({ time }) => {
        const index = Math.floor(time / (delay + duration));
        const from = slides[index % slides.length];
        const to = slides[(index + 1) % slides.length];
        const transition = transitions[25];
        const total = delay + duration;
        const progress = Math.max(0, (time - index * total - delay) / duration);
        transition({ progress, from, to });
      });
    });
  },
};
</script>

<style></style>
