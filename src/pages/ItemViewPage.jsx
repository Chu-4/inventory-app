import { useEffect, useState } from 'react';
import {
  LeftOutlined,
  HeartOutlined,
  HeartFilled,
  TagOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  InboxOutlined,
  CalendarOutlined,
  DeleteOutlined,
  CameraOutlined,
  CopyrightOutlined,
} from '@ant-design/icons';
import { Popconfirm, Upload, message } from 'antd';
import { api } from '../utils/api';
import { imageUtils, formatPrice } from '../utils/helpers';

function InfoRow({ icon: Icon, label, value, valueClass }) {
  return (
    <>
      <div className="detail-info-row">
        <div className="detail-info-label">
          <Icon style={{ fontSize: 18, color: '#636366' }} />
          <span>{label}</span>
        </div>
        <span className={`detail-info-value${valueClass ? ` ${valueClass}` : ''}`}>{value}</span>
      </div>
      <div className="detail-divider" />
    </>
  );
}

export default function ItemViewPage({ itemId, onNavigate, onBack, onRefresh }) {
  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    api.getItem(itemId).then(setItem).catch(() => setItem(null));
    api.getCategories().then(setCategories);
    api.getRooms().then(setRooms);
  }, [itemId]);

  if (!item) {
    return (
      <div className="page page--stack">
        <div className="empty-state"><p>物品不存在</p></div>
      </div>
    );
  }

  const category = categories.find(c => c.id === item.categoryId);
  const room = rooms.find(r => r.id === item.roomId);
  const sub = categories.find(c => c.id === item.subcategoryId);

  const handleToggleFavorite = async () => {
    const { favorite } = await api.toggleFavorite(item.id);
    setItem(prev => ({ ...prev, favorite }));
    onRefresh?.();
  };

  const handleDelete = async () => {
    await api.deleteItem(item.id);
    onRefresh?.();
    onBack();
  };

  const handleImageUpload = async (file) => {
    const compressed = await imageUtils.compressImage(file);
    await api.updateItem(item.id, { imageUrl: compressed });
    setItem(prev => ({ ...prev, imageUrl: compressed }));
    onRefresh?.();
    return false;
  };

  return (
    <div className="page page--stack page--detail">
      <div className="detail-top-bar">
        <button type="button" className="icon-btn-round" onClick={onBack}>
          <LeftOutlined />
        </button>
        <button type="button" className="icon-btn-round" onClick={handleToggleFavorite}>
          {item.favorite ? (
            <HeartFilled style={{ color: '#e67e22' }} />
          ) : (
            <HeartOutlined />
          )}
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-heading">
          <h1>{item.name}</h1>
          {item.notes && <p className="detail-notes">{item.notes}</p>}
        </div>

        <div className="detail-image-area">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="detail-image" />
          ) : (
            <Upload accept="image/*" showUploadList={false} beforeUpload={handleImageUpload}>
              <div className="detail-image-placeholder">
                <div className="detail-image-placeholder-icon">
                  <CameraOutlined style={{ fontSize: 22 }} />
                </div>
                <span>添加图片</span>
              </div>
            </Upload>
          )}
        </div>

        <div className="detail-info-card">
          <InfoRow icon={TagOutlined} label="分类" value={sub ? `${category?.name} · ${sub.name}` : (category?.name || '—')} />
          {item.subcategoryId === '5-1' && item.ip && (
            <InfoRow icon={CopyrightOutlined} label="IP" value={item.ip} />
          )}
          <InfoRow icon={EnvironmentOutlined} label="所在房间" value={room?.name || '—'} />
          <InfoRow icon={DollarOutlined} label="价格" value={item.price ? `¥${formatPrice(item.price)}` : '—'} valueClass="detail-info-value--price" />
          <InfoRow icon={InboxOutlined} label="数量" value={item.quantity ?? 1} />
          <div className="detail-info-row detail-info-row--last">
            <div className="detail-info-label">
              <CalendarOutlined style={{ fontSize: 18, color: '#636366' }} />
              <span>购入时间</span>
            </div>
            <span className="detail-info-value">{item.date || '—'}</span>
          </div>
        </div>

        <div className="detail-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => onNavigate('item-edit', { itemId: item.id })}
          >
            编辑详情
          </button>
          <Popconfirm
            title="确认删除此物品?"
            onConfirm={handleDelete}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <button type="button" className="btn-delete">
              <DeleteOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
}
