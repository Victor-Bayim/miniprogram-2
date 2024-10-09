// pages/project-detail/project-detail.ts
import { request, formatTime } from '../../utils/util';

Page({
  data: {
    project: {} as IProject,
    members: [] as IUserInfo[],
    isEditing: false,
    editForm: {
      name: '',
      description: '',
      skills: '',
      duration: 0,
      status: ''
    },
    inviteForm: {
      phone: ''
    }
    // 其他数据
  },

  onLoad(options: any) {
    const projectId = options.id;
    this.fetchProjectDetail(projectId);
    this.fetchProjectMembers(projectId);
  },

  // 获取项目详情
  async fetchProjectDetail(projectId: string) {
    try {
      const res = await request<IProject>({
        url: `https://your-server.com/api/projects/${projectId}`, // 替换为您的服务器地址
        method: 'GET'
      });

      if (res.success && res.data) {
        this.setData({
          project: res.data
        });
      } else {
        wx.showToast({ title: res.message || '获取项目详情失败', icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '网络错误', icon: 'none' });
      console.error('获取项目详情失败', error);
    }
  },

  // 获取项目成员
  async fetchProjectMembers(projectId: string) {
    try {
      const res = await request<IUserInfo[]>({
        url: `https://your-server.com/api/projects/${projectId}/members`, // 替换为您的服务器地址
        method: 'GET'
      });

      if (res.success && res.data) {
        this.setData({
          members: res.data
        });
      } else {
        wx.showToast({ title: res.message || '获取项目成员失败', icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '网络错误', icon: 'none' });
      console.error('获取项目成员失败', error);
    }
  },

  // 编辑项目按钮点击
  onEditProject() {
    const { project } = this.data;
    this.setData({
      isEditing: true,
      editForm: {
        name: project.name,
        description: project.description,
        skills: project.skills.join(', '),
        duration: project.duration,
        status: project.status
      }
    });
  },

  // 取消编辑
  onCancelEdit() {
    this.setData({
      isEditing: false
    });
  },

  // 编辑表单输入处理
  onEditFormInput(e: any) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`editForm.${field}`]: value
    });
  },

  // 提交编辑
  async submitEditProject() {
    const projectId = this.data.project.id;
    const { name, description, skills, duration, status } = this.data.editForm;

    if (!name || !description || !skills || !duration || !status) {
      wx.showToast({ title: '请填写所有字段', icon: 'none' });
      return;
    }

    try {
      const res = await request<IProject>({
        url: `https://your-server.com/api/projects/${projectId}`, // 替换为您的服务器地址
        method: 'PUT',
        data: {
          name,
          description,
          skills: skills.split(',').map((skill: string) => skill.trim()),
          duration,
          status
        }
      });

      if (res.success && res.data) {
        this.setData({
          project: res.data,
          isEditing: false
        });
        wx.showToast({ title: '项目更新成功', icon: 'success' });
      } else {
        wx.showToast({ title: res.message || '更新项目失败', icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '网络错误', icon: 'none' });
      console.error('更新项目失败', error);
    }
  },

  // 邀请成员按钮点击
  onInviteMember() {
    const { projectId } = this.data.project;
    wx.navigateTo({ url: `../invite-member/invite-member?projectId=${projectId}` });
  },

  // 删除成员
  async removeMember(memberId: string) {
    const projectId = this.data.project.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要从项目中移除该成员吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const res = await request<{ success: boolean }>({
              url: `https://your-server.com/api/projects/${projectId}/members/${memberId}`, // 替换为您的服务器地址
              method: 'DELETE'
            });

            if (res.success) {
              wx.showToast({ title: '成员已移除', icon: 'success' });
              this.fetchProjectMembers(projectId);
            } else {
              wx.showToast({ title: res.message || '移除成员失败', icon: 'none' });
            }
          } catch (error) {
            wx.showToast({ title: '网络错误', icon: 'none' });
            console.error('移除成员失败', error);
          }
        }
      }
    });
  },

  // 导航到聊天页面
  goToChat() {
    const projectId = this.data.project.id;
    wx.navigateTo({ url: `../chat/chat?id=${projectId}` });
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
