import React, { useEffect, useState, useMemo } from 'react'
import { Typography, Button, Skeleton } from 'antd'
import {
  AppstoreOutlined, RightOutlined, FireOutlined, ClockCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../api/request'
import { useAuth } from '../contexts/AuthContext'

interface AppItem {
  id: number
  name: string
  description: string
  icon?: string
  tags?: string
  is_new?: boolean
  installed?: boolean
}

const APP_LOGOS: Record<string, { bg: string; char: string }> = {
  'AI智能助手': { bg: '#111111', char: 'AI' },
  '钉钉': { bg: '#1677FF', char: '钉' },
  '微信': { bg: '#07C160', char: '微' },
  '飞书': { bg: '#3370FF', char: '飞' },
  'Trello': { bg: '#0052CC', char: 'T' },
  'Figma': { bg: '#F24E1E', char: 'F' },
  'Notion': { bg: '#000000', char: 'N' },
  'PostgreSQL': { bg: '#336791', char: 'P' },
  '滴答清单': { bg: '#E31726', char: '滴' },
  'Apollo': { bg: '#311C87', char: 'A' },
  'Jira': { bg: '#0052CC', char: 'J' },
  'Slack': { bg: '#4A154B', char: 'S' },
  '印象笔记': { bg: '#00B98D', char: '印' },
  '抖音': { bg: '#010101', char: '抖' },
  '小红书': { bg: '#FE2C55', char: '小' },
  '知乎': { bg: '#0066FF', char: '知' },
  '支付宝': { bg: '#1677FF', char: '支' },
  '百度网盘': { bg: '#0066FF', char: '百' },
  '美团外卖': { bg: '#FFC300', char: '美', textColor: '#111' },
  '微信读书': { bg: '#111111', char: '读' },
}

const AppIcon: React.FC<{ app: AppItem; size?: number }> = ({ app, size = 44 }) => {
  const logo = APP_LOGOS[app.name]
  const bg = logo?.bg || '#111111'
  const char = logo?.char || app.name.charAt(0)
  const textColor = logo?.textColor || '#fff'
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: textColor,
    }}>
      {char}
    </div>
  )
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [apps, setApps] = useState<AppItem[]>([])
  const [installedApps, setInstalledApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [marketRes, installedRes] = await Promise.all([
          request.get('/market/apps'),
          request.get('/market/installed'),
        ])
        setApps((marketRes as any).data || [])
        setInstalledApps((installedRes as any).data || [])
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const recommended = useMemo(() => {
    return apps.filter(a => (a.tags || '').includes('AI') || a.is_new).slice(0, 4)
  }, [apps])

  const recentlyUsed = useMemo(() => {
    return [...installedApps].reverse().slice(0, 4)
  }, [installedApps])

  const quickCategories = [
    { label: '办公协同', icon: '💼', color: '#1677FF' },
    { label: '开发工具', icon: '🛠', color: '#111111' },
    { label: '快捷应用', icon: '⚡', color: '#FF6B35' },
    { label: '项目管理', icon: '📋', color: '#22C55E' },
  ]

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={4} style={{
          fontSize: 18, fontWeight: 500, color: '#111111',
          margin: 0, letterSpacing: '-0.2px',
        }}>
          欢迎回来，{user?.display_name}
        </Typography.Title>
        <Typography.Text style={{ fontSize: 14, color: '#626260', marginTop: 4, display: 'block' }}>
          让工作更加高效
        </Typography.Text>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: 16 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} active style={{ width: 180, height: 100 }} />)}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div onClick={() => navigate('/market')} className="section-card" style={{
              flex: 1, padding: '16px 20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#111111' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d3cec6' }}
            >
              <FireOutlined style={{ fontSize: 24, color: '#ff5600' }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 500, color: '#111111', lineHeight: 1.2 }}>{apps.length}</div>
                <div style={{ fontSize: 13, color: '#626260' }}>市场应用</div>
              </div>
              <RightOutlined style={{ marginLeft: 'auto', color: '#d3cec6', fontSize: 12 }} />
            </div>
            <div onClick={() => navigate('/my-apps')} className="section-card" style={{
              flex: 1, padding: '16px 20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#111111' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d3cec6' }}
            >
              <AppstoreOutlined style={{ fontSize: 24, color: '#111111' }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 500, color: '#111111', lineHeight: 1.2 }}>{installedApps.length}</div>
                <div style={{ fontSize: 13, color: '#626260' }}>已安装</div>
              </div>
              <RightOutlined style={{ marginLeft: 'auto', color: '#d3cec6', fontSize: 12 }} />
            </div>
          </div>

          {/* Quick Categories */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {quickCategories.map(cat => (
              <div key={cat.label} onClick={() => navigate(`/market?search=${cat.label}`)}
                className="section-card" style={{
                  flex: 1, padding: '14px 16px', cursor: 'pointer', textAlign: 'center',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#111111' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d3cec6' }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111111' }}>{cat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            {/* Main: Recommended */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Recommended Apps */}
              {recommended.length > 0 && (
                <div className="section-card" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Typography.Title level={5} style={{ fontSize: 16, fontWeight: 500, color: '#111111', margin: 0 }}>
                      推荐应用
                    </Typography.Title>
                    <span onClick={() => navigate('/market')} style={{ fontSize: 13, color: '#9c9fa5', cursor: 'pointer' }}>查看全部</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
                    {recommended.map(app => (
                      <div key={app.id} style={{
                        minWidth: 140, padding: 12, borderRadius: 10,
                        background: '#f5f1ec', cursor: 'pointer',
                        border: '1px solid transparent',
                        transition: 'border-color 0.2s',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#111111' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
                      >
                        <AppIcon app={app} size={40} />
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#111111', marginTop: 8 }}>{app.name}</div>
                        <div style={{ fontSize: 11, color: '#7b7b78', marginTop: 2, lineHeight: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recently Used */}
              {recentlyUsed.length > 0 && (
                <div className="section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Typography.Title level={5} style={{ fontSize: 16, fontWeight: 500, color: '#111111', margin: 0 }}>
                      最近使用
                    </Typography.Title>
                    <span onClick={() => navigate('/my-apps')} style={{ fontSize: 13, color: '#9c9fa5', cursor: 'pointer' }}>查看全部</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
                    {recentlyUsed.map(app => (
                      <div key={app.id} style={{
                        minWidth: 120, padding: 12, borderRadius: 10,
                        background: '#f5f1ec', cursor: 'pointer',
                        border: '1px solid transparent',
                        transition: 'border-color 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#111111' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
                      >
                        <AppIcon app={app} size={36} />
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#111111', textAlign: 'center' }}>{app.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Discover */}
            <div style={{ width: 220, flexShrink: 0 }}>
              <div className="section-card" style={{ padding: 16, position: 'sticky', top: 84 }}>
                <Typography.Text style={{ fontSize: 14, fontWeight: 500, color: '#111111', display: 'block', marginBottom: 12 }}>
                  发现优质应用
                </Typography.Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {apps.filter(a => a.is_new).slice(0, 5).map(app => (
                    <div key={app.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                      cursor: 'pointer', borderBottom: '1px solid #ebe7e1',
                    }}
                      onClick={() => navigate('/market')}
                    >
                      <AppIcon app={app} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#111111' }}>{app.name}</div>
                        <div style={{ fontSize: 11, color: '#9c9fa5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app.description}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="default" block size="small" onClick={() => navigate('/market')}
                    style={{ borderRadius: 6, marginTop: 4, borderColor: '#d3cec6', color: '#111111', fontSize: 12 }}>
                    探索更多
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
