// pages/publish/publish.ts
import { request } from '../../utils/util';

Page({
  data: {
    name: '',
    description: '',
    skills: [],
    duration: 0,
    // 其他数据
  },

  onNameInput(e: any) {
    this.setData({ name: e.detail.value });
  },

  onDescriptionInput(e: any) {
    this.setData({ description: e.detail.value });
  },

  onSkillsInput(e: any) {
    // 处理技能输入，如以逗号分隔
    const skills = e.detail.value.split(',').map((skill: string) => skill.trim());
    this.setData({ skills });
  },

  onDurationInput(e: any) {
    this.setData({ duration: Number(e.detail.value) });
  },

  async publishProject() {
    const { name, description, skills, duration } = this.data;
    if (!name || !description || skills.length === 0 || !duration) {
      wx.showToast({ title: '请填写所有字段', icon: 'none' });
      return;
    }

    const userInfo = wx.getStorageSync('userInfo') as IUserInfo;

    try {
      const res = await request<IProject>({
        url: 'https://abcd1234.ngrok.io/api/projects',
        method: 'POST',
        data: {
          name,
          description,
          skills,
          duration,
          creatorId: userInfo.id
        }
      });

      if (res.success && res.data) {
        wx.showToast({ title: '项目发布成功', icon: 'success' });
        wx.redirectTo({ url: `../project-detail/project-detail?id=${res.data.id}` });
      } else {
        wx.showToast({ title: res.message || '发布项目失败', icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '网络错误', icon: 'none' });
      console.error('发布项目失败', error);
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

interface IProject {
  id: string;
  name: string;
  description: string;
  skills: string[];
  duration: number;
  status: string;
  creatorId: string;
}
