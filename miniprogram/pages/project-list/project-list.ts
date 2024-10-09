// pages/project-list/project-list.ts
import { request } from '../../utils/util';

interface IProject {
  id: string;
  name: string;
  description: string;
  skills: string[];
  duration: number;
  status: string;
}

Page({
  data: {
    projects: [] as IProject[],
    searchKeyword: '',
    categories: ['全部', '设计', '开发', '市场', '其他'],
    durations: ['全部', '1-7 天', '8-14 天', '15-30 天', '30 天以上'],
    selectedCategory: '全部',
    selectedDuration: '全部'
  },

  onLoad() {
    this.getProjects();
  },

  // 获取项目列表
  async getProjects() {
    try {
      const { searchKeyword, selectedCategory, selectedDuration } = this.data;
      const queryParams: any = {};

      if (searchKeyword) {
        queryParams.name = { $regex: searchKeyword, $options: 'i' };
      }

      if (selectedCategory && selectedCategory !== '全部') {
        if (selectedCategory === '其他') {
          queryParams.skills = { $nin: ['设计', '开发', '市场'] };
        } else {
          queryParams.skills = selectedCategory;
        }
      }

      if (selectedDuration && selectedDuration !== '全部') {
        if (selectedDuration === '1-7 天') {
          queryParams.duration = { $gte: 1, $lte: 7 };
        } else if (selectedDuration === '8-14 天') {
          queryParams.duration = { $gte: 8, $lte: 14 };
        } else if (selectedDuration === '15-30 天') {
          queryParams.duration = { $gte: 15, $lte: 30 };
        } else if (selectedDuration === '30 天以上') {
          queryParams.duration = { $gte: 31 };
        }
      }

      const res = await request({
        url: 'https://your-server.com/api/projects',
        method: 'GET',
        data: queryParams
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

  // 搜索关键词输入
  onSearchInput(e: any) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 执行搜索
  onSearch() {
    this.getProjects();
  },

  // 分类筛选
  onCategoryChange(e: any) {
    const selected = this.data.categories[e.detail.value];
    this.setData({ selectedCategory: selected }, () => {
      this.getProjects();
    });
  },

  // 时长筛选
  onDurationChange(e: any) {
    const selected = this.data.durations[e.detail.value];
    this.setData({ selectedDuration: selected }, () => {
      this.getProjects();
    });
  },

  // 跳转到项目详情页
  goToProject(e: any) {
    const projectId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `../project-detail/project-detail?id=${projectId}` });
  }
});
