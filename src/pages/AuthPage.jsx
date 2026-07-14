import { useState } from 'react';
import { message } from 'antd';
import { api } from '../utils/api';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      message.error('请填写用户名和密码');
      return;
    }
    if (mode === 'register') {
      if (password.length < 6) { message.error('密码至少 6 位'); return; }
      if (password !== confirmPassword) { message.error('两次密码不一致'); return; }
    }
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await api.login(username.trim(), password)
        : await api.register(username.trim(), password);
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.username);
      onLogin(res.username);
    } catch (e) {
      message.error(e.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="auth-page">
      {!isLogin && (
        <div className="auth-back" onClick={() => setMode('login')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div className={`auth-logo-wrap ${isLogin ? 'auth-logo-wrap--lg' : ''}`}>
        <div className={`auth-logo ${isLogin ? 'auth-logo--lg' : ''}`}>
          <svg width={isLogin ? 48 : 38} height={isLogin ? 48 : 38} viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="4" fill="none" />
            <path d="M24 8L40 16V32L24 40L8 32V16L24 8Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M24 8V40M8 16L24 24L40 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        {isLogin && (
          <div className="auth-title-wrap">
            <h1 className="auth-title">物品整理</h1>
            <p className="auth-subtitle">登录你的账号</p>
          </div>
        )}
        {!isLogin && <h1 className="auth-title">创建新账号</h1>}
      </div>

      <div className="auth-form">
        <input
          className="auth-input"
          placeholder={isLogin ? '用户名' : '用户名'}
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        <div className="auth-input-wrap">
          <input
            className="auth-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button type="button" className="auth-eye" onClick={() => setShowPassword(v => !v)}>
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#71717a" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" stroke="#71717a" strokeWidth="2" />
              </svg>
            )}
          </button>
        </div>

        {!isLogin && (
          <div className="auth-input-wrap">
            <input
              className="auth-input"
              type={showConfirm ? 'text' : 'password'}
              placeholder="确认密码"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button type="button" className="auth-eye" onClick={() => setShowConfirm(v => !v)}>
              {showConfirm ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
                  <line x1="1" y1="1" x2="23" y2="23" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#71717a" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="#71717a" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>
        )}

        <button
          type="button"
          className="auth-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '请稍候...' : isLogin ? '登录' : '注册'}
        </button>
      </div>

      <div className="auth-footer">
        <p className="auth-switch">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button type="button" className="auth-switch-btn" onClick={() => {
            setMode(isLogin ? 'register' : 'login');
            setPassword('');
            setConfirmPassword('');
          }}>
            {isLogin ? '立即注册' : '立即登录'}
          </button>
        </p>
        <div className="auth-home-indicator" />
      </div>
    </div>
  );
}
