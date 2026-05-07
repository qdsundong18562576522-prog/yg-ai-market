import React from 'react'
import { Button, Rate } from 'antd'
import { CheckCircleOutlined, PlayCircleOutlined } from '@ant-design/icons'

export interface AppCardData {
  id: number
  name: string
  description: string
  icon?: string
  tags?: string
  rating?: number
  is_new?: boolean
  installed?: boolean
  access_mode?: string
}

interface AppCardProps {
  app: AppCardData
  onInstall?: (id: number) => void
  onOpen?: (app: AppCardData) => void
  mode?: 'market' | 'installed'
}

const AppCard: React.FC<AppCardProps> = ({ app, onInstall, onOpen, mode = 'market' }) => {
  const tags = (app.tags || '').split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div style={{
      width: 180,
      height: 220,
      borderRadius: 12,
      background: '#ffffff',
      border: '1px solid #d3cec6',
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'border-color 0.2s, transform 0.2s',
      position: 'relative',
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
      onClick={() => mode === 'installed' && onOpen && onOpen(app)}
    >
      {/* New badge */}
      {app.is_new && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          background: '#ff5600', color: '#fff',
          borderRadius: 4, fontSize: 10, lineHeight: '18px',
          padding: '0 6px', fontWeight: 500,
        }}>
          NEW
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 14, marginTop: 4,
        background: app.icon ? 'transparent' : '#111111',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color: '#fff', fontWeight: 600, overflow: 'hidden', flexShrink: 0,
      }}>
        {app.icon ? <img src={app.icon} alt={app.name} style={{ width: 64, height: 64, borderRadius: 14 }} /> : app.name.charAt(0)}
      </div>

      {/* App Name */}
      <div style={{
        fontSize: 16, fontWeight: 500, color: '#111111', marginTop: 10,
        textAlign: 'center', lineHeight: '22px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 156,
      }}>
        {app.name}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 14, color: '#7b7b78', marginTop: 2,
        textAlign: 'center', lineHeight: '20px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 156,
      }}>
        {app.description}
      </div>

      {/* Rating */}
      <Rate disabled defaultValue={app.rating || 0} count={5} style={{ fontSize: 12, marginTop: 'auto', color: '#ff5600' }} />

      {/* Tags row */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {tags.slice(0, 2).map(tag => (
            <span key={tag} style={{
              fontSize: 10, color: '#7b7b78', background: '#f5f1ec',
              padding: '0 6px', borderRadius: 4, lineHeight: '18px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Button */}
      {mode === 'market' && (
        <Button
          type={app.installed ? 'default' : 'primary'}
          size="small"
          icon={app.installed ? <CheckCircleOutlined /> : undefined}
          disabled={app.installed}
          onClick={(e) => { e.stopPropagation(); !app.installed && onInstall?.(app.id) }}
          style={{
            height: 28, borderRadius: 6, fontSize: 12, marginTop: 6, padding: '0 12px',
            ...(app.installed ? {} : { background: '#111111', borderColor: '#111111' }),
          }}
        >
          {app.installed ? '已安装' : '安装'}
        </Button>
      )}
      {mode === 'installed' && (
        <Button
          type="primary"
          size="small"
          icon={<PlayCircleOutlined />}
          onClick={(e) => { e.stopPropagation(); onOpen?.(app) }}
          style={{ height: 28, borderRadius: 6, fontSize: 12, marginTop: 6, padding: '0 12px', background: '#111111', borderColor: '#111111' }}
        >
          打开
        </Button>
      )}
    </div>
  )
}

export default AppCard
