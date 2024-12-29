import axios from 'axios';

export interface NoticeRecord {
  id: number;
  title: string;
  content: string;
}

export type NoticeListType = NoticeRecord[];

export async function queryNoticeList() {
  const res = await axios.post<NoticeListType>('/adm/v1/getNotice');
  return res.data;
}
