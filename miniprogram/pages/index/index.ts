// pages/index/index.ts
import { request } from '../../utils/util';

Page({
  data: {
    projects: []
  },

  onLoad() {
    this.getProjects();
  },

  // 获取项目列表
  async getProjects() {
    try {
      const res = await request({
        url: 'https://your-server.com/api/projects', // 替换为您的服务器地址
        method: 'GET'
      });
      if (res.success) {
        this.setData({ projects: res.projects });
      } else {
        wx.showToast({ title: res.message || '获取项目失败', icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '网络错误', icon: 'none' });
      console.error('获取项目失败', error);
    }
  },

  // 跳转到项目详情页
  goToProject(e: any) {
    const projectId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `../project-detail/project-detail?id=${projectId}` });
  },

  // 跳转到发布项目页
  goToPublish() {
    wx.navigateTo({ url: '../publish/publish' });
  },

  // 跳转到用户中心
  goToUserCenter() {
    wx.navigateTo({ url: '../user/user' });
  }
});
