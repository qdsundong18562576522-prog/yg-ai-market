import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate('/')
    } catch (err: any) {
      message.error(err.response?.data?.detail || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f5f1ec',
    }}>
      {/* Left side - Branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>YG</span>
          </div>
          <Typography.Title level={1} style={{
            fontSize: 40, fontWeight: 500, color: '#111111', margin: 0, marginBottom: 12,
            letterSpacing: '-0.8px',
          }}>
            扬光AI商城
          </Typography.Title>
          <Typography.Text style={{ fontSize: 18, color: '#626260', fontWeight: 400 }}>
            一站式AI应用平台，赋能每一天
          </Typography.Text>
        </div>
      </div>

      {/* Right side - Login form */}
      <div style={{
        width: 480,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 80,
      }}>
        <div style={{
          width: 400,
          background: '#ffffff',
          borderRadius: 12,
          padding: 40,
          border: '1px solid #d3cec6',
        }}>
          <Typography.Title level={3} style={{
            fontSize: 24, fontWeight: 500, color: '#111111',
            textAlign: 'center', marginBottom: 32, letterSpacing: '-0.3px',
          }}>
            欢迎登录
          </Typography.Title>
          <Form onFinish={onFinish} size="large" layout="vertical">
            <Form.Item name="username" label={<span style={{ color: '#111111', fontWeight: 500 }}>用户名</span>}
              rules={[{ required: true, message: '请输入用户名' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#9c9fa5' }} />}
                placeholder="请输入用户名"
                style={{ height: 44, borderRadius: 8 }}
              />
            </Form.Item>
            <Form.Item name="password" label={<span style={{ color: '#111111', fontWeight: 500 }}>密码</span>}
              rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9c9fa5' }} />}
                placeholder="请输入密码"
                style={{ height: 44, borderRadius: 8 }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 44, borderRadius: 8, fontSize: 15, fontWeight: 500 }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Login
