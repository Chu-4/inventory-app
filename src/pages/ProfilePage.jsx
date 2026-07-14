import { useEffect, useState } from 'react';
import { Button, Card, Divider, Typography, Upload, Modal } from 'antd';
import { DownloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../utils/api';
import BottomNav from '../components/BottomNav';

const { Text } = Typography;

export default function ProfilePage({ onNavigate, onRefresh }) {
  const [items, setItems] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    api.getItems().then(setItems);
    api.getFavoriteItems().then(favs => setFavoriteCount(favs.length));
  }, []);

  const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0);

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

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        Modal.confirm({
          title: '确认导入',
          content: '这将覆盖现有的所有数据，确认继续？',
          okText: '确认导入',
          cancelText: '取消',
          onOk: async () => {
            // 逐条写入，简单实现
            if (data.items) await Promise.all(data.items.map(i => api.addItem(i)));
            onRefresh?.();
          },
        });
      } catch {
        Modal.error({ title: '导入失败', content: '文件格式错误' });
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleClearAll = () => {
    Modal.confirm({
      title: '清空所有数据',
      content: '此操作无法撤销，所有物品和分类将被永久删除。',
      okText: '确认清空',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        storage.clearAll();
        onRefresh?.();
      },
    });
  };

  return (
    <div className="page page--profile">
      <div className="profile-header">
        <h1 className="page-top-title">我的</h1>
      </div>

      <div className="profile-content">
        <Card className="profile-card" variant="outlined">
          <Text className="profile-card-label">数据统计</Text>
          {[
            { label: '物品总数', value: `${items.length} 件` },
            { label: '收藏数', value: `${favoriteCount} 件` },
            { label: '记录总价值', value: `¥${totalValue.toFixed(2)}` },
          ].map(({ label, value }, idx, arr) => (
            <div key={label}>
              <div className="profile-stat-row">
                <Text>{label}</Text>
                <span className="profile-stat-value">{value}</span>
              </div>
              {idx < arr.length - 1 && <Divider style={{ margin: 0 }} />}
            </div>
          ))}
        </Card>

        <Text className="profile-section-label">数据管理</Text>
        <div className="profile-actions">
          <Button block size="large" icon={<DownloadOutlined />} onClick={handleExport} className="profile-action-btn">
            导出数据 (JSON)
          </Button>
          <Upload accept=".json" showUploadList={false} beforeUpload={handleImport}>
            <Button block size="large" icon={<UploadOutlined />} className="profile-action-btn" style={{ width: '100%' }}>
              导入数据 (JSON)
            </Button>
          </Upload>
          <Button block size="large" danger icon={<DeleteOutlined />} onClick={handleClearAll} className="profile-action-btn">
            清空所有数据
          </Button>
        </div>

        <div className="profile-about">
          <div className="profile-about-title">物品整理 v2.0</div>
          <Text className="profile-about-text">
            数据保存在服务器，多设备同步可用
          </Text>
        </div>
      </div>

      <BottomNav activeId="profile" onNavigate={onNavigate} />
    </div>
  );
}
