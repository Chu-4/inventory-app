import {
  HomeOutlined,
  AppstoreOutlined,
  InboxOutlined,
  UserOutlined,
} from '@ant-design/icons';

const NAV_ITEMS = [
  { id: 'home', label: '首页', Icon: HomeOutlined },
  { id: 'categories', label: '分类', Icon: AppstoreOutlined },
  { id: 'rooms', label: '房间', Icon: InboxOutlined },
  { id: 'profile', label: '我的', Icon: UserOutlined },
];

export default function BottomNav({ activeId, onNavigate }) {
  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeId === id;
          return (
            <button
              key={id}
              type="button"
              className={`bottom-nav-item${active ? ' active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              <Icon className="bottom-nav-icon" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
