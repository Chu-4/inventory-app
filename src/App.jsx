import { useState, useCallback } from 'react';
import { ConfigProvider, theme } from 'antd';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import RoomsPage from './pages/RoomsPage';
import ProfilePage from './pages/ProfilePage';
import ItemListPage from './pages/ItemListPage';
import ItemViewPage from './pages/ItemViewPage';
import ItemFormPage from './pages/ItemFormPage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import TimeBrowsePage from './pages/TimeBrowsePage';

const TAB_PAGES = ['home', 'categories', 'rooms', 'profile'];

const HOME_NAV = { page: 'home', categoryId: null, roomId: null, itemId: null };

function buildNav(page, data = {}, prev = {}) {
  return {
    page,
    categoryId: data.categoryId !== undefined ? data.categoryId : prev.categoryId ?? null,
    roomId: data.roomId !== undefined ? data.roomId : prev.roomId ?? null,
    itemId: data.itemId !== undefined ? data.itemId : prev.itemId ?? null,
  };
}

export default function App() {
  const [nav, setNav] = useState(HOME_NAV);
  const [history, setHistory] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const navigateTo = useCallback((page, data = {}, options = {}) => {
    if (TAB_PAGES.includes(page)) {
      setHistory([]);
      setNav(buildNav(page, data, HOME_NAV));
      return;
    }
    if (!options.replace) {
      setHistory(h => [...h, nav]);
    }
    setNav(prev => buildNav(page, data, prev));
  }, [nav]);

  const goBack = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) {
        setNav(HOME_NAV);
        return h;
      }
      const prev = h[h.length - 1];
      setNav(prev);
      return h.slice(0, -1);
    });
  }, []);

  const { page: currentPage, categoryId: selectedCategoryId, roomId: selectedRoomId, itemId: selectedItemId } = nav;

  const renderPage = () => {
    const key = refreshKey;
    const navProps = { onNavigate: navigateTo, onBack: goBack };
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigateTo} key={key} />;
      case 'categories':
        return <CategoriesPage onNavigate={navigateTo} key={key} />;
      case 'rooms':
        return <RoomsPage onNavigate={navigateTo} key={key} />;
      case 'profile':
        return <ProfilePage onNavigate={navigateTo} onRefresh={handleRefresh} key={key} />;
      case 'search':
        return <SearchPage {...navProps} key={key} />;
      case 'favorites':
        return <FavoritesPage {...navProps} onRefresh={handleRefresh} key={key} />;
      case 'time-browse':
        return <TimeBrowsePage {...navProps} key={key} />;
      case 'all-items':
        return <ItemListPage listType="all" {...navProps} key={key} />;
      case 'room-items':
        return <ItemListPage listType="room" roomId={selectedRoomId} {...navProps} key={key} />;
      case 'category-items':
        return <ItemListPage listType="category" categoryId={selectedCategoryId} {...navProps} key={key} />;
      case 'item-detail':
        return <ItemViewPage itemId={selectedItemId} {...navProps} onRefresh={handleRefresh} key={key} />;
      case 'item-add':
        return (
          <ItemFormPage
            categoryId={selectedCategoryId}
            roomId={selectedRoomId}
            {...navProps}
            onRefresh={handleRefresh}
            key={key}
          />
        );
      case 'item-edit':
        return (
          <ItemFormPage
            itemId={selectedItemId}
            {...navProps}
            onRefresh={handleRefresh}
            key={key}
          />
        );
      default:
        return <HomePage onNavigate={navigateTo} key={key} />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#e67e22',
          colorBgBase: '#faf9f7',
          borderRadius: 12,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
          colorBorder: '#e5e5ea',
          colorText: '#1a1a1a',
          colorTextSecondary: '#636366',
          controlHeight: 48,
        },
      }}
    >
      <div className="app-shell">
        <div className="app-content">
          {renderPage()}
        </div>
      </div>
    </ConfigProvider>
  );
}
