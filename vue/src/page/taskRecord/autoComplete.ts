import { checkPathExists, type getGlobalSetting } from '@/api'
import { pick, type ReturnTypeAsync } from '@/util'

export const getAutoCompletedTagList = async ({
  global_setting,
  sd_cwd,
  home
}: ReturnTypeAsync<typeof getGlobalSetting>) => {
  const picked = pick(
    global_setting,
    'additional_networks_extra_lora_path',
    'outdir_grids',
    'outdir_extras_samples',
    'outdir_img2img_grids',
    'outdir_img2img_samples',
    'outdir_grids',
    'outdir_extras_samples',
    'outdir_samples',
    'outdir_txt2img_grids',
    'outdir_txt2img_samples',
    'outdir_save'
  )
  const pathMap = {
    ...picked,
    embeddings: 'embeddings',
    hypernetworks: 'models/hypernetworks',
    cwd: sd_cwd,
    home
  }
  const exists = await checkPathExists(Object.values(pathMap).filter(v => v))
  type Keys = keyof typeof pathMap
  const cnMap: Record<Keys, string> = {
    outdir_txt2img_samples: '文生图的输出目录',
    outdir_img2img_samples: '图生图的输出目录',
    outdir_save: '使用“保存”按钮保存图像的目录',
    outdir_extras_samples: '附加功能选项卡的输出目录',
    additional_networks_extra_lora_path: '扫描 LoRA 模型的附加目录',
    outdir_grids: '宫格图的输出目录',
    outdir_img2img_grids: '图生图网格文件夹',
    outdir_samples: '图像的输出目录',
    outdir_txt2img_grids: '文生图宫格的输出目录',
    hypernetworks: '超网络模型的路径',
    embeddings: 'Embedding的文件夹',
    cwd: '工作文件夹',
    home: 'home'
  }
  return Object.keys(cnMap)
    .filter((k) => exists[pathMap[k as keyof typeof pathMap] as string])
    .map((k) => {
      const key = k as Keys
      return {
        key,
        zh: cnMap[key],
        dir: pathMap[key]
      }
    })
}
