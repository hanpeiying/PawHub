import Vue from 'vue';
import Router from 'vue-router';
import EateriesPage from '../components/EateriesPage.vue';
import EventsPage from '../components/EventsPage.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/eateries',
      name: 'EateriesPage',
      component: EateriesPage
    },
    {
      path: '/events',
      name: 'EventsPage',
      component: EventsPage
    }
  ]
});
