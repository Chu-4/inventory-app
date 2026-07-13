import { Button, Card, Divider, Typography, Upload, Modal } from 'antd';
import { DownloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage';
import BottomNav from '../components/BottomNav';

const { Text } = Typography;

export default function ProfilePage({ onNavigate, onRefresh }) {
  const stats = storage.getStats();
  const items = storage.getItems();
  const storageKB = (new Blob([JSON.stringify(items)]).size / 1024).toFixed(1);

  const handleExport = () => {
    const data = storage.exportData();
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
          onOk: () => {
            storage.importData(data);
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
            { label: '物品总数', value: `${stats.totalItems} 件` },
            { label: '收藏数', value: `${storage.getFavoriteItems().length} 件` },
            { label: '记录总价值', value: `¥${stats.totalValue.toFixed(2)}` },
            { label: '本地存储', value: `${storageKB} KB` },
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
            数据保存在浏览器 localStorage 中<br />
            完全私密，离线可用
            {!storage.isPersistent() && (
              <><br /><span style={{ color: '#e67e22' }}>当前环境无法持久化存储</span></>
            )}
          </Text>
        </div>
      </div>

      <BottomNav activeId="profile" onNavigate={onNavigate} />
    </div>
  );
}
