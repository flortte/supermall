<template>
    <div class="wrapper" ref="wrappers">
      <div class="content">
      <slot></slot>
      </div>
    </div>
</template>

<script>
import BScroll from 'better-scroll';

export default {
  name: "Scroll",
  props:{
    probeType: {
      type: Number,
      default: 0
    },
    pullUpLoad: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scroll: null
    }
  },
  mounted() {
    //创建BScroll对象
    this.$nextTick(() => {
    this.scroll = new BScroll(this.$refs.wrappers,{
      click:true,
      mouseWheel:true,
      probeType: this.probeType,
      pullUpLoad: this.pullUpLoad
    }),
    //监听滚动的位置
    this.scroll.on('scroll',(position) => {
      this.$emit('scroll',position);
    }),
    //监听上拉加载事件
    this.scroll.on('pullingUp',() => {
      this.$emit('pullingUp');
    })
  })
  },
  methods: {
    scrollTo(x , y, time=500) {
      this.scroll && this.scroll.scrollTo(x ,y ,time);
    },
    refresh() {
      this.scroll && this.scroll.refresh();
    },
    finishPullUp() {
      this.scroll && this.scroll.finishPullUp();
    }
  }
}
</script>

<style scoped>

</style>
