import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, isSameDay, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

export interface DateRangePickerProps {
  value: {
    from: Date | null;
    to: Date | null;
  };
  onChange: (range: { from: Date | null; to: Date | null }) => void;
  maxDate?: Date;
  minDate?: Date;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  maxDate,
  minDate,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [leftMonth, setLeftMonth] = useState(new Date());
  const [rightMonth, setRightMonth] = useState(addMonths(new Date(), 1));
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDateRange = () => {
    if (value.from && value.to) {
      return `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`;
    }
    if (value.from) {
      return format(value.from, 'MMM d, yyyy');
    }
    return 'Select date range';
  };

  const handlePrevMonth = (isLeft: boolean) => {
    if (isLeft) {
      setLeftMonth(subMonths(leftMonth, 1));
      setRightMonth(subMonths(rightMonth, 1));
    } else {
      setLeftMonth(subMonths(leftMonth, 1));
      setRightMonth(subMonths(rightMonth, 1));
    }
  };

  const handleNextMonth = (isLeft: boolean) => {
    if (isLeft) {
      setLeftMonth(addMonths(leftMonth, 1));
      setRightMonth(addMonths(rightMonth, 1));
    } else {
      setLeftMonth(addMonths(leftMonth, 1));
      setRightMonth(addMonths(rightMonth, 1));
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && isBefore(startOfDay(date), startOfDay(minDate))) {
      return true;
    }
    if (maxDate && isAfter(startOfDay(date), startOfDay(maxDate))) {
      return true;
    }
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!value.from || (value.from && value.to)) {
      onChange({ from: date, to: null });
    } else if (isBefore(date, value.from)) {
      onChange({ from: date, to: value.from });
    } else {
      onChange({ from: value.from, to: date });
    }
  };

  const handleDateHover = (date: Date) => {
    if (value.from && !value.to && !isDateDisabled(date)) {
      setHoveredDate(date);
    }
  };

  const getDateClassName = (date: Date): string => {
    const baseClasses = 'w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all duration-200';
    
    if (isDateDisabled(date)) {
      return `${baseClasses} text-text-secondary opacity-30 cursor-not-allowed`;
    }

    const isSelected = value.from && isSameDay(date, value.from);
    const isEndSelected = value.to && isSameDay(date, value.to);
    const isInRange = value.from && value.to && isWithinInterval(date, { start: value.from, end: value.to });
    const isHoverInRange = value.from && hoveredDate && !value.to && isWithinInterval(date, { 
      start: isBefore(hoveredDate, value.from) ? hoveredDate : value.from, 
      end: isBefore(hoveredDate, value.from) ? value.from : hoveredDate 
    });

    if (isSelected || isEndSelected) {
      return `${baseClasses} bg-accent-blue text-white hover:bg-blue-600`;
    }

    if (isInRange || isHoverInRange) {
      return `${baseClasses} bg-accent-blue/20 text-white hover:bg-accent-blue/30`;
    }

    return `${baseClasses} text-white hover:bg-background-elevated`;
  };

  const renderCalendar = (month: Date, isLeft: boolean) => {
    const monthStart = startOfMonth(month);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => handlePrevMonth(isLeft)}
            className="p-1 rounded-full hover:bg-background-elevated transition-colors"
            disabled={isLeft && minDate && isBefore(startOfMonth(subMonths(month, 1)), startOfMonth(minDate))}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="font-semibold text-white">{format(month, 'MMMM yyyy')}</span>
          <button
            onClick={() => handleNextMonth(isLeft)}
            className="p-1 rounded-full hover:bg-background-elevated transition-colors"
            disabled={!isLeft && maxDate && isAfter(startOfMonth(addMonths(month, 1)), startOfMonth(maxDate))}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs text-text-secondary font-medium py-1">
              {day}
            </div>
          ))}
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === month.getMonth();
            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => handleDateHover(date)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={isDateDisabled(date)}
                className={getDateClassName(date)}
                style={{ opacity: isCurrentMonth ? 1 : 0.3 }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handlePreset = (preset: string) => {
    const today = startOfDay(new Date());
    let from: Date;
    let to: Date;

    switch (preset) {
      case 'today':
        from = today;
        to = endOfDay(today);
        break;
      case 'last7days':
        from = subDays(today, 6);
        to = endOfDay(today);
        break;
      case 'last30days':
        from = subDays(today, 29);
        to = endOfDay(today);
        break;
      case 'thisMonth':
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case 'lastMonth':
        from = startOfMonth(subMonths(today, 1));
        to = endOfMonth(subMonths(today, 1));
        break;
      default:
        return;
    }

    onChange({ from, to });
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange({ from: null, to: null });
  };

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-background-elevated border border-border rounded-lg text-white hover:border-accent-blue transition-colors min-w-[280px]"
      >
        <Calendar className="w-4 h-4 text-text-secondary" />
        <span className="flex-1 text-left">{formatDateRange()}</span>
        {value.from && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 rounded-full hover:bg-background-card transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-background-card border border-border rounded-lg shadow-xl p-4 z-50 w-auto">
          <div className="flex gap-4">
            {renderCalendar(leftMonth, true)}
            {renderCalendar(rightMonth, false)}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handlePreset('today')}
                className="px-3 py-1.5 text-sm text-white bg-background-elevated rounded-md hover:bg-background-card hover:border-accent-blue border border-transparent transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => handlePreset('last7days')}
                className="px-3 py-1.5 text-sm text-white bg-background-elevated rounded-md hover:bg-background-card hover:border-accent-blue border border-transparent transition-colors"
              >
                Last 7 days
              </button>
              <button
                onClick={() => handlePreset('last30days')}
                className="px-3 py-1.5 text-sm text-white bg-background-elevated rounded-md hover:bg-background-card hover:border-accent-blue border border-transparent transition-colors"
              >
                Last 30 days
              </button>
              <button
                onClick={() => handlePreset('thisMonth')}
                className="px-3 py-1.5 text-sm text-white bg-background-elevated rounded-md hover:bg-background-card hover:border-accent-blue border border-transparent transition-colors"
              >
                This month
              </button>
              <button
                onClick={() => handlePreset('lastMonth')}
                className="px-3 py-1.5 text-sm text-white bg-background-elevated rounded-md hover:bg-background-card hover:border-accent-blue border border-transparent transition-colors"
              >
                Last month
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
