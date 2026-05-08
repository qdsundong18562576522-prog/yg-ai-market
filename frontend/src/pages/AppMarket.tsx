import React, { useEffect, useState, useMemo } from 'react'
import { Input, Typography, message, Spin, Button, Tag } from 'antd'
import { SearchOutlined, DownloadOutlined, PlayCircleOutlined, CheckCircleOutlined, FireOutlined, RightOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import request from '../api/request'

interface AppItem {
  id: number
  name: string
  description: string
  icon?: string
  tags?: string
  rating?: number
  is_new?: boolean
  installed?: boolean
  access_mode?: string
  access_url?: string
}

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: '办公协同', label: '办公协同', icon: '💼' },
  { key: '快捷应用', label: '快捷应用', icon: '⚡' },
  { key: '项目管理', label: '项目管理', icon: '📋' },
  { key: '开发工具', label: '开发工具', icon: '🛠' },
  { key: '数据分析', label: '数据分析', icon: '📊' },
  { key: '客户管理', label: '客户管理', icon: '👥' },
  { key: '财务管理', label: '财务管理', icon: '💰' },
  { key: '即时通讯', label: '即时通讯', icon: '💬' },
  { key: 'AI', label: 'AI 智能', icon: '🤖' },
]

const APP_LOGOS: Record<string, { bg: string; char: string; textColor?: string }> = {
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

const AppIcon: React.FC<{ app: AppItem; size?: number }> = ({ app, size = 48 }) => {
  const logo = APP_LOGOS[app.name]
  const bg = logo?.bg || '#111111'
  const char = logo?.char || app.name.charAt(0)
  const textColor = logo?.textColor || '#fff'
  const borderRadius = size > 44 ? 14 : 10
  return (
    <div style={{
      width: size, height: size, borderRadius, flexShrink: 0,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 600, color: textColor,
      overflow: 'hidden',
    }}>
      {char}
    </div>
  )
}

const AppMarket: React.FC = () => {
  const [apps, setApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [activeCategory, setActiveCategory] = useState('all')
  const [installing, setInstalling] = useState<number | null>(null)

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
    setInstalling(appId)
    try {
      await request.post(`/market/apps/${appId}/install`)
      message.success('安装成功')
      fetchApps()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '安装失败')
    } finally {
      setInstalling(null)
    }
  }

  const handleOpen = (app: AppItem) => {
    if (app.access_mode === 'external_link' && app.access_url) {
      window.open(app.access_url, '_blank')
    }
  }

  const filteredApps = useMemo(() => {
    let result = apps
    if (activeCategory !== 'all') {
      result = result.filter(app => {
        const tags = (app.tags || '').split(',').map(t => t.trim()).filter(Boolean)
        return tags.includes(activeCategory)
      })
    }
    if (search) {
      result = result.filter(a =>
        a.name.includes(search) || a.description.includes(search)
      )
    }
    return result
  }, [apps, activeCategory, search])

  const featuredApps = useMemo(() => {
    return apps.filter(a => a.is_new).slice(0, 4)
  }, [apps])

  const recommendedApps = useMemo(() => {
    return apps.filter(a => (a.tags || '').includes('AI') || a.is_new).slice(0, 6)
  }, [apps])

  return (
    <div style={{ margin: '-24px', minHeight: 'calc(100vh - 60px)' }}>
      {/* ===== Purple Gradient Hero ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 48px 60px',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Title & subtitle */}
          <Typography.Title level={2} style={{ color: '#fff', margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.3px' }}>
            应用市场
          </Typography.Title>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, display: 'block', marginTop: 6, marginBottom: 28 }}>
            发现优质应用，提升工作效率
          </Typography.Text>

          {/* Search Bar */}
          <div style={{
            maxWidth: 520, background: '#fff', borderRadius: 12,
            display: 'flex', alignItems: 'center', padding: '4px 4px 4px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}>
            <SearchOutlined style={{ color: '#9c9fa5', fontSize: 16 }} />
            <Input
              placeholder="搜索应用 / 功能"
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              variant="borderless"
              style={{ fontSize: 15, height: 44, paddingLeft: 10, flex: 1 }}
            />
            <Button
              type="primary"
              style={{
                borderRadius: 8, height: 36, padding: '0 20px',
                background: '#111111', borderColor: '#111111',
                fontWeight: 500,
              }}
            >
              搜索
            </Button>
          </div>

          {/* Category Chips */}
          <div style={{
            display: 'flex', gap: 8, marginTop: 24,
            overflowX: 'auto', paddingBottom: 4, flexWrap: 'nowrap',
          }}>
            {CATEGORIES.map(cat => (
              <div
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  padding: '6px 18px', borderRadius: 20, cursor: 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                  background: activeCategory === cat.key ? '#fff' : 'rgba(255,255,255,0.18)',
                  color: activeCategory === cat.key ? '#667eea' : 'rgba(255,255,255,0.9)',
                  fontSize: 13, fontWeight: activeCategory === cat.key ? 600 : 500,
                  backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {cat.icon && <span style={{ fontSize: 14 }}>{cat.icon}</span>}
                {cat.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Content Area (white bg) ===== */}
      <div style={{ background: '#ffffff', padding: '24px 48px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {loading ? (
            <Spin style={{ display: 'block', margin: '80px auto' }} />
          ) : (
            <>
              {/* ===== Featured Apps (Horizontal Scroll) ===== */}
              {activeCategory === 'all' && !search && featuredApps.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <FireOutlined style={{ color: '#ff5600', fontSize: 18 }} />
                    <Typography.Title level={5} style={{ fontSize: 16, fontWeight: 600, color: '#111111', margin: 0 }}>
                      精选推荐
                    </Typography.Title>
                  </div>
                  <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                    {featuredApps.map(app => (
                      <div
                        key={app.id}
                        style={{
                          minWidth: 200, borderRadius: 12,
                          border: '1px solid #ebe7e1',
                          overflow: 'hidden', cursor: 'pointer',
                          transition: 'box-shadow 0.2s, transform 0.2s',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLElement
                          el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
                          el.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLElement
                          el.style.boxShadow = 'none'
                          el.style.transform = 'translateY(0)'
                        }}
                        onClick={() => handleOpen(app)}
                      >
                        {/* Card Top - gradient bg with icon */}
                        <div style={{
                          height: 80,
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <AppIcon app={app} size={44} />
                        </div>
                        {/* Card Body */}
                        <div style={{ padding: '10px 14px 14px' }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#111111' }}>{app.name}</div>
                          <div style={{ fontSize: 12, color: '#7b7b78', marginTop: 2, lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {app.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== Light Blue Banner ===== */}
              {activeCategory === 'all' && !search && (
                <div style={{
                  background: 'linear-gradient(135deg, #e8f4f8, #d4edf7)',
                  borderRadius: 12, padding: '20px 24px', marginBottom: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <Typography.Text style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', display: 'block' }}>
                      🚀 发现更多高效工具
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: 13, color: '#4a5568', marginTop: 2, display: 'block' }}>
                      浏览全部分类，找到适合你的应用
                    </Typography.Text>
                  </div>
                  <Tag color="blue" style={{ borderRadius: 20, padding: '2px 14px', fontSize: 12, cursor: 'pointer', margin: 0 }}
                    onClick={() => document.querySelector('.categories-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    查看全部 →
                  </Tag>
                </div>
              )}

              {/* ===== Recommended Apps Row ===== */}
              {activeCategory === 'all' && !search && recommendedApps.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Typography.Title level={5} style={{ fontSize: 16, fontWeight: 600, color: '#111111', margin: 0 }}>
                      推荐应用
                    </Typography.Title>
                    <span style={{ fontSize: 13, color: '#667eea', cursor: 'pointer', fontWeight: 500 }}>查看更多 <RightOutlined style={{ fontSize: 11 }} /></span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
                    {recommendedApps.map(app => (
                      <div key={app.id} style={{
                        minWidth: 150, padding: 14, borderRadius: 12,
                        background: '#f8f9fa', cursor: 'pointer',
                        border: '1px solid #ebe7e1',
                        transition: 'border-color 0.2s, transform 0.2s',
                        flexShrink: 0,
                      }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = '#667eea'
                          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = '#ebe7e1'
                          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                        }}
                        onClick={() => handleOpen(app)}
                      >
                        <AppIcon app={app} size={40} />
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#111111', marginTop: 8 }}>{app.name}</div>
                        <div style={{ fontSize: 11, color: '#7b7b78', marginTop: 2, lineHeight: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {app.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== All Apps Grid ===== */}
              <div className="categories-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 3, height: 18, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 2 }} />
                  <Typography.Title level={4} style={{ fontSize: 18, fontWeight: 600, color: '#111111', margin: 0 }}>
                    {activeCategory === 'all' ? '全部应用' : CATEGORIES.find(c => c.key === activeCategory)?.label || '应用'}
                  </Typography.Title>
                  <Typography.Text style={{ fontSize: 13, color: '#9c9fa5', marginLeft: 4 }}>
                    {filteredApps.length} 个
                  </Typography.Text>
                </div>

                {filteredApps.length === 0 ? (
                  <div style={{ padding: 80, textAlign: 'center', background: '#f8f9fa', borderRadius: 12, border: '1px solid #ebe7e1' }}>
                    <div style={{ fontSize: 48, color: '#d3cec6', marginBottom: 16 }}>
                      <SearchOutlined />
                    </div>
                    <Typography.Text style={{ color: '#7b7b78', fontSize: 15, display: 'block' }}>
                      暂无匹配的应用
                    </Typography.Text>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                    {filteredApps.map(app => (
                      <div key={app.id} style={{
                        borderRadius: 12,
                        border: '1px solid #ebe7e1',
                        background: '#fff',
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                        position: 'relative',
                      }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'
                          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = 'none'
                          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                        }}
                      >
                        {/* New badge */}
                        {app.is_new && (
                          <div style={{
                            position: 'absolute', top: 8, right: 8,
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: '#fff', borderRadius: 4, fontSize: 10,
                            padding: '0 7px', lineHeight: '18px', fontWeight: 500,
                          }}>
                            NEW
                          </div>
                        )}

                        <AppIcon app={app} size={56} />
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#111111', marginTop: 10, textAlign: 'center' }}>
                          {app.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#7b7b78', marginTop: 2, textAlign: 'center', lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          {app.description}
                        </div>

                        {/* Tags */}
                        {(app.tags || '').split(',').filter(Boolean).slice(0, 2).length > 0 && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {(app.tags || '').split(',').filter(Boolean).slice(0, 2).map(tag => (
                              <span key={tag} style={{ fontSize: 10, color: '#7b7b78', background: '#f5f1ec', padding: '0 6px', borderRadius: 4, lineHeight: '18px' }}>
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Install / Open */}
                        <div style={{ marginTop: 'auto', paddingTop: 10, width: '100%' }}>
                          {!app.installed ? (
                            <Button
                              block
                              size="small"
                              icon={<DownloadOutlined />}
                              loading={installing === app.id}
                              onClick={(e) => { e.stopPropagation(); handleInstall(app.id) }}
                              style={{
                                borderRadius: 6, height: 30, fontSize: 12,
                                borderColor: '#667eea', color: '#667eea',
                              }}
                            >
                              安装
                            </Button>
                          ) : app.access_mode === 'external_link' ? (
                            <Button
                              block
                              size="small"
                              icon={<PlayCircleOutlined />}
                              onClick={(e) => { e.stopPropagation(); handleOpen(app) }}
                              style={{
                                borderRadius: 6, height: 30, fontSize: 12,
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderColor: 'transparent', color: '#fff',
                              }}
                            >
                              打开
                            </Button>
                          ) : (
                            <Button
                              block
                              size="small"
                              icon={<CheckCircleOutlined />}
                              disabled
                              style={{ borderRadius: 6, height: 30, fontSize: 12 }}
                            >
                              已安装
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AppMarket
