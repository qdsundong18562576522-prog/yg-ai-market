import React, { useEffect, useState } from 'react'
import { Button, Typography, message, Spin, Empty, Popconfirm } from 'antd'
import { AppstoreOutlined, DownloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../api/request'
import AppCard from '../components/AppCard'

const MyApps: React.FC = () => {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uninstalling, setUninstalling] = useState<number | null>(null)
  const navigate = useNavigate()

  const fetchApps = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/market/installed')
      setApps(res.data || [])
    } catch {
      message.error('获取应用列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApps() }, [])

  const handleUninstall = async (appId: number) => {
    setUninstalling(appId)
    try {
      await request.delete(`/market/apps/${appId}/install`)
      message.success('卸载成功')
      fetchApps()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '卸载失败')
    } finally {
      setUninstalling(null)
    }
  }

  const handleOpen = (app: any) => {
    if (app.access_mode === 'external_link' && app.access_url) {
      window.open(app.access_url, '_blank')
    } else {
      navigate(`/app/${app.id}`)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="section-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#fff', flexShrink: 0,
          }}>
            <AppstoreOutlined />
          </div>
          <div>
            <Typography.Title level={4} style={{ fontSize: 18, fontWeight: 500, color: '#111111', margin: 0 }}>
              我的应用
            </Typography.Title>
            <Typography.Text style={{ fontSize: 14, color: '#9c9fa5' }}>
              {loading ? '' : `共 ${apps.length} 个应用`}
            </Typography.Text>
          </div>
        </div>
        <Button type="default" ghost onClick={() => navigate('/market')} icon={<DownloadOutlined />} style={{ borderRadius: 8, borderColor: '#d3cec6', color: '#111111' }}>
          去应用市场
        </Button>
      </div>

      {/* App Grid */}
      {loading ? (
        <Spin style={{ display: 'block', margin: '60px auto', color: '#111111' }} />
      ) : apps.length === 0 ? (
        <div className="section-card" style={{ padding: 80, textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: '#d3cec6', marginBottom: 16 }}>
            <AppstoreOutlined />
          </div>
          <Typography.Text style={{ fontSize: 16, color: '#626260', display: 'block', marginBottom: 20 }}>
            尚未安装任何应用
          </Typography.Text>
          <Button type="primary" size="large" onClick={() => navigate('/market')} style={{ borderRadius: 8, height: 40, padding: '0 24px' }}>
            去应用市场探索
          </Button>
        </div>
      ) : (
        <div className="app-grid">
          {apps.map(app => (
            <div key={app.id} style={{ position: 'relative' }}>
              <AppCard
                app={{
                  ...app,
                  rating: app.rating || 4,
                  is_new: false,
                }}
                onOpen={handleOpen}
                mode="installed"
              />
              <Popconfirm
                title="卸载应用"
                description={`确定卸载「${app.name}」吗？`}
                onConfirm={() => handleUninstall(app.id)}
                okText="卸载"
                cancelText="取消"
                okButtonProps={{ danger: true, loading: uninstalling === app.id }}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  style={{
                    position: 'absolute',
                    top: -6, right: -6,
                    width: 22, height: 22, minWidth: 22,
                    borderRadius: '50%',
                    background: '#fff',
                    border: '1px solid #d3cec6',
                    fontSize: 14,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    opacity: 0.6,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6' }}
                  onClick={e => e.stopPropagation()}
                >
                  ×
                </Button>
              </Popconfirm>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyApps
