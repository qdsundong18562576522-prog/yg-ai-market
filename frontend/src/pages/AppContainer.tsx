import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Spin, message, Input, Button, List, Space, Avatar } from 'antd'
import { SendOutlined, ArrowLeftOutlined, PlusOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons'
import request from '../api/request'

const AppContainer: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [sessionId, setSessionId] = useState<number | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res: any = await request.get(`/market/apps/${id}`)
        setApp(res.data)
      } catch {
        message.error('应用不存在或已下架')
        navigate('/my-apps')
      } finally {
        setLoading(false)
      }
    }
    fetchApp()
  }, [id, navigate])

  useEffect(() => {
    if (app?.access_mode === 'api_call') {
      fetchSessions()
    }
  }, [app])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchSessions = async () => {
    try {
      const res: any = await request.get('/ai/sessions')
      setSessions((res.data || []).filter((s: any) => s.app_id === Number(id)))
    } catch { /* ignore */ }
  }

  const loadSession = async (sid: number) => {
    try {
      const res: any = await request.get(`/ai/sessions/${sid}`)
      setSessionId(sid)
      setMessages(res.data.messages || [])
      setShowHistory(false)
    } catch { message.error('加载对话失败') }
  }

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return
    const msg = input
    setInput('')
    setSending(true)

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: msg, created_at: new Date().toISOString() }])

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ app_id: Number(id), session_id: sessionId, message: msg }),
      })

      if (!response.ok) {
        throw new Error('请求失败')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      let assistantContent = ''
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: '', created_at: new Date().toISOString() }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const dataStr = line.slice(6).trim()
          if (dataStr === '[DONE]') continue
          try {
            const data = JSON.parse(dataStr)
            if (data.content) {
              assistantContent += data.content
              setMessages(prev => {
                const newMsgs = [...prev]
                newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: assistantContent }
                return newMsgs
              })
            }
          } catch { /* ignore */ }
        }
      }

      fetchSessions()
      if (!sessionId) {
        const sessionsRes: any = await request.get('/ai/sessions')
        const appSessions = (sessionsRes.data || []).filter((s: any) => s.app_id === Number(id))
        if (appSessions.length > 0) {
          setSessionId(appSessions[0].id)
          const detailRes: any = await request.get(`/ai/sessions/${appSessions[0].id}`)
          setMessages(detailRes.data.messages || [])
        }
      }
    } catch (err: any) {
      message.error('发送失败: ' + (err.message || '未知错误'))
    } finally {
      setSending(false)
    }
  }, [input, sending, sessionId, id])

  const newSession = () => {
    setSessionId(null)
    setMessages([])
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>
  if (!app) return null

  if (app.access_mode === 'external_link') {
    window.open(app.access_url, '_blank')
    navigate('/my-apps')
    return null
  }

  if (app.access_mode === 'custom') {
    return (
      <div className="section-card" style={{ padding: 80, textAlign: 'center' }}>
        <Typography.Title level={4} style={{ color: '#111111', fontWeight: 500 }}>该应用接入模式正在开发中</Typography.Title>
        <Typography.Text style={{ color: '#7b7b78' }}>自定义模式暂未支持，敬请期待</Typography.Text>
      </div>
    )
  }

  if (app.access_mode === 'iframe') {
    const token = localStorage.getItem('token')
    const separator = app.access_url.includes('?') ? '&' : '?'
    const iframeUrl = `${app.access_url}${separator}token=${token}&app_id=${id}`
    return (
      <div className="section-card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 200px)' }}>
        <iframe src={iframeUrl} style={{ width: '100%', height: '100%', border: 'none' }} title={app.name} />
      </div>
    )
  }

  // API Call mode - built-in chat interface
  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 160px)',
      background: '#ffffff',
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid #d3cec6',
    }}>
      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid #ebe7e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/my-apps')} type="text" style={{ color: '#626260', width: 36, height: 36 }} />
            <Avatar size={32} style={{ background: '#111111', fontSize: 14 }}>
              {app.name.charAt(0)}
            </Avatar>
            <Typography.Title level={5} style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#111111' }}>
              {app.name}
            </Typography.Title>
          </Space>
          <Space>
            <Button size="small" icon={<PlusOutlined />} onClick={newSession} style={{ borderRadius: 8, borderColor: '#d3cec6', color: '#111111' }}>
              新对话
            </Button>
            <Button size="small" onClick={() => setShowHistory(!showHistory)} style={{ borderRadius: 8, borderColor: '#d3cec6', color: '#111111' }}>
              {showHistory ? '收起记录' : '历史记录'}
            </Button>
          </Space>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflow: 'auto', padding: 24, background: '#faf9f7',
          scrollBehavior: 'smooth',
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '80px 20px', color: '#9c9fa5',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 16,
                background: '#111111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <RobotOutlined style={{ fontSize: 36, color: '#fff' }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#111111', marginBottom: 8 }}>
                开始与 {app.name} 对话
              </div>
              <div style={{ fontSize: 14, color: '#7b7b78', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
                输入你的问题，AI 助手将为你解答
              </div>
            </div>
          )}
          {messages.map((msg, idx) => (
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
                  {msg.content || (msg.role === 'assistant' && <Spin size="small" />)}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #ebe7e1', background: '#fff' }}>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`向 ${app.name} 发送消息...`}
            suffix={
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!input.trim() || sending}
                loading={sending}
                style={{ borderRadius: 8, height: 32, minWidth: 32 }}
              />
            }
            style={{ height: 44, borderRadius: 8, border: '1px solid #d3cec6', paddingRight: 4, fontSize: 14 }}
            onPressEnter={handleSend}
            disabled={sending}
          />
        </div>
      </div>

      {/* History sidebar */}
      {showHistory && (
        <div style={{ width: 280, borderLeft: '1px solid #ebe7e1', overflow: 'auto', background: '#faf9f7' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #ebe7e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography.Text strong style={{ fontSize: 14, color: '#111111' }}>历史对话</Typography.Text>
            <Button type="text" size="small" onClick={() => setShowHistory(false)} style={{ color: '#9c9fa5', width: 24, height: 24, minWidth: 24, fontSize: 14, padding: 0 }}>
              ×
            </Button>
          </div>
          <List
            dataSource={sessions}
            renderItem={(s: any) => (
              <List.Item
                onClick={() => loadSession(s.id)}
                style={{
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderColor: '#ebe7e1',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f1ec' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <List.Item.Meta
                  title={<Typography.Text ellipsis style={{ fontSize: 13, fontWeight: 500, color: '#111111' }}>{s.title}</Typography.Text>}
                  description={<span style={{ fontSize: 11, color: '#9c9fa5' }}>{new Date(s.updated_at).toLocaleDateString()}</span>}
                />
              </List.Item>
            )}
            locale={{ emptyText: <span style={{ color: '#9c9fa5', fontSize: 13 }}>暂无对话记录</span> }}
          />
        </div>
      )}
    </div>
  )
}

export default AppContainer
