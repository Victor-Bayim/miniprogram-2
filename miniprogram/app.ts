// app.ts
App<IAppOption>({
    onLaunch() {
      // 检查本地存储中是否有用户信息
      const userInfo = wx.getStorageSync('userInfo') as IUserInfo | null;
      if (userInfo) {
        this.globalData.userInfo = userInfo;
      }
    },
  
    globalData: {
      userInfo: null as IUserInfo | null
    }
  });
  
  // 辅助函数
  const addZero = (num: number): string => {
    return num < 10 ? '0' + num : num.toString();
  };
  
  // 定义接口
  interface IUserInfo {
    id: string;
    nickName: string;
    avatarUrl: string;
    phone: string;
  }
  