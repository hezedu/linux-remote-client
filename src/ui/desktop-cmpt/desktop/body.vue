<template lang="jade">
.lr-desktop_body(@drop.stop='handleDeskDrop',
                    @dragenter.stop='handleDragenter',
                    @dragover.stop='handleDragover')
  Contextmenuable.lr-desktop-icons(ref="ctx")
    Icon(v-for="(v,i) in list",
        :key="v.id",
        :id="v.id",
        :index="i",
        :item="v")
    template(v-slot:contextmenu)
      .lr-ctx-item(@click="refresh") {{LANG.ctx.Refresh}}
      .lr-ctx-item(@click="sortIcon") Sort icon
  TaskWindow(v-for='(task, index) in tasks',
                  :task="task",
                  :key="task.id")
  Block(v-for="item in blocks", :key="item.id", v-bind="item.opt")

</template>
<script>
import Contextmenuable from '../global/contextmenuable.vue';
import Icon from './icon.vue';
import Block from '../block/block.vue';
import TaskWindow from '../task/task-window.vue';
import sys_app_fs from '../../../sys-app/fs/fs.vue';
import sys_app_recycle_bin from '../../../sys-app/recycle-bin/recycle-bin.vue';
import sys_app_editor from '../../../sys-app/editor/editor.vue';
import sys_app_terminal from '../../../sys-app/terminal/terminal.vue';
// import sys_app_disk from '../../sys-app/disk/disk.vue';
// import sys_app_computer from '../../sys-app/computer-info/computer-info.vue';
// import sys_app_task_manager from '../../sys-app/task-manager/task-manager.vue';
// import sys_app_settings from '../../sys-app/settings/settings.vue';
// import sys_app_account from '../../sys-app/account/account.vue';
//import ThirdPartyApp from '../../third-party-app/index.vue';
//import Cascade from '../global/cascade.vue';
const ICON_WIDTH = 80;
const ICON_HEIGHT = 80;
export default {
  components: {
    sys_app_fs,
    sys_app_terminal,
    sys_app_editor,
    sys_app_recycle_bin,
    Contextmenuable,
    Block,
    TaskWindow,
    Icon
  },
  computed:{
    tasks(){
      return this.$store.state.task.list;
    },
    blocks(){
      return this.$store.state.block.list;
    },
    list(){
      return this.$store.state.desktop.icons;
    },
    saveEvent(){
      return this.$store.state.desktop.saveEvent;
    },
    LANG(){
      return this.$store.getters['language/currLanguage'].deskTop
    }
  },
  watch: {
    saveEvent(){
      this.save();
    }
  },
  methods: {
    handleDragenter(e){
      e.preventDefault();
    },
    handleDragover(e){
      e.preventDefault();
    },
    sortIcon(){
      let deskH = this.$el.offsetHeight;
      let maxRow = Math.floor(deskH / ICON_HEIGHT);
      let cum = 0;
      this.list.forEach((v, i) => {
        v.x = cum * ICON_WIDTH;
        if( i > maxRow){
          cum = cum + 1;
        }
        v.y = (i % maxRow) * ICON_HEIGHT;
      })
      this.save();
      this.$refs.ctx.close();
    },
    refresh(){
      this.getData();
      this.$refs.ctx.close();
    },
    _getDragData(e){
      const data = e.dataTransfer.getData('text');
      if(!data){
        return;
      }
      try{
        return JSON.parse(data);
      } catch(e){
        // console.log('data', e);
      }
    },
    save(){
        const arr = this.list.map(v => {
          return {
            id: v.id,
            x: v.x,
            y: v.y,
            type: v.type
          }
        });
        // console.log('save', arr);

        this.$store.commit('wsRequest', {
          method: 'saveDesktopIcons',
          data: JSON.stringify(arr),
          // success: () => {
          //   console.log('desktop save ok');
          // }
        });
        // this.request({
        //   url: '~/desktop/icons',
        //   type: 'post',
        //   data: {
        //     content: JSON.stringify(arr)
        //   },
        //   success(){
        //     console.log('desktop save ok');
        //   }
        // })

    },
    handleDeskDrop(e){
      console.log('handleDeskDrop');
      e.preventDefault();
      const data = this._getDragData(e);
      if(!data){
        return;
      }
      const item = this.list.find(v => v.id === data.id);
      if(item){
        if(data.from === 'desktop'){
          this.setDropedItemXY(data, item, e);
          this.save();
        } else {
          this.$store.commit('error/show', 'The icon already exists on the desktop.');
        }
      } else {
        if(data.from === 'startMenu'){
          let newItem = {
            id: data.id,
            x: e.clientX,
            y: e.clientY
          }
          const xy = this.keepIconIn(e.clientX, e.clientY);
          newItem.x = xy.x;
          newItem.y = xy.y;
          this.$store.commit('desktop/addIcon', newItem);
          // this.list.push(newItem);
          // this.save();
        }
      }
      
    },
    setDropedItemXY(data, item, e){
      const startClient = data.startClient;
      const positionLeft =  item.x + (e.clientX - startClient.x);
      const positionTop = item.y  + (e.clientY - startClient.y);
      

      const result = this.keepIconIn(positionLeft, positionTop);

      item.x = result.x;
      item.y = result.y;
    },
    keepIconIn(x, y){
      if(x < 0){
        x = 0;
      } else {
        const deskW = this.$el.offsetWidth;
        const elW = ICON_WIDTH;
        if(x + elW > deskW){
          x = deskW - elW;
        }
      }
      if(y < 0){
        y = 0;
      } else {
        const deskH = this.$el.offsetHeight;
        const elH = ICON_HEIGHT;
        if(y + elH > deskH){
          y = deskH - elH;
        }
      }
      return {
        x,
        y
      }
    },
    getData(){
      this.$store.commit('wsRequest', {
        method: 'getDesktopIcons',
        success: (resData) => {
          const result = this.parseIconsData(resData);
          this.$store.commit('desktop/setIcons', result);
        }
      });
    },
    parseIconsData(icons){
      if(!icons){ // 回收站可以被移除
        icons = [{
          id: 'sys_app_recycle_bin',
          x:0,
          y:0
        }]
      }else{
        icons = JSON.parse(icons);
      }
      return icons;
    }
  },
  created(){
      this.$options._isCanDrop = true;
      this.getData();
  },
  mounted(){
    this.$store.commit('setDeskTopWH');
    // setTimeout(() => {
    //   this.$store.commit('task/add', {appId: 'sys_app_fs'});
    // }, 200);
    
  }
}



    // Cascade.lr-ctx-item
    //   | 设置桌面壁纸
    //   .lr-test-parent(v-slot:menu)
    //     .lr-ctx-item 选择
    //     .lr-ctx-item 上传
    //     Cascade 333
    //       div(v-slot:menu)
    //         .lr-ctx-item 333
    //         .lr-ctx-item 333
    //         Cascade 444
    //           div(v-slot:menu)
    //             .lr-ctx-item 444
    //             .lr-ctx-item 444
</script>
