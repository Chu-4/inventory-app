import { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { api } from '../utils/api';
import BottomNav from '../components/BottomNav';

export default function ProfilePage({ onNavigate, onRefresh, onLogout }) {
  const [items, setItems] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    api.getItems().then(setItems);
  }, []);

  const avatarChar = username.charAt(0).toUpperCase() || '?';

  const handleEditUsername = () => {
    setNewName(username);
    setEditingName(true);
  };

  const handleSaveUsername = async () => {
    if (!newName.trim() || newName.trim() === username) { setEditingName(false); return; }
    try {
      const res = await api.updateUsername(newName.trim());
      localStorage.setItem('username', res.username);
      setUsername(res.username);
      setEditingName(false);
    } catch (e) {
      message.error(e.message || '修改失败');
    }
  };

  const handleExport = async () => {
    const [its, cats, rms] = await Promise.all([api.getItems(), api.getCategories(), api.getRooms()]);
    const data = { items: its, categories: cats, rooms: rms, exportTime: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        Modal.confirm({
          title: '确认导入',
          content: '这将添加导入的数据，确认继续？',
          okText: '确认导入',
          cancelText: '取消',
          onOk: async () => {
            if (data.items) await Promise.all(data.items.map(i => api.addItem(i)));
            onRefresh?.();
            message.success('导入成功');
          },
        });
      } catch {
        Modal.error({ title: '导入失败', content: '文件格式错误' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLogout = () => {
    Modal.confirm({
      title: '退出登录',
      content: '确认退出登录？',
      okText: '退出',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        onLogout?.();
      },
    });
  };

  return (
    <div className="page page--profile">
      <div className="profile-content profile-content--new">

        {/* 用户信息卡片 */}
        <div className="profile-user-card">
          <div className="profile-avatar">{avatarChar}</div>
          <div className="profile-user-info">
            <div className="profile-username-row">
              {editingName ? (
                <input
                  className="profile-username-input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onBlur={handleSaveUsername}
                  onKeyDown={e => e.key === 'Enter' && handleSaveUsername()}
                  autoFocus
                />
              ) : (
                <span className="profile-username">{username}</span>
              )}
              <button type="button" className="profile-edit-btn" onClick={handleEditUsername}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="profile-item-count">{items.length} 件物品</p>
          </div>
        </div>

        {/* 数据管理 */}
        <div className="profile-section">
          <button type="button" className="profile-action-row" onClick={handleExport}>
            <DownloadOutlined style={{ fontSize: 18, color: '#71717a' }} />
            <span>导出数据 (JSON)</span>
          </button>
          <div className="profile-divider" />
          <label className="profile-action-row">
            <UploadOutlined style={{ fontSize: 18, color: '#71717a' }} />
            <span>导入数据 (JSON)</span>
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>

        {/* 关于 + 退出 */}
        <div className="profile-about-block">
          <p className="profile-app-name">物品整理 v2.0</p>
          <p className="profile-app-desc">一款帮助你管理家中物品的应用</p>
        </div>

        <button type="button" className="profile-logout-btn" onClick={handleLogout}>
          退出登录
        </button>

      </div>

      <BottomNav activeId="profile" onNavigate={onNavigate} />
    </div>
  );
}
