import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/webglprinciple',
    name: 'webglprinciple',
    component: () => import('../views/webgl-principle.vue')
  },
  {
    path: '/threeOne',
    name: 'ThreeOne',
    component: () => import('../views/ThreeOne.vue')
  },
  {
    path: '/threeMouse',
    name: 'threeMouse',
    component: () => import('../views/ThreeMouse.vue')
  },
  {
    path: '/threeModel',
    name: 'threeModel',
    component: () => import('../views/ThreeModel.vue')
  },
  {
    path: '/GlTransitions',
    name: 'GlTransitions',
    component: () => import('../views/GlTransitions.vue')
  },
  {
    path: '/GlMove',
    name: 'GlMove',
    component: () => import('../views/GLMove.vue')
  },
  {
    path: '/GlImage',
    name: 'GlImage',
    component: () => import('../views/GlImage.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
