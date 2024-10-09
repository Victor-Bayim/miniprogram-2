// pages/chat/chat.ts
import { request, formatTime } from '../../utils/util';

Page({
  data: {
    projectId: '',
    messages: [] as IMessage[],
    inputContent: '',
    scrollTop: 0,
    socketOpen: false,
    socketTask: null as WechatMiniprogram.SocketTask | null,
    userInfo: {} as IUserInfo,
    page: 1,
    pageSize: 20,
    loading: false,
    hasMore: true
  },

  onLoad(options: any) {
    const projectId = options.id;
    this.setData({ projectId });
    const userInfo = wx.getStorageSync('userInfo') as IUserInfo;
    if (userInfo) {
      this.setData({ userInfo });
      this.initSocket(projectId);
      this.fetchChatHistory(projectId);
    } else {
      wx.redirectTo({ url: '../login/login' });
    }
  },

  onUnload() {
    if (this.data.socketTask) {
      this.data.socketTask.close();
    }
  },

  // 初始化 WebSocket 连接
  initSocket(projectId: string) {
    const userInfo = this.data.userInfo;
    const socketUrl = `wss://abcd1234.ngrok.io/ws/chat/${projectId}?userId=${userInfo.id}`; // 替换为您的服务器地址

    const socketTask = wx.connectSocket({
      url: socketUrl,
      header: {
        'content-type': 'application/json'
      },
      success: () => {
        console.log('WebSocket连接请求已发送！');
      }
    });

    socketTask.onOpen(() => {
      console.log('WebSocket连接已打开！');
      this.setData({ socketOpen: true });
    });

    socketTask.onMessage((res: any) => { // 使用 any 或自定义接口
      console.log('收到消息：', res.data);
      const message = JSON.parse(res.data) as IMessage;
      // 格式化时间戳
      message.timestamp = formatTime(message.timestamp);
      this.setData({
        messages: [...this.data.messages, message],
        scrollTop: (this.data.messages.length + 1) * 1000 // 假设每条消息高度为1000rpx
      });
    });

    socketTask.onClose(() => {
      console.log('WebSocket连接已关闭！');
      this.setData({ socketOpen: false });
    });

    socketTask.onError((err) => {
      console.error('WebSocket连接打开失败，请检查！', err);
      wx.showToast({ title: '聊天功能不可用', icon: 'none' });
    });

    this.setData({ socketTask });
  },

  // 获取聊天历史
  async fetchChatHistory(projectId: string) {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    try {
      const res = await request<IMessage[]>({
        url: `https://abcd1234.ngrok.io/api/projects/${projectId}/chats?page=${this.data.page}&pageSize=${this.data.pageSize}`, // 替换为您的服务器地址
        method: 'GET'
      });
      if (res.success && res.data) {
        const formattedMessages = res.data.map((msg: IMessage) => ({
          ...msg,
          timestamp: formatTime(msg.timestamp)
        }));
        const newMessages = [...formattedMessages, ...this.data.messages];
        this.setData({
          messages: newMessages,
          page: this.data.page + 1,
          hasMore: res.data.length === this.data.pageSize,
          scrollTop: newMessages.length * 1000,
          loading: false
        });
      } else {
        wx.showToast({ title: res.message || '获取聊天记录失败', icon: 'none' });
        this.setData({ loading: false });
      }
    } catch (error) {
      wx.showToast({ title: '网络错误', icon: 'none' });
      console.error('获取聊天记录失败', error);
      this.setData({ loading: false });
    }
  },

  onInput(e: any) {
    this.setData({ inputContent: e.detail.value });
  },

  // 发送消息
  sendMessage() {
    const { inputContent, socketOpen, socketTask, projectId, userInfo } = this.data;
    if (!inputContent.trim()) return;

    if (socketOpen && socketTask) {
      const message: IMessage = {
        senderId: userInfo.id,
        senderName: userInfo.nickName,
        senderAvatar: userInfo.avatarUrl,
        content: inputContent,
        timestamp: new Date().toISOString()
      };

      // 添加发送中的消息到列表
      const tempMessage: IMessage = {
        ...message,
        timestamp: formatTime(message.timestamp),
        sending: true // 标记消息为发送中
      };
      this.setData({
        messages: [...this.data.messages, tempMessage],
        scrollTop: (this.data.messages.length + 1) * 1000,
        inputContent: ''
      });

      socketTask.send({
        data: JSON.stringify(message),
        success: () => {
          // 更新消息状态为已发送
          const updatedMessages = this.data.messages.map((msg) => {
            if (msg.timestamp === tempMessage.timestamp && msg.content === tempMessage.content) {
              return { ...msg, sending: false };
            }
            return msg;
          });
          this.setData({
            messages: updatedMessages
          });
        },
        fail: () => {
          wx.showToast({ title: '发送失败', icon: 'none' });
          // 更新消息状态为发送失败
          const updatedMessages = this.data.messages.map((msg) => {
            if (msg.timestamp === tempMessage.timestamp && msg.content === tempMessage.content) {
              return { ...msg, sending: 'failed' };
            }
            return msg;
          });
          this.setData({
            messages: updatedMessages
          });
        }
      });
    } else {
      wx.showToast({ title: 'WebSocket未连接', icon: 'none' });
    }
  },

  // 导航到项目详情
  goToProjectDetail() {
    const projectId = this.data.projectId; // 确保 projectId 是 string
    wx.navigateTo({ url: `../project-detail/project-detail?id=${projectId}` });
  }
});

// 定义接口
interface IUserInfo {
  id: string;
  nickName: string;
  avatarUrl: string;
  phone: string;
}

interface IMessage {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  sending?: boolean | 'failed'; // 可选属性，标记消息发送状态
}
