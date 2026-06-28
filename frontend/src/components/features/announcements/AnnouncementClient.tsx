'use client';
import toast from 'react-hot-toast';

import React, { useState, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, Bell, AlertTriangle, Loader2, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '@/lib/axios';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'normal' | 'high' | 'urgent';
  isActive: boolean;
  author: { _id: string; fullName: string; role: string; avatar?: string };
  createdAt: string;
}

const PRIORITY_MAP = {
  normal: { label: 'Bình thường', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Quan trọng', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Khẩn cấp', color: 'bg-red-100 text-red-700' },
};

// ─── Announcement Form Modal ────────────────────────────────────────────────
function AnnouncementFormModal({
  announcement,
  onClose,
  onSaved,
}: {
  announcement?: Announcement | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!announcement;
  const [form, setForm] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    priority: announcement?.priority || 'normal',
    isActive: announcement?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await axiosInstance.put(`/announcements/${announcement._id}`, form);
      } else {
        await axiosInstance.post('/announcements', form);
      }
      onSaved();
      onClose();
      // Trigger bell to check for new announcements instantly
      window.dispatchEvent(new Event('announcementsUpdated'));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-xl text-gray-900">{isEdit ? 'Chỉnh sửa Thông báo' : 'Tạo Thông báo mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Tiêu đề *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder="Nhập tiêu đề thông báo"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Mức độ ưu tiên</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value as any })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="normal">Bình thường</option>
                  <option value="high">Quan trọng</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Trạng thái hiển thị</label>
                <div className="flex items-center h-[50px]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setForm({ ...form, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Đang hoạt động (Hiển thị)</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nội dung *</label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                rows={8}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-y min-h-[150px]"
                placeholder="Nhập nội dung chi tiết..."
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3 justify-end rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-semibold bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Lưu thay đổi' : 'Đăng thông báo'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ───────────────────────────────────────────────────
function ConfirmDeleteModal({
  item,
  onClose,
  onDeleted,
}: {
  item: Announcement;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/announcements/${item._id}`);
      onDeleted();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa thông báo này!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="font-bold text-xl text-gray-900 mb-2">Xóa thông báo?</h2>
          <p className="text-gray-500 text-sm">
            Bạn có chắc muốn xóa thông báo <span className="font-bold text-gray-900">"{item.title}"</span>?
            <br />Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AnnouncementClient({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
  const { user } = useAuth();
  const isManager = user?.role === 'supermarket_owner' || user?.role === 'shift_manager';

  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [deleteItem, setDeleteItem] = useState<Announcement | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/announcements');
      const items = data.data || [];
      setAnnouncements(items);
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    if (!user?._id) return;
    
    if (initialAnnouncements.length > 0) {
      localStorage.setItem(`lastViewedAnnouncement_${user._id}`, initialAnnouncements[0].createdAt);
      window.dispatchEvent(new Event('announcementsRead'));
    } else {
      localStorage.setItem(`lastViewedAnnouncement_${user._id}`, new Date().toISOString());
      window.dispatchEvent(new Event('announcementsRead'));
    }
  }, [initialAnnouncements, user?._id]);

  React.useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thông báo hệ thống"
        description="Bảng tin và các thông báo quan trọng từ Ban Quản lý."
        actions={
          isManager && (
            <button onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-transform active:scale-95">
              <Plus className="w-5 h-5" /> Soạn thông báo
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có thông báo nào</h3>
            <p className="text-gray-500">Hiện tại không có thông báo nào được đăng tải trên hệ thống.</p>
          </div>
        ) : (
          announcements.map(item => (
            <div key={item._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative">
              
              {!item.isActive && isManager && (
                <div className="absolute top-6 right-6 bg-gray-100 text-gray-600 px-3 py-1 text-xs font-bold rounded-lg border border-gray-200">
                  Đã ẩn
                </div>
              )}

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${PRIORITY_MAP[item.priority].color}`}>
                    {PRIORITY_MAP[item.priority].label}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    {format(new Date(item.createdAt), 'HH:mm - EEEE, dd/MM/yyyy', { locale: vi })}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                      {item.author?.fullName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.author?.fullName}</p>
                      <p className="text-xs text-gray-500">{item.author?.role === 'supermarket_owner' ? 'Chủ siêu thị' : 'Quản lý'}</p>
                    </div>
                  </div>

                  {isManager && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditItem(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium text-sm flex items-center gap-2">
                        <Edit className="w-4 h-4" /> <span className="hidden sm:inline">Sửa</span>
                      </button>
                      <button onClick={() => setDeleteItem(item)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Xóa</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <AnnouncementFormModal onClose={() => setShowCreateModal(false)} onSaved={fetchAnnouncements} />
      )}
      {editItem && (
        <AnnouncementFormModal announcement={editItem} onClose={() => setEditItem(null)} onSaved={fetchAnnouncements} />
      )}
      {deleteItem && (
        <ConfirmDeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onDeleted={fetchAnnouncements} />
      )}
    </div>
  );
}
