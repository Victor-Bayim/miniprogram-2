// utils/util.ts

// 定义响应接口
interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
  }
  
  // 网络请求封装
  export const request = <T>(options: WechatMiniprogram.RequestOption): Promise<ApiResponse<T>> => {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: res => {
          resolve(res.data as ApiResponse<T>);
        },
        fail: err => {
          reject(err);
        }
      });
    });
  };
  
  // 格式化时间为可读格式
  export const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const Y = date.getFullYear();
    const M = addZero(date.getMonth() + 1);
    const D = addZero(date.getDate());
    const h = addZero(date.getHours());
    const m = addZero(date.getMinutes());
    return `${Y}-${M}-${D} ${h}:${m}`;
  };
  
  // 辅助函数：为个位数添加前导零
  const addZero = (num: number): string => {
    return num < 10 ? '0' + num : num.toString();
  };
  