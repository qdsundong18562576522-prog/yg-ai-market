import React, { useEffect, useState } from 'react'
import { Input, Select, Typography, message, Spin, Empty } from 'antd'
import { SearchOutlined, FireOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import request from '../api/request'
import AppCard from '../components/AppCard'
import CarouselBanner from '../components/CarouselBanner'

const AppMarket: React.FC = () => {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [tagFilter, setTagFilter] = useState('')

  const fetchApps = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/market/apps')
      setApps(res.data || [])
    } catch {
      message.error('获取应用列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApps() }, [])

  useEffect(() => {
    const s = searchParams.get('search')
    if (s) setSearch(s)
  }, [searchParams])

  const handleInstall = async (appId: number) => {
    try {
      await request.post(`/market/apps/${appId}/install`)
      message.success('安装成功')
      fetchApps()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '安装失败')
    }
  }

  const allTags = [...new Set(apps.flatMap(a => (a.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)))]

  const filteredApps = apps.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.description.toLowerCase().includes(search.toLowerCase())) return false
    if (tagFilter && !(a.tags || '').includes(tagFilter)) return false
    return true
  })

  return (
    <div>
      {/* Carousel Banner */}
      <div style={{ marginBottom: 24 }}>
        <CarouselBanner items={[]} />
      </div>

      {/* Search & Filter */}
      <div className="section-card" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FireOutlined style={{ color: '#ff5600', fontSize: 18 }} />
          <Typography.Text style={{ fontSize: 16, fontWeight: 500, color: '#111111' }}>全部应用</Typography.Text>
          <Typography.Text style={{ fontSize: 14, color: '#9c9fa5' }}>({filteredApps.length})</Typography.Text>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#9c9fa5' }} />}
            placeholder="搜索应用名称或描述..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 260, height: 40, borderRadius: 8, background: '#f5f1ec', border: '1px solid #d3cec6' }}
          />
          <Select
            placeholder="全部标签"
            value={tagFilter || undefined}
            onChange={setTagFilter}
            allowClear
            style={{ width: 140 }}
            onClear={() => setTagFilter('')}
          >
            {allTags.map(tag => <Select.Option key={tag} value={tag}>{tag}</Select.Option>)}
          </Select>
        </div>
      </div>

      {/* App Grid */}
      {loading ? (
        <Spin style={{ display: 'block', margin: '60px auto', color: '#111111' }} />
      ) : filteredApps.length === 0 ? (
        <div className="section-card" style={{ padding: 80, textAlign: 'center' }}>
          <Empty description={
            <span style={{ color: '#7b7b78' }}>暂无匹配的应用</span>
          } />
        </div>
      ) : (
        <div className="app-grid">
          {filteredApps.map(app => (
            <AppCard
              key={app.id}
              app={{
                ...app,
                rating: app.rating || 4,
                is_new: app.is_new ?? true,
              }}
              onInstall={handleInstall}
              mode="market"
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AppMarket
