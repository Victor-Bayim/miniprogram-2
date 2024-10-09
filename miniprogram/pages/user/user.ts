// pages/user/user.ts
import { request } from '../../utils/util';

Page({
  data: {
    userInfo: {} as IUserInfo,
    projects: [] as IProject[]
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') as IUserInfo;
    if (userInfo) {
      this.setData({ userInfo });
      this.fetchUserProjects(userInfo.id);
    } else {
      wx.redirectTo({ url: '../login/login' });
    }
  },

  // 获取用户参与的项目列表
  async fetchUserProjects(userId: string) {
    try {
      const res = await request({
        url: `https://your-server.com/api/user/projects?userId=${userId}`, // 替换为您的服务器地址
        method: 'GET'
      });
      if (res.success) {
        this.setData({ projects: res.projects });
      } else {
        wx.showToast({ title: res.message || '获取项目失败', icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '网络错误', icon: 'none' });
      console.error('获取用户项目失败', error);
    }
  },

  // 跳转到项目详情页
  goToProject(e: any) {
    const projectId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `../project-detail/project-detail?id=${projectId}` });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.redirectTo({ url: '../login/login' });
        }
      }
    });
  }
});

// 定义接口
interface IUserInfo {
  id: string;
  nickName: string;
  avatarUrl: string;
  phone: string;
  // 其他用户信息字段
}

interface IProject {
  id: string;
  name: string;
  description: string;
  skills: string[];
  duration: number;
  status: string;
  creatorId: string;
}
