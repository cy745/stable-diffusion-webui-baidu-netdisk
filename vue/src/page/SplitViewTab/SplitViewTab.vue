<script lang="ts" setup>
// @ts-ignore
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { useGlobalStore, type TabPane } from '@/store/useGlobalStore'
import { defineAsyncComponent, watch, ref, nextTick } from 'vue'
import { key } from '@/util'
import { uniqueId } from 'lodash'
import edgeTrigger from './edgeTrigger.vue'
import { message } from 'ant-design-vue'
const global = useGlobalStore()
const compMap: Record<TabPane['type'], ReturnType<typeof defineAsyncComponent>> = {
  'auto-upload': defineAsyncComponent(() => import('@/page/autoUpload/autoUpload.vue')),
  local: defineAsyncComponent(() => import('@/page/fileTransfer/stackView.vue')),
  netdisk: defineAsyncComponent(() => import('@/page/fileTransfer/stackView.vue')),
  "task-record": defineAsyncComponent(() => import('@/page/taskRecord/taskRecord.vue')),
  empty: defineAsyncComponent(() => import('./emptyStartup.vue')),
  "log-detail": defineAsyncComponent(() => import('@/page/taskRecord/logDetail.vue')),
  "global-setting": defineAsyncComponent(() => import('@/page/globalSetting.vue'))
}
const onEdit = (idx: number, targetKey: any, action: string) => {
  const tab = global.tabList[idx]
  if (action === 'add') {
    const empty: TabPane = { type: 'empty', key: uniqueId(), name: '空启动页' }
    tab.panes.push(empty)
    tab.key = empty.key
  } else {
    if (global.tabList.reduce((p, c) => p + c.panes.length, 0) === 1) {
      return message.error('在仅剩一个pane的情况下，不允许删除!!!')
    }
    const paneIdx = tab.panes.findIndex(v => v.key === targetKey)
    if (tab.key === targetKey) { // 只有在前台时才跳过去
      tab.key = tab.panes[paneIdx - 1]?.key ?? tab.panes[0]?.key
    }
    tab.panes.splice(paneIdx, 1)
    if (tab.panes.length === 0) {
      global.tabList.splice(idx, 1)
    }
  }
}
const container = ref<HTMLDivElement>()
watch(() => global.tabList, async () => {
  await nextTick()
  global.saveRecord(global.tabList)
  Array.from(container.value?.querySelectorAll('.splitpanes__pane') ?? []).forEach((tabEl, tabIdx) => {
    Array.from(tabEl.querySelectorAll('.ant-tabs-tab') ?? []).forEach((paneEl, paneIdx) => {
      const el = paneEl as HTMLDivElement
      el.setAttribute('draggable', 'true')
      el.setAttribute('tabIdx', tabIdx.toString())
      el.setAttribute('paneIdx', paneIdx.toString())
      el.ondragend = () => {
        global.dragingTab = undefined
      }
      el.ondragstart = (e) => {
        global.dragingTab = { tabIdx, paneIdx }
        e.dataTransfer!.setData(
          'text/plain',
          JSON.stringify({ tabIdx, paneIdx, from: 'tab-drag' })
        )
      }
    })
  })
}, { immediate: true, deep: true })


</script>
<template>
  <div ref="container">

    <splitpanes class="default-theme">
      <pane v-for="tab, tabIdx in global.tabList" :key="key(tab)">
        <edge-trigger :tabIdx="tabIdx">
          <a-tabs type="editable-card" v-model:activeKey="tab.key" @edit="(key, act) => onEdit(tabIdx, key, act)">
            <a-tab-pane v-for="pane, paneIdx in tab.panes" :key="pane.key" :tab="pane.name"
            class="pane"
              :force-render="pane.type === 'task-record'">
              <component :is="compMap[pane.type]" :tabIdx="tabIdx" :paneIdx="paneIdx" v-bind="pane" />
            </a-tab-pane>
          </a-tabs>
        </edge-trigger>
      </pane>
    </splitpanes>
  </div>
</template>
<style scoped lang="scss">
:deep() .splitpanes {
  .splitpanes__splitter {
    background: var(--zp-primary-background);
  }

  .splitpanes__pane {
    background: var(--zp-primary-background);
    height: 100vh;
  }
}
.pane {
  height: calc(100vh - 40px);
}
</style>