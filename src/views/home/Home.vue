<template>
  <div id="home">
    <nav-bar class="home-nav">
      <div slot="center">购物街</div>
    </nav-bar>

    <tab-control :titles="['流行' , '新款' , '精选']"
      @tabClick="tabClick"
      ref="tabControl1"
      class="tab-control"
      v-show="isTabFixed"/>

    <scroll class="content"
            ref="scroll"
            :probe-type="3"
            @scroll="contentScroll"
            :pull-up-load="true"
            @pullingUp="loadMore">

      <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"/>
      <recommend-view :recommends="recommends"/>
      <feature-view/>

      <tab-control :titles="['流行' , '新款' , '精选']"
      @tabClick="tabClick"
      ref="tabControl2"/>

      <goods-list :goods="showGoods"/>

    </scroll>
    <back-top @click.native="backClick" v-show="isShowBackTop"/>
  </div>
</template>

<script>
import NavBar from 'components/common/navbar/NavBar';
import HomeSwiper from 'views/home/childComps/HomeSwiper';
import RecommendView from 'views/home/childComps/RecommendView';
import FeatureView from 'views/home/childComps/FeatureView';
import TabControl from 'components/content/tabControl/TabControl';
import GoodsList from 'components/content/goods/GoodsList';
import Scroll from 'components/common/scroll/Scroll';
import BackTop from 'components/content/backTop/BackTop';
import {getHomeMultidata,getHomeGoods} from 'network/home';
import {debounce} from 'common/utils/utils.js';
import {TOP_DISTANCE, POP, NEW, SELL} from "common/const/const";
// import {backTopMixin} from "common/mixin/mixin";
export default {
  name: 'Home',
  components:{
    NavBar,
    HomeSwiper,
    RecommendView,
    FeatureView,
    TabControl,
    GoodsList,
    Scroll,
    BackTop
  },
  data() {
    return{
      banners: [],
      recommends: [],
      goods: {
        'pop' : {page: 0 , list: []},
        'new' : {page: 0 , list: []},
        'sell' : {page: 0 , list: []}
      },
      currentType:'pop',
      isShowBackTop: false,
      tabOffsetTop: 0,
      isTabFixed: false,
      saveY: 0
    }
  },
  computed: {
    showGoods() {
      return this.goods[this.currentType].list;
    }
  },
  created() {
    //1.请求多个数据
    this.getHomeMultidata();
    //2.请求商品数据
    this.getHomeGoods('pop');
    this.getHomeGoods('new');
    this.getHomeGoods('sell');
  },
  mounted() {
    //1.图片加载完成时的事件监听
    const refresh = debounce(this.$refs.scroll.refresh,200);
    //2.监听item中图片加载完成
    this.$bus.$on('itemImageLoad',() => {
      refresh();
    })
  },
  destroyed() {
    console.log('home destroyed');
  },
  activated() {
    this.$refs.scroll.scrollTo(0 , this.saveY , 0);
    this.$refs.scroll.refresh();
  },
  deactivated() {
    //1.保存Y值
    this.saveY = this.$refs.scroll.scroll.y;
    //2.取消全局事件监听

  },
  methods:{
    // 事件监听相关方法
    tabClick(index) {
      switch(index) {
        case 0:
        this.currentType = 'pop';
        break;
        case 1:
        this.currentType = 'new';
        break;
        case 2:
        this.currentType = 'sell';
        break;
      }
      this.$refs.tabControl1.currentIndex = index;
      this.$refs.tabControl2.currentIndex = index;
    },
    //点击返回顶部的监听事件
    backClick() {
    this.$refs.scroll.scrollTo(0 , 0 , 1000);
    },
    //backTop的显示与隐藏
    contentScroll(position) {
      //判断backTop是否显示
      this.isShowBackTop = (-position.y) > TOP_DISTANCE;
      //2.决定tabControl是否吸顶(position = fixed)
      this.isTabFixed = (-position.y) > this.tabOffsetTop;
    },
    //向上拉加载更多
    loadMore() {
    //是指获取当前页面类型的商品即为 pop
      this.getHomeGoods(this.currentType);
    },
    //获取tabControl的offsetTop
    //所有的组件都有一个属性$el：用于获取组件中的元素
    swiperImageLoad() {
      this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop;
    },
    // 网络请求相关方法
    getHomeMultidata() {
      getHomeMultidata().then(res => {
      //console.log(res);
      this.banners = res.data.banner.list;
      this.recommends = res.data.recommend.list;
    })
    },
    getHomeGoods(type) {
      const page = this.goods[type].page + 1;
      getHomeGoods(type,page).then(res => {
        this.goods[type].list.push(...res.data.list);
        this.goods[type].page += 1;
        //完成上拉加载更多
        this.$refs.scroll.finishPullUp();
      })
    }
  }
}
</script>

<style scoped>
  #home{
    /* padding-top: 44px; */
    height: 100vh;
  }
  .home-nav{
    background-color: var(--color-tint);
    color: white;
    /* 在使用浏览器原生滚动时，为了让导航不跟随一起滚动才会采用这种写法 */
    /* position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9; */
  }
  .tab-control {
    position: relative;
    z-index: 9;
  }
  .content{
    position: absolute;
    height: 100%;
    overflow: hidden;
    /* height: calc(100% - 93px); */
    /* margin-top: 44px; */
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;
  }
</style>
