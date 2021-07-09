<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> | 
      <router-link to="/about">About</router-link> | 
      <router-link to="/webglprinciple">webglprinciple</router-link> | 
      <router-link to="/threeOne">ThreeOne</router-link> |
      <router-link to="/threeMouse">threeMouse</router-link>| 
      <router-link to="/threeModel">threeModel</router-link> | 
      <router-link to="/GlTransitions">GlTransitions</router-link> | 
      <router-link to="/GlMove">GlMove</router-link> | 
      <router-link to="/GlImage">GlImage</router-link>
      <!-- <div>
        <embed src="/1.pdf" type="application/pdf" width="1000px" height="1000px">
      </div>
      <a  href="https://view.xdocin.com/doc/preview.docx?_func=to&_format=html&_cache=1&_xdoc=1.xls" type="application/pdf" width="1000px" height="1000px">aaa</a> -->
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
