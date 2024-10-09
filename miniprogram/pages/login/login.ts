// pages/login/login.ts
import { request } from '../../utils/util';

Page({
  data: {
    phone: '',
    password: '',
    // 其他数据
  },

  onPhoneInput(e: any) {
    this.setData({ phone: e.detail.value });
  },

  onPasswordInput(e: any) {
    this.setData({ password: e.detail.value });
  },

  async login() {
    const { phone, password } = this.data;
    if (!phone || !password) {
      wx.showToast({ title: '请输入手机号和密码', icon: 'none' });
      return;
    }

    try {
      const res = await request<{ userInfo: IUserInfo }>({
        url: 'https://abcd1234.ngrok.io/api/login', // 替换为您的服务器地址
        method: 'POST',
        data: {
          phone,
          password
        }
      });

      if (res.success && res.data) {
        wx.setStorageSync('userInfo', res.data.userInfo);
        wx.redirectTo({ url: '../user/user' });
      } else {
        wx.showToast({ title: res.message || '登录失败', icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '网络错误', icon: 'none' });
      console.error('登录失败', error);
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
