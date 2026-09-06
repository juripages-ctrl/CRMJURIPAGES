'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Check } from 'lucide-react'

interface CustomDateTimePickerProps {
  value: string // Format: YYYY-MM-DDTHH:mm
  onChange: (value: string) => void
  placeholder?: string
}

export function CustomDateTimePicker({ value, onChange, placeholder = 'Selecionar data e hora...' }: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Internal state for selected date & time
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return d
    }
    return new Date()
  })

  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return d.getDate()
    }
    return null
  })

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return d.getMonth()
    }
    return new Date().getMonth()
  })

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return d.getFullYear()
    }
    return new Date().getFullYear()
  })

  const [hours, setHours] = useState<string>(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return String(d.getHours()).padStart(2, '0')
    }
    return '12'
  })

  const [minutes, setMinutes] = useState<string>(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return String(d.getMinutes()).padStart(2, '0')
    }
    return '00'
  })

  // Sync internal state if props value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        setSelectedDay(d.getDate())
        setSelectedMonth(d.getMonth())
        setSelectedYear(d.getFullYear())
        setHours(String(d.getHours()).padStart(2, '0'))
        setMinutes(String(d.getMinutes()).padStart(2, '0'))
      }
    }
  }, [value])

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(prev => prev - 1)
    } else {
      setSelectedMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(prev => prev + 1)
    } else {
      setSelectedMonth(prev => prev + 1)
    }
  }

  const applySelection = (day: number, month: number, year: number, h: string, m: string) => {
    const pad = (n: number | string) => String(n).padStart(2, '0')
    const formatted = `${year}-${pad(month + 1)}-${pad(day)}T${pad(h)}:${pad(m)}`
    onChange(formatted)
  }

  const handleSelectDay = (day: number) => {
    setSelectedDay(day)
    applySelection(day, selectedMonth, selectedYear, hours, minutes)
  }

  const handleTimeChange = (newH: string, newM: string) => {
    setHours(newH)
    setMinutes(newM)
    if (selectedDay !== null) {
      applySelection(selectedDay, selectedMonth, selectedYear, newH, newM)
    }
  }

  const handlePreset = (daysFromNow: number) => {
    const target = new Date()
    target.setDate(target.getDate() + daysFromNow)
    setSelectedDay(target.getDate())
    setSelectedMonth(target.getMonth())
    setSelectedYear(target.getFullYear())
    applySelection(target.getDate(), target.getMonth(), target.getFullYear(), hours, minutes)
  }

  const handleClear = () => {
    setSelectedDay(null)
    onChange('')
    setIsOpen(false)
  }

  const formatDisplay = () => {
    if (!value || selectedDay === null) return null
    const pad = (n: number | string) => String(n).padStart(2, '0')
    return `${pad(selectedDay)} de ${monthNames[selectedMonth]} de ${selectedYear} às ${hours}:${minutes}`
  }

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const firstDay = getFirstDayOfWeek(selectedYear, selectedMonth)
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyPrefixSlots = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-200 hover:border-gray-400 rounded-xl cursor-pointer shadow-sm transition-all focus-within:ring-2 focus-within:ring-black"
      >
        <div className="flex items-center gap-3 truncate">
          <div className="w-8 h-8 rounded-lg bg-black text-[#DFFF00] flex items-center justify-center flex-shrink-0 shadow-sm">
            <CalendarIcon className="w-4 h-4" />
          </div>
          {formatDisplay() ? (
            <span className="text-sm font-semibold text-gray-900 truncate">
              {formatDisplay()}
            </span>
          ) : (
            <span className="text-sm text-gray-400 font-medium">
              {placeholder}
            </span>
          )}
        </div>

        {value ? (
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
            title="Limpar Data"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            Escolher
          </span>
        )}
      </div>

      {/* Popover Calendar (Enterprise Analytics Style) */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 bottom-full mb-2.5 w-80 sm:w-88 bg-white border border-gray-200 rounded-[1.75rem] shadow-2xl p-5 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* Preset Pills (Enterprise Style) */}
          <div className="bg-gray-100/70 p-1 rounded-full flex items-center justify-between mb-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => handlePreset(0)}
              className="flex-1 py-1.5 rounded-full hover:bg-white text-gray-700 hover:shadow-xs transition-all text-center"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => handlePreset(1)}
              className="flex-1 py-1.5 rounded-full hover:bg-white text-gray-700 hover:shadow-xs transition-all text-center"
            >
              Amanhã
            </button>
            <button
              type="button"
              onClick={() => handlePreset(3)}
              className="flex-1 py-1.5 rounded-full hover:bg-white text-gray-700 hover:shadow-xs transition-all text-center"
            >
              Em 3 dias
            </button>
            <button
              type="button"
              onClick={() => handlePreset(7)}
              className="flex-1 py-1.5 rounded-full hover:bg-white text-gray-700 hover:shadow-xs transition-all text-center"
            >
              1 semana
            </button>
          </div>

          {/* Month Navigation Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <h4 className="text-sm font-bold text-gray-900 tracking-tight">
              {monthNames[selectedMonth]} {selectedYear}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map((d, i) => (
              <span key={i} className="text-[11px] font-bold text-gray-400 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-5">
            {emptyPrefixSlots.map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {daysArray.map((day) => {
              const isSelected = selectedDay === day
              const isToday = 
                day === new Date().getDate() && 
                selectedMonth === new Date().getMonth() && 
                selectedYear === new Date().getFullYear()

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-black text-white shadow-md scale-105 ring-2 ring-[#DFFF00]' 
                      : isToday
                      ? 'bg-gray-100 text-black border border-gray-300 font-bold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Time Picker Bar */}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Horário:</span>
              </div>

              {/* Editable Inputs for Hours and Minutes + Quick Select */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-1 rounded-xl">
                {/* Hours Editable Input */}
                <input
                  type="text"
                  maxLength={2}
                  value={hours}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '')
                    if (val.length > 2) val = val.slice(0, 2)
                    if (val && parseInt(val, 10) > 23) val = '23'
                    handleTimeChange(val, minutes)
                  }}
                  onBlur={() => {
                    const pad = (n: string) => n.padStart(2, '0')
                    handleTimeChange(pad(hours || '00'), minutes)
                  }}
                  className="w-7 text-center bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black py-1"
                  placeholder="12"
                  title="Digite a hora (00-23)"
                />
                <span className="text-gray-400 font-bold">:</span>
                {/* Minutes Editable Input */}
                <input
                  type="text"
                  maxLength={2}
                  value={minutes}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '')
                    if (val.length > 2) val = val.slice(0, 2)
                    if (val && parseInt(val, 10) > 59) val = '59'
                    handleTimeChange(hours, val)
                  }}
                  onBlur={() => {
                    const pad = (n: string) => n.padStart(2, '0')
                    handleTimeChange(hours, pad(minutes || '00'))
                  }}
                  className="w-7 text-center bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black py-1"
                  placeholder="00"
                  title="Digite os minutos (00-59)"
                />

                {/* Optional Quick Selector */}
                <select
                  value={hours + ':' + minutes}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [h, m] = e.target.value.split(':')
                      handleTimeChange(h, m)
                    }
                  }}
                  className="bg-transparent text-[11px] font-medium text-gray-500 outline-none cursor-pointer border-l border-gray-200 pl-1.5 ml-1"
                >
                  <option value="">Opções...</option>
                  <option value="08:00">08:00 (Manhã)</option>
                  <option value="09:00">09:00 (Manhã)</option>
                  <option value="10:00">10:00 (Manhã)</option>
                  <option value="12:00">12:00 (Meio-dia)</option>
                  <option value="14:00">14:00 (Tarde)</option>
                  <option value="16:00">16:00 (Tarde)</option>
                  <option value="18:00">18:00 (Noite)</option>
                  <option value="20:00">20:00 (Noite)</option>
                </select>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 text-right">Digite as horas e minutos diretamente ou escolha na lista.</p>
          </div>

          {/* Action Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
            >
              Limpar Data
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedDay === null) handleSelectDay(new Date().getDate())
                setIsOpen(false)
              }}
              className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Check className="w-3.5 h-3.5 text-[#DFFF00]" /> Confirmar
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
