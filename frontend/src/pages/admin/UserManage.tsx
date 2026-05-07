import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Tag, message, Space, Popconfirm, Switch, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import request from '../../api/request'

const UserManage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [form] = Form.useForm()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/users')
      setUsers(res.data || [])
    } catch {
      message.error('获取员工列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      if (editingUser) {
        await request.put(`/users/${editingUser.id}`, values)
        message.success('更新成功')
      } else {
        await request.post('/users', values)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchUsers()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/users/${id}`)
      message.success('删除成功')
      fetchUsers()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '删除失败')
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      await request.put(`/users/${id}/toggle-active`)
      fetchUsers()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '操作失败')
    }
  }

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'display_name', key: 'display_name' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    {
      title: '角色', dataIndex: 'role', key: 'role',
      render: (role: string) => <Tag color={role === 'admin' ? 'default' : 'default'} style={{ background: role === 'admin' ? '#111111' : '#f5f1ec', color: role === 'admin' ? '#fff' : '#111111', border: 'none', borderRadius: 4 }}>{role === 'admin' ? '管理员' : '员工'}</Tag>,
    },
    {
      title: '状态', dataIndex: 'is_active', key: 'is_active',
      render: (active: boolean, record: any) => (
        <Switch checked={active} onChange={() => handleToggleActive(record.id)} checkedChildren="启用" unCheckedChildren="禁用" size="small" />
      ),
    },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#111111' }}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="section-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#fff', flexShrink: 0,
          }}>
            <UserOutlined />
          </div>
          <div>
            <Typography.Title level={4} style={{ fontSize: 18, fontWeight: 500, color: '#111111', margin: 0 }}>
              员工管理
            </Typography.Title>
            <Typography.Text style={{ fontSize: 14, color: '#9c9fa5' }}>
              {users.length > 0 ? `共 ${users.length} 名员工` : '管理平台员工账号'}
            </Typography.Text>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} style={{ borderRadius: 8 }}>
          创建员工
        </Button>
      </div>

      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table dataSource={users} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </div>

      <Modal
        title={editingUser ? '编辑员工' : '创建员工'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okButtonProps={{ style: { borderRadius: 8 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input disabled={!!editingUser} style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="display_name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="department" label="部门">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={editingUser ? [] : [{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder={editingUser ? '留空则不修改' : ''} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManage
