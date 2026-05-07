import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm, Switch, InputNumber, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons'
import request from '../../api/request'
import { ACCESS_MODE_LABELS } from '../../utils/constants'

const AppManage: React.FC = () => {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<any>(null)
  const [form] = Form.useForm()

  const fetchApps = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/apps')
      setApps(res.data || [])
    } catch {
      message.error('获取应用列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApps() }, [])

  const handleCreate = () => {
    setEditingApp(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (app: any) => {
    setEditingApp(app)
    let config = {}
    try { config = JSON.parse(app.app_model_config || '{}') } catch { /* ignore */ }
    form.setFieldsValue({ ...app, ...config })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload: any = {
      name: values.name,
      description: values.description || '',
      icon: values.icon || '',
      access_mode: values.access_mode,
      access_url: values.access_url || '',
      tags: values.tags || '',
      sort_order: values.sort_order || 0,
    }

    if (values.access_mode === 'api_call') {
      payload.app_model_config = {
        provider: values.provider || '',
        model: values.model || '',
        api_key: values.api_key || '',
        base_url: values.base_url || '',
        temperature: values.temperature || 0.7,
        max_tokens: values.max_tokens || 4096,
      }
    }

    try {
      if (editingApp) {
        await request.put(`/apps/${editingApp.id}`, payload)
        message.success('更新成功')
      } else {
        await request.post('/apps', payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchApps()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/apps/${id}`)
      message.success('删除成功')
      fetchApps()
    } catch {
      message.error('删除失败')
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      await request.put(`/apps/${id}/toggle-active`)
      fetchApps()
    } catch {
      message.error('操作失败')
    }
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '接入模式', dataIndex: 'access_mode', key: 'access_mode',
      render: (mode: string) => <Tag style={{ background: '#f5f1ec', color: '#111111', border: 'none', borderRadius: 4 }}>{ACCESS_MODE_LABELS[mode] || mode}</Tag>,
    },
    {
      title: '状态', dataIndex: 'is_active', key: 'is_active',
      render: (active: boolean) => <Tag style={{ background: active ? '#f5f1ec' : '#ebe7e1', color: active ? '#111111' : '#7b7b78', border: 'none', borderRadius: 4 }}>{active ? '已上架' : '已下架'}</Tag>,
    },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Switch checked={record.is_active} onChange={() => handleToggleActive(record.id)} checkedChildren="上架" unCheckedChildren="下架" size="small" />
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
            <AppstoreOutlined />
          </div>
          <div>
            <Typography.Title level={4} style={{ fontSize: 18, fontWeight: 500, color: '#111111', margin: 0 }}>
              应用管理
            </Typography.Title>
            <Typography.Text style={{ fontSize: 14, color: '#9c9fa5' }}>
              {apps.length > 0 ? `共 ${apps.length} 个应用` : '上架和管理 AI 应用'}
            </Typography.Text>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} style={{ borderRadius: 8 }}>
          上架应用
        </Button>
      </div>

      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table dataSource={apps} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </div>

      <Modal
        title={editingApp ? '编辑应用' : '上架应用'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={640}
        okButtonProps={{ style: { borderRadius: 8 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="应用名称" rules={[{ required: true, message: '请输入应用名称' }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="description" label="应用描述">
            <Input.TextArea rows={3} style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="icon" label="图标URL">
            <Input placeholder="/icons/chat.png" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="access_mode" label="接入模式" rules={[{ required: true }]}>
            <Select style={{ borderRadius: 8 }}>
              <Select.Option value="api_call">API调用（内置对话）</Select.Option>
              <Select.Option value="iframe">iframe嵌入</Select.Option>
              <Select.Option value="external_link">外部链接</Select.Option>
              <Select.Option value="custom">自定义</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="access_url" label="接入地址">
            <Input placeholder="iframe或外部链接的URL" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）">
            <Input placeholder="对话,通用,办公" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="sort_order" label="排序权重">
            <InputNumber min={0} style={{ borderRadius: 8 }} />
          </Form.Item>

          {/* AI Model Config - shown when api_call mode */}
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.access_mode !== cur.access_mode}>
            {({ getFieldValue }) => {
              const mode = getFieldValue('access_mode')
              if (mode !== 'api_call') return null
              return (
                <>
                  <div style={{ fontWeight: 500, marginBottom: 8, color: '#111111' }}>AI 模型配置</div>
                  <Form.Item name="provider" label="Provider">
                    <Input placeholder="deepseek" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="model" label="模型">
                    <Input placeholder="deepseek-chat" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="api_key" label="API Key">
                    <Input.Password placeholder="sk-xxx" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="base_url" label="Base URL">
                    <Input placeholder="https://api.deepseek.com/v1" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Space>
                    <Form.Item name="temperature" label="Temperature">
                      <InputNumber min={0} max={2} step={0.1} style={{ borderRadius: 8 }} />
                    </Form.Item>
                    <Form.Item name="max_tokens" label="Max Tokens">
                      <InputNumber min={1} max={128000} style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Space>
                </>
              )
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AppManage
