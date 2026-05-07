import React, { useEffect, useState } from 'react'
import { Row, Col, Typography, List, Tag, Skeleton } from 'antd'
import { AppstoreOutlined, MessageOutlined, ShopOutlined, ThunderboltOutlined, RightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../api/request'
import { useAuth } from '../contexts/AuthContext'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ installed: 0, sessions: 0, marketApps: 0 })
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true)
      try {
        const [installedRes, marketRes, sessionsRes] = await Promise.all([
          request.get('/market/installed'),
          request.get('/market/apps'),
          request.get('/ai/sessions'),
        ])
        setStats({
          installed: (installedRes as any).data?.length || 0,
          marketApps: (marketRes as any).data?.length || 0,
          sessions: (sessionsRes as any).data?.length || 0,
        })
        setRecentSessions(((sessionsRes as any).data || []).slice(0, 5))
      } catch (e) {
        // ignore
      } finally {
        setPageLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { title: '市场应用', value: stats.marketApps, icon: <ShopOutlined />, color: '#111111', bg: '#f5f1ec', path: '/market' },
    { title: '已安装', value: stats.installed, icon: <AppstoreOutlined />, color: '#111111', bg: '#f5f1ec', path: '/my-apps' },
    { title: '对话记录', value: stats.sessions, icon: <MessageOutlined />, color: '#111111', bg: '#f5f1ec', path: '/chat' },
  ]

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={4} style={{
          fontSize: 18, fontWeight: 500, color: '#111111',
          margin: 0, marginBottom: 4, letterSpacing: '-0.2px',
        }}>
          欢迎回来，{user?.display_name}
        </Typography.Title>
        <Typography.Text style={{ fontSize: 14, color: '#626260' }}>
          今天想探索什么？
        </Typography.Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {statCards.map(card => (
          <Col span={8} key={card.title}>
            <div
              onClick={() => navigate(card.path)}
              style={{
                background: '#ffffff',
                borderRadius: 12,
                padding: '20px 24px',
                cursor: 'pointer',
                border: '1px solid #d3cec6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s, transform 0.2s',
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
                  {pageLoading ? (
                    <Skeleton.Input active size="small" style={{ width: 60, height: 24, marginBottom: 4 }} />
                  ) : (
                    <div style={{ fontSize: 24, fontWeight: 500, color: '#111111', lineHeight: 1.2 }}>{card.value}</div>
                  )}
                  <div style={{ fontSize: 14, color: '#626260', marginTop: 2 }}>{card.title}</div>
                </div>
              </div>
              <RightOutlined style={{ color: '#d3cec6', fontSize: 14 }} />
            </div>
          </Col>
        ))}
        <Col span={8}>
          <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#f5f1ec',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: '#111111',
            }}>
              <ThunderboltOutlined />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#111111' }}>{user?.role === 'admin' ? '管理员' : '员工'}</div>
              <div style={{ fontSize: 14, color: '#626260', marginTop: 2 }}>当前角色</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="section-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Typography.Title level={5} style={{
              fontSize: 16, fontWeight: 500, color: '#111111',
              margin: 0, letterSpacing: '-0.2px',
            }}>
              最近对话
            </Typography.Title>
            <a onClick={() => navigate('/chat')} style={{ color: '#111111', fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}>查看全部</a>
          </div>
          <List
            dataSource={recentSessions}
            renderItem={(item: any) => (
              <List.Item
                onClick={() => navigate(`/chat/${item.id}`)}
                style={{ cursor: 'pointer', padding: '10px 0', borderColor: '#ebe7e1' }}
              >
                <List.Item.Meta
                  title={<span style={{ fontSize: 14, fontWeight: 500, color: '#111111' }}>{item.title}</span>}
                  description={<span style={{ fontSize: 12, color: '#7b7b78' }}>{item.app_name}</span>}
                />
                <Tag style={{ fontSize: 11, background: '#f5f1ec', color: '#626260', border: 'none', borderRadius: 4 }}>
                  {new Date(item.updated_at).toLocaleString()}
                </Tag>
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  )
}

export default Dashboard
