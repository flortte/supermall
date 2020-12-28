<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"/>
      <scroll
      class="content"
      :pull-up-load="true"
      ref="scroll"
      :probe-type="3"
      @scroll="contentScroll">
        <!-- 开头的轮播图 -->
        <detail-swiper :top-images="topImages"/>
        <!-- 标题、价格等介绍 -->
        <detail-base-info :goods="goods"/>
        <!-- 店铺信息 -->
        <detail-shop-info :shop="shop"/>
        <!-- 商品图片展示 -->
        <detail-goods-info :detail-info="detailInfo" @imageload="imageload"/>
        <!-- 参数：尺码厂名颜色等 -->
        <detail-param-info ref="params" :param-info="paramInfo"/>
        <!-- 评论 -->
        <detail-comment-info ref="comment" :comment-info="commentInfo"/>
        <!-- 商品推荐 -->
        <goods-list ref="recommend" :goods="recommends"/>
      </scroll>
    <back-top @click.native="backClick" v-show="isShowBackTop"/>
    <detail-bottom-bar @addToCart="addToCart"/>
  </div>
</template>

<script>
import DetailNavBar from './childComps/DetailNavBar';
import DetailSwiper from './childComps/DetailSwiper';
import DetailBaseInfo from './childComps/DetailBaseInfo';
import DetailShopInfo from './childComps/DetailShopInfo';
import DetailGoodsInfo from './childComps/DetailGoodsInfo';
import DetailParamInfo from './childComps/DetailParamInfo';
import DetailCommentInfo from './childComps/DetailCommentInfo.vue';
import Scroll from 'components/common/scroll/Scroll';
import GoodsList from 'components/content/goods/GoodsList';
import DetailBottomBar from './childComps/DetailBottomBar';
import BackTop from 'components/content/backTop/BackTop';
import {debounce} from 'common/utils/utils.js';
import {getDetail,Goods,Shop,GoodsParam,getRecommend} from 'network/detail.js';
import {TOP_DISTANCE} from "common/const/const";

	export default {
    name: "Detail",
    components: {
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      DetailBottomBar,
      Scroll,
      GoodsList,
      BackTop
      },
      data() {
        return {
          iid : null,
          topImages: [],
          goods: {},
          shop: {},
          detailInfo: {},
          paramInfo: {},
          commentInfo: {},
          recommends: [],
          themeTopYs:[],
          getThemeTopY: null,
          currentIndex: 0,
          isShowBackTop: false
        }
      },
      created() {
        //1.保存传入的iid
        this.iid = this.$route.params.iid;
        //2.根据iid请求详情数据
        getDetail(this.iid).then(res => {
          //console.log(res);
          //获取顶部图片轮播数据
          const data = res.result;
          this.topImages = data.itemInfo.topImages;
          //2.获取商品信息
          this.goods = new Goods(data.itemInfo,data.columns,data.shopInfo.services);
          //3.创建店铺信息的对象
          this.shop = new Shop(data.shopInfo);
          //4.保存商品的详情数据
          this.detailInfo = data.detailInfo;
          //5.获取参数的信息
          this.paramInfo = new GoodsParam(data.itemParams.info,data.itemParams.rule);
          //6.详情页数据的展示
          if(data.rate.cRate != 0) {
            this.commentInfo = data.rate.list[0];
          }
          //根据最新的数据，对应的DOM已经被渲染出来了
        //但是图片依然没有加载完(目前获取到的offsetTop不包含其中的图片)
        this.$nextTick(() => {
          this.themeTopYs = [];
          this.themeTopYs.push(0);
          this.themeTopYs.push(this.$refs.params.$el.offsetTop);
          this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
          this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
          console.log(this.themeTopYs);
          })
        }),
        //3.请求推荐数据
        getRecommend().then(res => {
          //console.log(res);
          this.recommends = res.data.list;
        }),
        //4.给getThemeTopY赋值(对给this.getThemeTopY赋值的操作进行防抖)
        this.getThemeTopY = debounce(() => {
          this.themeTopYs = [];
          this.themeTopYs.push(0);
          this.themeTopYs.push(this.$refs.params.$el.offsetTop);
          this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
          this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
          console.log(this.themeTopYs);
        },100)
      },
      // updated() {
      //   this.themeTopYs = [];
      //   this.themeTopYs.push(0);
      //   this.themeTopYs.push(this.$refs.params.$el.offsetTop);
      //   this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
      //   this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
      //   console.log(this.themeTopYs);
      // },
      methods: {
        imageload() {
          this.$refs.scroll.refresh();
          this.getThemeTopY();
        },
        titleClick(index) {
          this.$refs.scroll.scrollTo(0,-this.themeTopYs[index],300);
        },
        contentScroll(position) {
          //1.获取y值
          const positionY = -position.y;
          //2.position和主题中值进行对比
          //[0, 6919, 7553, 7863]
          //positionY在 0 和 6919 之间，index = 0
          //positionY在 6919 和 7553 之间，index = 1
          //positionY在 7553 和 7863 之间，index = 2
          //positionY超过 7863 值，index = 3
          let length = this.themeTopYs.length;
          for(let i = 0 ;i < length ; i++) {
            if(this.currentIndex !== i && ((i < length - 1 && positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i+1]) || (i === length - 1 && positionY >= this.themeTopYs[i]))) {
              this.currentIndex = i;
              this.$refs.nav.currentIndex = this.currentIndex;
            }
          }
        },
        backClick() {
          this.$refs.scroll.scrollTo(0 , 0 , 1000);
        },
         contentScroll(position) {
         //判断backTop是否显示
           this.isShowBackTop = (-position.y) > TOP_DISTANCE;
        },
        addToCart() {
          //1.获取购物车需要展示的信息
          const product = {};
          product.image = this.topImages[0];
          product.title = this.goodsInfo.title;
          product.desc = this.goodsInfo.desc;
          product.price = this.goodsInfo.realPrice;
          product.iid = this.iid;
          //2.将商品添加到购物车里
          this.$store.commit('addCart',product);
          
        }
    }
  }
</script>

<style scoped>
  #detail{
    position: relative;
    z-index: 1;
    background-color: #fff;
    height: 100vh;
  }
  .detail-nav{
    position: relative;
    z-index: 9;
    background-color: #fff;
  }
  .content{
    position: absolute;
    height: calc(100% - 44px);
  }
</style>
