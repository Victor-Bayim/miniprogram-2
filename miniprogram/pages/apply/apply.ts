// pages/apply/apply.ts
import { request } from '../../utils/util';

Page({
  data: {
    projectId: '',
    reason: ''
  },

  onLoad(options: any) {
    const projectId = options.id;
    this.setData({ projectId });
  },

  onReasonInput(e: any) {
    this.setData({ reason: e.detail.value });
  },

  async submitApplication() {
    const { projectId, reason } = this.data;
    if (!reason.trim()) {
      wx.showToast({ title: '请输入申请理由', icon: 'none' });
      return;
    }

    const userInfo = wx.getStorageSync('userInfo') as IUserInfo;

    try {
      const res = await request<IApplication>({
        url: 'https://abcd1234.ngrok.io/api/applications',
        method: 'POST',
        data: {
          projectId,
          applicantId: userInfo.id,
          reason
        }
      });

      if (res.success) {
        wx.showToast({ title: '申请已提交', icon: 'success' });
        wx.redirectTo({ url: `../project-detail/project-detail?id=${projectId}` });
      } else {
        wx.showToast({ title: res.message || '提交申请失败', icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '网络错误', icon: 'none' });
      console.error('提交申请失败', error);
    }
  }
});

// 定义接口
interface IUserInfo {
  id: string;
  nickName: string;
  avatarUrl: string;
  phone: string;
}

interface IApplication {
  id: string;
  projectId: string;
  applicantId: string;
  reason: string;
  status: string;
  createTime: string;
}
