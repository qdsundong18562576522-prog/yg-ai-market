import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Dropdown, Input, Space, Avatar } from 'antd'
import {
  HomeOutlined, ShopOutlined, AppstoreOutlined, MessageOutlined,
  SettingOutlined, UserOutlined, FileTextOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined, SearchOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Header, Sider, Content } = AntLayout

const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    { key: 'info', label: <span><UserOutlined /> {user?.display_name} ({user?.department || '未设置部门'})</span>, disabled: true },
    { type: 'divider' as any },
    { key: 'logout', label: <span><LogoutOutlined /> 退出登录</span>, onClick: handleLogout },
  ]

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/market', icon: <ShopOutlined />, label: '应用市场' },
    { key: '/my-apps', icon: <AppstoreOutlined />, label: '我的应用' },
    { key: '/chat', icon: <MessageOutlined />, label: '对话记录' },
  ]

  if (user?.role === 'admin') {
    menuItems.push(
      { type: 'divider' as any, dashed: true, style: { margin: '4px 0', borderColor: '#ebe7e1' } },
      { key: 'admin-group', type: 'group' as any, label: <span style={{ fontSize: 11, color: '#9c9fa5', paddingLeft: 8 }}>管理</span> },
      { key: '/admin', icon: <SettingOutlined />, label: '管理后台' },
      { key: '/admin/users', icon: <UserOutlined />, label: '员工管理' },
      { key: '/admin/apps', icon: <FileTextOutlined />, label: '应用管理' },
    )
  }

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/') return '/'
    if (path.startsWith('/market')) return '/market'
    if (path.startsWith('/my-apps')) return '/my-apps'
    if (path.startsWith('/chat')) return '/chat'
    if (path.startsWith('/admin/users')) return '/admin/users'
    if (path.startsWith('/admin/apps')) return '/admin/apps'
    if (path.startsWith('/admin')) return '/admin'
    return '/'
  }

  const siderWidth = collapsed ? 64 : 220

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#f5f1ec' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={220}
        style={{
          borderRight: '1px solid #d3cec6',
          background: '#fff',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #ebe7e1',
          padding: '0 16px',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            YG
          </div>
          {!collapsed && (
            <div style={{ marginLeft: 10, fontSize: 16, fontWeight: 600, color: '#111111', whiteSpace: 'nowrap' }}>
              扬光AI商城
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          defaultOpenKeys={['/admin']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 4 }}
        />
      </Sider>

      {/* Main area */}
      <AntLayout style={{ marginLeft: siderWidth, transition: 'margin-left 0.2s', background: '#f5f1ec' }}>
        {/* Top Navbar */}
        <Header style={{
          background: '#f5f1ec',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #d3cec6',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ width: 36, height: 36, color: '#626260' }}
            />
          </Space>

          {/* Center search */}
          <Input
            prefix={<SearchOutlined style={{ color: '#9c9fa5', fontSize: 14 }} />}
            placeholder="搜索应用..."
            style={{ width: 360, height: 40, borderRadius: 8, background: '#ffffff', border: '1px solid #d3cec6', fontSize: 14 }}
            onPressEnter={(e) => {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val) navigate(`/market?search=${encodeURIComponent(val)}`)
            }}
          />

          {/* Right actions */}
          <Space size={12}>
            <Button type="text" icon={<BellOutlined />} style={{ width: 36, height: 36, color: '#626260' }} />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer', padding: '2px 8px', borderRadius: 8, background: '#ffffff', border: '1px solid #ebe7e1' }}>
                <Avatar size={28} style={{ background: '#111111', fontSize: 12 }}>
                  {user?.display_name?.charAt(0) || 'U'}
                </Avatar>
                <span style={{ fontSize: 14, color: '#111111', fontWeight: 500 }}>{user?.display_name}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Page Content */}
        <Content style={{ margin: 0, padding: 24, minHeight: 'calc(100vh - 60px)', background: '#f5f1ec' }}>
          <div className="page-container">
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
