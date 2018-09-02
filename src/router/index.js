import Vue from 'vue'
import Router from 'vue-router'
import Vesting from '@/components/Vesting'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Vesting',
      component: Vesting
    }
  ]
})
