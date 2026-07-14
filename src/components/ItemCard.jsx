import { HeartFilled } from '@ant-design/icons';
import { EnvironmentOutlined } from '@ant-design/icons';
import { formatPrice } from '../utils/helpers';

export default function ItemCard({
  item,
  onClick,
  variant = 'default',
  showFavorite = false,
  onToggleFavorite,
  categories = [],
  rooms = [],
}) {
  const category = categories.find(c => c.id === item.categoryId);
  const room = rooms.find(r => r.id === item.roomId);

  if (variant === 'search') {
    return (
      <div className="item-card item-card--search" onClick={onClick} role="button" tabIndex={0}>
        <div className="item-card-thumb">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" />
          ) : (
            <div className="item-card-thumb-placeholder" />
          )}
        </div>
        <div className="item-card-body">
          <div className="item-card-name">{item.name}</div>
          <div className="item-card-tags">
            {category && <span className="tag tag--orange">{category.name}</span>}
            {room && <span className="tag tag--gray">{room.name}</span>}
          </div>
        </div>
        {item.price ? (
          <div className="item-card-price">¥{formatPrice(item.price)}</div>
        ) : null}
      </div>
    );
  }

  if (variant === 'favorite') {
    return (
      <div className="item-card item-card--favorite" onClick={onClick} role="button" tabIndex={0}>
        <div className="item-card-thumb">
          {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="item-card-thumb-placeholder" />}
        </div>
        <div className="item-card-body">
          <div className="item-card-name">{item.name}</div>
          <div className="item-card-tags">
            {category && <span className="tag tag--neutral">{category.name}</span>}
            {room && <span className="tag tag--neutral">{room.name}</span>}
          </div>
          {item.price ? <div className="item-card-price">¥{formatPrice(item.price)}</div> : null}
        </div>
        {showFavorite && (
          <button
            type="button"
            className="item-card-heart"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(item.id); }}
          >
            <HeartFilled style={{ color: '#e67e22', fontSize: 20 }} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="item-card item-card--default" onClick={onClick} role="button" tabIndex={0}>
      <div className="item-card-thumb">
        {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="item-card-thumb-placeholder" />}
      </div>
      <div className="item-card-body">
        <div className="item-card-name">{item.name}</div>
        {room && (
          <div className="item-card-room">
            <EnvironmentOutlined style={{ fontSize: 12 }} />
            <span>{room.name}</span>
          </div>
        )}
        <div className="item-card-meta">
          {item.price ? <span className="item-card-price">¥{formatPrice(item.price)}</span> : <span />}
          {item.date && <span className="item-card-date">{item.date}</span>}
        </div>
      </div>
    </div>
  );
}
