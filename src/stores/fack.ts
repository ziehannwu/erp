export type StaffStatus = '启用' | '停用'
export type JobStatus = '实习' | '试用' | '正式'

export type StaffItem = {
  id: number
  name: string
  photo: string | null
  employeeNo: string | null
  age: number | null
  gender: string | null
  entryDate: string | null
  idCard: string | null
  leaveDate: string | null
  accountStatus: StaffStatus | null
  department: string | null
  position: string | null
  leader: string | null
  phone: string | null
  email: string | null
  job: string | null
  jobStatus: JobStatus | null
}

export const getAgeFromIdCard = (idCard: string | null | undefined): number | null => {
  if (!idCard || idCard.length !== 18) {
    return null
  }

  const year = Number(idCard.slice(6, 10))
  const month = Number(idCard.slice(10, 12))
  const day = Number(idCard.slice(12, 14))

  if (!year || !month || !day) {
    return null
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentDate = now.getDate()

  let age = currentYear - year
  if (month > currentMonth || (month === currentMonth && day > currentDate)) {
    age -= 1
  }

  return age >= 0 ? age : null
}

export const staffList: StaffItem[] = [
  {
    id: 1,
    name: '张晓丽',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    employeeNo: 'EMP-001',
    age: getAgeFromIdCard('341125199204180912'),
    gender: '女',
    entryDate: '2020-03-15',
    idCard: '341125199204180912',
    leaveDate: null,
    accountStatus: '启用',
    department: '信息部',
    position: '信息部主管',
    leader: '周经理',
    phone: '13800000001',
    email: 'zhangxiaoli@hann.com',
    job: '系统管理员',
    jobStatus: '正式',
  },
  {
    id: 2,
    name: '王建国',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    employeeNo: 'EMP-002',
    age: getAgeFromIdCard('330106198809101234'),
    gender: '男',
    entryDate: '2019-07-11',
    idCard: '330106198809101234',
    leaveDate: null,
    accountStatus: '启用',
    department: '财务部',
    position: '财务经理',
    leader: '陈总',
    phone: '13900000002',
    email: 'wangjianguo@hann.com',
    job: '财务分析',
    jobStatus: '正式',
  },
  {
    id: 3,
    name: '赵敏',
    photo: null,
    employeeNo: 'EMP-003',
    age: getAgeFromIdCard('440321199503201118'),
    gender: '女',
    entryDate: '2023-01-08',
    idCard: '440321199503201118',
    leaveDate: null,
    accountStatus: '停用',
    department: '信息部',
    position: '前端工程师',
    leader: '张晓丽',
    phone: null,
    email: null,
    job: '前端开发',
    jobStatus: '试用',
  },
  {
    id: 4,
    name: '李强',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    employeeNo: 'EMP-004',
    age: getAgeFromIdCard('510107199801260981'),
    gender: '男',
    entryDate: '2024-05-20',
    idCard: '510107199801260981',
    leaveDate: null,
    accountStatus: '启用',
    department: '药品采购部',
    position: '采购专员',
    leader: '赵主任',
    phone: '13700000004',
    email: 'liqiang@hann.com',
    job: '采购执行',
    jobStatus: '实习',
  },
]
