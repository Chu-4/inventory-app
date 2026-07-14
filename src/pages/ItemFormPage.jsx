import { useEffect, useState } from 'react';
import { LeftOutlined, CameraOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, Select, DatePicker, InputNumber, Upload, message } from 'antd';
import { api } from '../utils/api';
import { imageUtils } from '../utils/helpers';
import dayjs from 'dayjs';

export default function ItemFormPage({ itemId, categoryId, roomId, onNavigate, onBack, onRefresh }) {
  const [existing, setExisting] = useState(null);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form] = Form.useForm();
  const [imageBase64, setImageBase64] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.getCategories().then(setCategories);
    api.getRooms().then(setRooms);
    if (itemId) {
      api.getItem(itemId).then(item => {
        setExisting(item);
        setImageBase64(item.imageUrl || null);
        setQuantity(item.quantity ?? 1);
        form.setFieldsValue({
          ...item,
          date: item.date ? dayjs(item.date) : null,
        });
      });
    }
  }, [itemId]);

  const initialValues = itemId ? undefined : {
    categoryId: categoryId || undefined,
    roomId: roomId || undefined,
    quantity: 1,
    date: dayjs(),
  };

  const handleImageUpload = async (file) => {
    const compressed = await imageUtils.compressImage(file);
    setImageBase64(compressed);
    return false;
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        imageUrl: imageBase64,
        quantity,
        date: values.date ? values.date.format('YYYY-MM-DD') : '',
        price: values.price !== undefined ? Number(values.price) : null,
      };
      if (existing) {
        await api.updateItem(itemId, data);
        onRefresh?.();
        onNavigate('item-detail', { itemId }, { replace: true });
      } else {
        const created = await api.addItem(data);
        onRefresh?.();
        onNavigate('item-detail', { itemId: created.id }, { replace: true });
      }
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || '保存失败，请重试');
    }
  };

  return (
    <div className="page page--stack">
      <div className="stack-header stack-header--form">
        <button type="button" className="back-btn back-btn--plain" onClick={onBack}>
          <LeftOutlined />
        </button>
        <h1 className="stack-title">{existing ? '编辑物品' : '添加物品'}</h1>
      </div>

      <div className="form-content">
        <div className="form-image-upload">
          {imageBase64 ? (
            <div className="form-image-preview">
              <img src={imageBase64} alt="preview" />
              <button type="button" className="form-image-remove" onClick={() => setImageBase64(null)}>移除</button>
            </div>
          ) : (
            <Upload accept="image/*" showUploadList={false} beforeUpload={handleImageUpload}>
              <div className="form-image-dropzone">
                <CameraOutlined style={{ fontSize: 32, color: '#636366' }} />
                <span>上传物品照片</span>
              </div>
            </Upload>
          )}
        </div>

        <Form form={form} layout="vertical" initialValues={initialValues} requiredMark={false} className="item-form">
          <Form.Item
            label={<span className="form-label">物品名称 <span className="form-required">*</span></span>}
            name="name"
            rules={[{ required: true, message: '请输入物品名称' }]}
          >
            <Input placeholder="例如：索尼耳机" className="form-input" />
          </Form.Item>

          <div className="form-row">
            <Form.Item label={<span className="form-label">分类</span>} name="categoryId" rules={[{ required: true, message: '请选择' }]} className="form-col">
              <Select
                placeholder="请选择"
                className="form-select"
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                onChange={() => {
                  form.setFieldValue('subcategoryId', undefined);
                  form.setFieldValue('ip', undefined);
                }}
              />
            </Form.Item>
            <Form.Item label={<span className="form-label">所在房间</span>} name="roomId" rules={[{ required: true, message: '请选择' }]} className="form-col">
              <Select
                placeholder="请选择"
                className="form-select"
                options={rooms.map(r => ({ value: r.id, label: r.name }))}
              />
            </Form.Item>
          </div>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.categoryId !== cur.categoryId || prev.subcategoryId !== cur.subcategoryId}>
            {({ getFieldValue }) => {
              const cat = categories.find(c => c.id === getFieldValue('categoryId'));
              const subs = cat?.subcategories;
              if (!subs?.length) return null;
              const isDoujin = getFieldValue('subcategoryId') === '5-1';
              return (
                <div className="form-row">
                  <Form.Item
                    label={<span className="form-label">子分类</span>}
                    name="subcategoryId"
                    className={`form-col${!isDoujin ? ' form-col--full' : ''}`}
                  >
                    <Select
                      allowClear
                      placeholder="选择子分类（可选）"
                      options={subs.map(s => ({ value: s.id, label: s.name }))}
                      onChange={(val) => {
                        if (val !== '5-1') form.setFieldValue('ip', undefined);
                      }}
                    />
                  </Form.Item>
                  {isDoujin && (
                    <Form.Item label={<span className="form-label">IP</span>} name="ip" className="form-col">
                      <Input placeholder="例如：原神" className="form-input" />
                    </Form.Item>
                  )}
                </div>
              );
            }}
          </Form.Item>

          <div className="form-row">
            <Form.Item label={<span className="form-label">价格</span>} name="price" className="form-col">
              <InputNumber placeholder="¥ 0.00" min={0} step={0.01} className="form-input" style={{ width: '100%' }} />
            </Form.Item>
            <div className="form-col">
              <div className="form-label" style={{ marginBottom: 8 }}>数量</div>
              <div className="quantity-stepper">
                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <MinusOutlined />
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity(q => q + 1)}>
                  <PlusOutlined />
                </button>
              </div>
            </div>
          </div>

          <Form.Item label={<span className="form-label">购入时间</span>} name="date">
            <DatePicker className="form-input" style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>

          <Form.Item label={<span className="form-label">备注</span>} name="notes">
            <Input.TextArea placeholder="添加更多详情..." rows={4} className="form-input" style={{ resize: 'none' }} />
          </Form.Item>
        </Form>

        <button type="button" className="btn-primary btn-primary--block" onClick={handleSave}>
          保存
        </button>
      </div>
    </div>
  );
}
