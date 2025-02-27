import type { FileNodeInfo } from '@/api/files'

export const sortMethodMap: Record<SortMethod, string> = {
  'date-asc': '日期升序',
  'date-desc': '日期降序',
  'name-asc': '名称升序',
  'name-desc': '名称降序',
  'size-asc': '大小升序',
  'size-desc': '大小降序'
}
export enum SortMethod {
  DATE_ASC = 'date-asc',
  DATE_DESC = 'date-desc',
  NAME_ASC = 'name-asc',
  NAME_DESC = 'name-desc',
  SIZE_ASC = 'size-asc',
  SIZE_DESC = 'size-desc',
}

type FileList = FileNodeInfo[]

const compareByType = (a: FileNodeInfo, b: FileNodeInfo) => {
  const sa = a.type === 'dir' ? 1 : 0
  const sb = b.type === 'dir' ? 1 : 0
  return sb - sa
}

const compareByDate = (a: FileNodeInfo, b: FileNodeInfo) => {
  const da = Date.parse(a.date)
  const db = Date.parse(b.date)
  return da - db
}

const compareByName = (a: FileNodeInfo, b: FileNodeInfo) => {
  const an = a.name.toLowerCase()
  const bn = b.name.toLowerCase()
  return an.localeCompare(bn)
}

const compareBySize = (a: FileNodeInfo, b: FileNodeInfo) => {
  return a.bytes - b.bytes
}

export const sortFiles = (files: FileList, method: SortMethod) => {
  const compare = (a: FileNodeInfo, b: FileNodeInfo) => {
    switch (method) {
      case SortMethod.DATE_ASC:
        return compareByDate(a, b)
      case SortMethod.DATE_DESC:
        return compareByDate(b, a)
      case SortMethod.NAME_ASC:
        return compareByName(a, b)
      case SortMethod.NAME_DESC:
        return compareByName(b, a)
      case SortMethod.SIZE_ASC:
        return compareBySize(a, b)
      case SortMethod.SIZE_DESC:
        return compareBySize(b, a)
      default:
        throw new Error(`Invalid sort method: ${method}`)
    }
  }
  return files.slice().sort((a, b) => compareByType(a, b) || compare(a, b))
}

