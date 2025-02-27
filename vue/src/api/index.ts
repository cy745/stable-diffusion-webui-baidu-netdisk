import { message } from 'ant-design-vue'
import axios, { isAxiosError } from 'axios'
import type { GlobalSettingPart } from './type'
export const axiosInst = axios.create({
  baseURL: '/baidu_netdisk',

})
axiosInst.interceptors.response.use(resp => resp, err => {
  if (isAxiosError(err)) {
    const errmsg = err.response?.data?.detail ?? "发生了个错误"
    message.error(errmsg)
  }
  return err
})
export const greeting = async () => {
  const resp = await axiosInst.get('hello')
  return resp.data as string
}
interface BaiduYunTaskCreateReq {
  type: 'upload' | 'download'
  send_dirs: string[]
  recv_dir: string
}
export const createBaiduYunTask = async (req: BaiduYunTaskCreateReq) => {
  const resp = await axiosInst.post('task', req)
  return resp.data as {
    id: string
  }
}

interface UploadTaskStart {
  status: 'start'
  concurrent: number
}

interface UploadTaskFileSkipped {
  status: 'file-skipped'
  id: string
}

interface UploadTaskPreparing {
  id: string
  status: 'upload-preparing'
  local_path: string
}

interface UploadTaskSuccess {
  id: string
  status: 'upload-success'
  remote_path: string
}

interface UploadTaskFastuploadFailed {
  id: string
  status: 'fast-upload-failed'
}

interface UploadTaskFailed {
  id: string
  status: 'upload-failed'
  extra_info: string
}

interface UploadTaskDone {
  status: 'done'
}

interface UploadTaskQueued {
  id: string
  status: 'queued'
  local_file_path: string
}

export type UploadTaskFileStatus =
  | UploadTaskFastuploadFailed
  | UploadTaskFileSkipped
  | UploadTaskPreparing
  | UploadTaskQueued
  | UploadTaskSuccess
  | UploadTaskFailed

export interface UploadTaskTickStatus {
  log: string
  info: UploadTaskDone | UploadTaskStart | UploadTaskFileStatus
}

/**
 * 获取当前时刻的记录，包含日志输出，文件状态变化
 */
export const getUploadTaskTickStatus = async (id: string) => {
  const resp = await axiosInst.get(`/task/${id}/tick`)
  return resp.data as {
    tasks: UploadTaskTickStatus[],
    task_summary: UploadTaskSummary
  }
}

export interface UploadTaskSummary {
  id: string
  running: boolean
  start_time: string
  send_dirs: string[]
  recv_dir: string
  type: 'upload' | 'download'
  n_files: number
  n_failed_files: number
  canceled: boolean
  n_success_files: number
}

/**
 * 获取指定任务所有上传文件的状态
 * @param id
 */
export const getUploadTaskFilesState = async (id: string) => {
  const resp = await axiosInst.get(`/task/${id}/files_state`)
  return resp.data as {
    files_state: { [x: string]: UploadTaskFileStatus }
  }
}

/**
 * 获取所有上传文件的简介
 */
export const getUploadTasks = async () => {
  const resp = await axiosInst.get('/tasks')
  return resp.data as {
    tasks: UploadTaskSummary[]
  }
}

export interface GlobalConf {
  global_setting: GlobalSettingPart,
  is_win: boolean,
  cwd: string,
  home: string
  sd_cwd: string
}

export const getGlobalSetting = async () => {
  const resp = await axiosInst.get('/global_setting')
  return resp.data as GlobalConf
}

export const checkPathExists = async (paths: string[]) => {
  const resp = await axiosInst.post('/check_path_exists',{ paths })
  return resp.data as Record<string, boolean>
}


export const cancelTask = async (id: string) => {
  const resp = await axiosInst.post(`/task/${id}/cancel`)
  return resp.data as {
    last_tick: {
      tasks: UploadTaskTickStatus[],
      task_summary: UploadTaskSummary
    }
  }
}

export const removeTask = async (id: string) => {
  return axiosInst.delete(`/task/${id}`)
}

export const setImgPath = async (path: string) => {
  return axiosInst.post(`/send_img_path?path=${encodeURIComponent(path)}`)
}

export const genInfoCompleted = async () => {
  return (await axiosInst.get(`/gen_info_completed`)).data as boolean
}

export const getImageGenerationInfo = async (path: string) => {
  return (await axiosInst.get(`/image_geninfo?path=${encodeURIComponent(path)}`)).data as string
}

export const autoUploadOutput = async (recv_dir: string) => {
  const resp = await axiosInst.post(`/auto_upload`, { recv_dir })
  return resp.data as {
    pending_files: string[]
    tick_info?: {
      tasks: UploadTaskTickStatus[],
      task_summary: UploadTaskSummary
    }
  }
}

export const checkBaiduyunExists = () => axiosInst.get('/baiduyun_exists').then(v => v.data as boolean)
export const downloadBaiduyun = () =>  axiosInst.post('/download_baiduyun')