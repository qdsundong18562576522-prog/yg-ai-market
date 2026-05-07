import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Typography, Spin, Button, Popconfirm, message, Empty, Space, Tag } from 'antd'
import { MessageOutlined, DeleteOutlined, RobotOutlined } from '@ant-design/icons'
import request from '../api/request'

const ChatHistory: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/ai/sessions')
      setSessions(res.data || [])
    } catch {
      message.error('获取对话列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSessions() }, [])

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/ai/sessions/${id}`)
      message.success('删除成功')
      fetchSessions()
    } catch {
      message.error('删除失败')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: '#111111',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: '#fff', flexShrink: 0,
        }}>
          <MessageOutlined />
        </div>
        <div>
          <Typography.Title level={4} style={{ fontSize: 18, fontWeight: 500, color: '#111111', margin: 0 }}>
            对话记录
          </Typography.Title>
          <Typography.Text style={{ fontSize: 14, color: '#9c9fa5' }}>
            {loading ? '' : `共 ${sessions.length} 条对话`}
          </Typography.Text>
        </div>
      </div>

      {/* Session List */}
      {loading ? (
        <Spin style={{ display: 'block', margin: '60px auto', color: '#111111' }} />
      ) : sessions.length === 0 ? (
        <div className="section-card" style={{ padding: 80, textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: '#d3cec6', marginBottom: 16 }}>
            <MessageOutlined />
          </div>
          <Typography.Text style={{ fontSize: 16, color: '#626260' }}>
            暂无对话记录，开始使用 AI 应用吧
          </Typography.Text>
        </div>
      ) : (
        <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
          <List
            dataSource={sessions}
            locale={{ emptyText: <Empty description="暂无对话记录" /> }}
            renderItem={(item: any) => (
              <List.Item
                style={{
                  cursor: 'pointer',
                  padding: '14px 20px',
                  transition: 'background 0.15s',
                  borderColor: '#ebe7e1',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f1ec' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                onClick={() => navigate(`/chat/${item.id}`)}
                actions={[
                  <Popconfirm
                    title="确定删除？"
                    onConfirm={(e) => { e?.stopPropagation(); handleDelete(item.id) }}
                    key="delete"
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      style={{ borderRadius: 6 }}
                    />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<RobotOutlined style={{ fontSize: 20, color: '#111111', padding: 4 }} />}
                  title={<span style={{ fontSize: 14, fontWeight: 500, color: '#111111' }}>{item.title}</span>}
                  description={
                    <Space size={8}>
                      <Tag style={{ background: '#f5f1ec', color: '#111111', border: 'none', borderRadius: 4, fontSize: 11 }}>
                        {item.app_name}
                      </Tag>
                      <span style={{ color: '#9c9fa5', fontSize: 12 }}>{new Date(item.updated_at).toLocaleString()}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  )
}

export default ChatHistory
