import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Spin, message, Button, Space, Avatar } from 'antd'
import { ArrowLeftOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons'
import request from '../api/request'

const ChatDetail: React.FC = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res: any = await request.get(`/ai/sessions/${sessionId}`)
        setSession(res.data.session)
        setMessages(res.data.messages || [])
      } catch {
        message.error('获取对话详情失败')
        navigate('/chat')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [sessionId, navigate])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>
  if (!session) return null

  return (
    <div>
      {/* Header */}
      <div className="section-card" style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/chat')} type="text" style={{ color: '#626260', width: 36, height: 36 }} />
          <div>
            <Typography.Title level={5} style={{ fontSize: 16, fontWeight: 500, color: '#111111', margin: 0 }}>
              {session.title}
            </Typography.Title>
            <Typography.Text style={{ fontSize: 13, color: '#9c9fa5' }}>{session.app_name}</Typography.Text>
          </div>
        </Space>
      </div>

      {/* Messages */}
      <div className="section-card" style={{ padding: 24, background: '#faf9f7' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9c9fa5' }}>暂无消息</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} style={{
              marginBottom: 16,
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{ display: 'flex', gap: 8, maxWidth: '70%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar
                  size={32}
                  style={{
                    flexShrink: 0,
                    background: msg.role === 'user' ? '#111111' : '#f5f1ec',
                    color: msg.role === 'user' ? '#fff' : '#111111',
                  }}
                  icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                />
                <div style={{
                  padding: '10px 16px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user' ? '#111111' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#111111',
                  whiteSpace: 'pre-wrap',
                  fontSize: 14,
                  lineHeight: 1.6,
                  border: msg.role === 'user' ? 'none' : '1px solid #d3cec6',
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ChatDetail
