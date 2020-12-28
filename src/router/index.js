import Vue from 'vue';
import VueRouter from 'vue-router';
const Home = () => import('../views/home/Home.vue');
const Category = () => import('../views/category/Category.vue');
const Shopcart = () => import('../views/shopcart/Shopcart.vue');
const Profile = () => import('../views/profile/Profile.vue');
const Detail = () => import('../views/detail/Detail.vue');
// const originalPush = Router.prototype.push;
//    Router.prototype.push = function push(location) {
//    return originalPush.call(this, location).catch(err => err)
// }

//1.安装插件
Vue.use(VueRouter);

const routes = [
  {
    path: '',
    redirect: '/home'
  },
  {
    path: '/home',
    component: Home
  },
  {
    path: '/category',
    component: Category
  },
  {
    path: '/shopcart',
    component: Shopcart
  },
  {
    path: '/profile',
    component: Profile
  },
  {
    path: '/detail/:iid',
    component: Detail
  }
];
//2.创建router
const router = new VueRouter({
  routes,
  mode: 'history'
})

//3.导出router
export default router;
