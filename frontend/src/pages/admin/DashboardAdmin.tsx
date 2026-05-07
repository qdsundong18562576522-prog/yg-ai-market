import React, { useEffect, useState } from 'react'
import { Row, Col, Typography } from 'antd'
import { UserOutlined, AppstoreOutlined, CheckCircleOutlined, ShopOutlined, RightOutlined } from '@ant-design/icons'
import request from '../../api/request'
import { useNavigate } from 'react-router-dom'

const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users: 0, apps: 0, activeApps: 0, installs: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, appsRes] = await Promise.all([
          request.get('/users'),
          request.get('/apps'),
        ])
        const users = (usersRes as any).data || []
        const apps = (appsRes as any).data || []
        setStats({
          users: users.length,
          apps: apps.length,
          activeApps: apps.filter((a: any) => a.is_active).length,
          installs: 0,
        })
      } catch { /* ignore */ }
    }
    fetchData()
  }, [])

  const statCards = [
    { title: '员工总数', value: stats.users, icon: <UserOutlined />, color: '#111111', bg: '#f5f1ec', path: '/admin/users' },
    { title: '应用总数', value: stats.apps, icon: <AppstoreOutlined />, color: '#111111', bg: '#f5f1ec', path: '/admin/apps' },
    { title: '已上架', value: stats.activeApps, icon: <CheckCircleOutlined />, color: '#111111', bg: '#f5f1ec', path: '/admin/apps' },
    { title: '安装次数', value: stats.installs, icon: <ShopOutlined />, color: '#111111', bg: '#f5f1ec', path: '/admin/apps' },
  ]

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={4} style={{
          fontSize: 18, fontWeight: 500, color: '#111111',
          margin: 0, marginBottom: 4, letterSpacing: '-0.2px',
        }}>
          管理后台
        </Typography.Title>
        <Typography.Text style={{ fontSize: 14, color: '#626260' }}>
          系统概况和数据总览
        </Typography.Text>
      </div>

      <Row gutter={[24, 24]}>
        {statCards.map(card => (
          <Col span={6} key={card.title}>
            <div
              onClick={() => navigate(card.path)}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '20px 24px',
                cursor: 'pointer',
                border: '1px solid #d3cec6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'border-color 0.25s, transform 0.25s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#111111'
                el.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#d3cec6'
                el.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: '#f5f1ec',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: '#111111', flexShrink: 0,
                }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 500, color: '#111111', lineHeight: 1.2 }}>{card.value}</div>
                  <div style={{ fontSize: 14, color: '#626260', marginTop: 2 }}>{card.title}</div>
                </div>
              </div>
              <RightOutlined style={{ color: '#d3cec6', fontSize: 14 }} />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default DashboardAdmin
