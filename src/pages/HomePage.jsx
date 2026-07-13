import {
  HeartOutlined,
  PlusOutlined,
  AppstoreOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import BottomNav from '../components/BottomNav';

const NAV_ENTRIES = [
  { id: 'categories', label: '按分类浏览', Icon: AppstoreOutlined },
  { id: 'rooms', label: '按房间浏览', Icon: HomeOutlined },
  { id: 'time-browse', label: '按时间浏览', Icon: ClockCircleOutlined },
  { id: 'all-items', label: '全部物品', Icon: UnorderedListOutlined },
];

export default function HomePage({ onNavigate }) {
  return (
    <div className="page page--home">
      <div className="home-header">
        <h1 className="home-title">物品整理</h1>
        <button
          type="button"
          className="icon-btn-round"
          onClick={() => onNavigate('favorites')}
          aria-label="收藏"
        >
          <HeartOutlined />
        </button>
      </div>

      <div className="home-content">
        <button
          type="button"
          className="home-add-btn"
          onClick={() => onNavigate('item-add', { categoryId: null, roomId: null, itemId: null })}
        >
          <div className="home-add-circle">
            <PlusOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <span className="home-add-label">添加物品</span>
        </button>

        <div className="home-nav-list">
          {NAV_ENTRIES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className="home-nav-card"
              onClick={() => onNavigate(id)}
            >
              <div className="home-nav-icon">
                <Icon style={{ fontSize: 24, color: '#e67e22' }} />
              </div>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav activeId="home" onNavigate={onNavigate} />
    </div>
  );
}
