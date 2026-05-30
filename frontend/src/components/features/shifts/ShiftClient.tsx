'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';
// import ShiftFormModal from './ShiftFormModal';
// import AssignmentModal from './AssignmentModal';

export default function ShiftClient({ initialShifts }: { initialShifts: any[] }) {
  const { user } = useAuth();
  const isManager = user?.role === 'supermarket_owner' || user?.role === 'shift_manager';
  
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Modals state (to be implemented)
  const [isShiftModalOpen, setShiftModalOpen] = useState(false);
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);

  // Generate 7 days of the week
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <PageHeader 
        title="Quản lý Ca làm việc" 
        actions={
          isManager && (
            <button onClick={() => setShiftModalOpen(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-transform active:scale-95">
              <Plus className="w-5 h-5" /> Thêm ca mới
            </button>
          )
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left column: Shift list (1/3) */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Danh mục Ca làm việc
            </h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">{initialShifts.length} Ca</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {initialShifts.map((shift) => (
              <div key={shift._id} className="border border-gray-100 p-4 rounded-2xl hover:shadow-md transition-shadow bg-white group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-extrabold text-gray-900 text-lg">{shift.name}</h3>
                  {isManager && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-4 font-medium">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {shift.startTime} - {shift.endTime}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                    <Users className="w-4 h-4" /> Số lượng tối đa:
                  </div>
                  <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-lg">
                    {shift.maxEmployees} NV
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Assignment grid (2/3) */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              Lịch phân công theo tuần
            </h2>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-gray-700 min-w-[180px] text-center">
                {format(weekDays[0], 'dd/MM')} - {format(weekDays[6], 'dd/MM/yyyy')}
              </span>
              <button 
                onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto bg-gray-50/30 p-4">
            {/* Minimal table implementation for the grid */}
            <div className="min-w-[800px] border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                <div className="p-4 font-bold text-gray-500 text-center border-r border-gray-200">Ca \ Ngày</div>
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="p-3 text-center border-r border-gray-200 last:border-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{format(day, 'EEEE', { locale: vi })}</p>
                    <p className={`text-lg font-extrabold ${format(day, 'dd/MM/yyyy') === format(new Date(), 'dd/MM/yyyy') ? 'text-blue-600' : 'text-gray-900'}`}>
                      {format(day, 'dd/MM')}
                    </p>
                  </div>
                ))}
              </div>
              
              {initialShifts.map((shift, i) => (
                <div key={shift._id} className={`grid grid-cols-8 ${i !== initialShifts.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="p-4 border-r border-gray-200 flex flex-col justify-center items-center bg-gray-50/50">
                    <span className="font-bold text-gray-900 text-center">{shift.name}</span>
                    <span className="text-xs font-semibold text-gray-500 mt-1">{shift.startTime}-{shift.endTime}</span>
                  </div>
                  
                  {weekDays.map(day => (
                    <div 
                      key={day.toISOString()} 
                      onClick={() => setAssignModalOpen(true)}
                      className="p-2 border-r border-gray-100 last:border-0 min-h-[120px] bg-red-50/30 hover:bg-red-50 cursor-pointer transition-colors flex flex-col relative group"
                    >
                      {/* Empty state simulation */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-red-600">Phân công</span>
                      </div>
                      <div className="mt-auto self-end group-hover:opacity-0 transition-opacity">
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md">Trống {shift.maxEmployees}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
