import {
  SearchOutlined,
  PlayCircleOutlined,
  HomeOutlined,
  CoffeeOutlined,
  ReadOutlined,
  CloudOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { storage } from '../utils/storage';
import BottomNav from '../components/BottomNav';

const ROOM_ICONS = {
  living: PlayCircleOutlined,
  bedroom: HomeOutlined,
  kitchen: CoffeeOutlined,
  study: ReadOutlined,
  bathroom: CloudOutlined,
  balcony: BulbOutlined,
};

export default function RoomsPage({ onNavigate }) {
  const rooms = storage.getRooms();
  const stats = storage.getStats();

  return (
    <div className="page page--rooms">
      <div className="page-top-header">
        <h1 className="page-top-title">房间浏览</h1>
        <button type="button" className="icon-btn-round icon-btn-round--sm" onClick={() => onNavigate('search')}>
          <SearchOutlined style={{ fontSize: 18 }} />
        </button>
      </div>

      <div className="room-grid">
        {rooms.map(room => {
          const Icon = ROOM_ICONS[room.icon] || HomeOutlined;
          const count = stats.byRoom[room.id]?.count || 0;
          return (
            <button
              key={room.id}
              type="button"
              className="room-card"
              onClick={() => onNavigate('room-items', { roomId: room.id })}
            >
              <div className="room-card-top">
                <div className="room-card-icon">
                  <Icon style={{ fontSize: 18, color: '#636366' }} />
                </div>
                <span className="room-card-name">{room.name}</span>
              </div>
              <span className="room-card-count">{count} 件物品</span>
            </button>
          );
        })}
      </div>

      <BottomNav activeId="rooms" onNavigate={onNavigate} />
    </div>
  );
}
