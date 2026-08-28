import React, { useState, useRef, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  subDays,
  isSameDay,
  isBefore,
  isAfter,
  isWithinInterval,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

export interface DateRangePickerProps {
  value: {
    from: Date | null;
    to: Date | null;
  };
  onChange: (range: { from: Date | null; to: Date | null }) => void;
  maxDate?: Date;
  minDate?: Date;
  disabled?: boolean;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  maxDate,
  minDate,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Staged (pending) range — only committed to `value` on Apply
  const [pending, setPending] = useState<{ from: Date | null; to: Date | null }>({
    from: value.from,
    to: value.to,
  });

  const [leftMonth, setLeftMonth] = useState(new Date());
  const [rightMonth, setRightMonth] = useState(addMonths(new Date(), 1));
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync pending with external value when the popover opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPending({ from: value.from, to: value.to });
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
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
      return `${format(value.from, 'MMM d, yyyy')} – ${format(value.to, 'MMM d, yyyy')}`;
    }
    if (value.from) {
      return format(value.from, 'MMM d, yyyy');
    }
    return 'Select date range';
  };

  const handlePrevMonth = () => {
    setLeftMonth((prev) => subMonths(prev, 1));
    setRightMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setLeftMonth((prev) => addMonths(prev, 1));
    setRightMonth((prev) => addMonths(prev, 1));
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && isBefore(startOfDay(date), startOfDay(minDate))) return true;
    if (maxDate && isAfter(startOfDay(date), startOfDay(maxDate))) return true;
    return false;
  };

  // Clicking a day updates the pending range (not value)
  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    setPending((prev) => {
      if (!prev.from || (prev.from && prev.to)) {
        return { from: date, to: null };
      }
      if (isBefore(date, prev.from)) {
        return { from: date, to: prev.from };
      }
      return { from: prev.from, to: date };
    });
  };

  const handleDateHover = (date: Date) => {
    if (pending.from && !pending.to && !isDateDisabled(date)) {
      setHoveredDate(date);
    }
  };

  const getDateClassName = (date: Date): string => {
    const base =
      'w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all duration-200';

    if (isDateDisabled(date)) {
      return `${base} text-text-secondary opacity-30 cursor-not-allowed`;
    }

    const isSelected = pending.from && isSameDay(date, pending.from);
    const isEndSelected = pending.to && isSameDay(date, pending.to);
    const isInRange =
      pending.from &&
      pending.to &&
      isWithinInterval(date, { start: pending.from, end: pending.to });
    const isHoverInRange =
      pending.from &&
      hoveredDate &&
      !pending.to &&
      isWithinInterval(date, {
        start: isBefore(hoveredDate, pending.from) ? hoveredDate : pending.from,
        end: isBefore(hoveredDate, pending.from) ? pending.from : hoveredDate,
      });

    if (isSelected || isEndSelected) {
      return `${base} bg-accent-blue text-white hover:bg-blue-600`;
    }
    if (isInRange || isHoverInRange) {
      return `${base} bg-accent-blue/20 text-white hover:bg-accent-blue/30`;
    }
    return `${base} text-white hover:bg-background-elevated`;
  };

  const renderCalendar = (month: Date) => {
    const monthStart = startOfMonth(month);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days: Date[] = [];
    const currentDay = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-text-secondary font-medium py-1"
            >
              {day}
            </div>
          ))}
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === month.getMonth();
            const disabled = isDateDisabled(date);
            const isSelected = !!(pending.from && isSameDay(date, pending.from));
            const isEndSelected = !!(pending.to && isSameDay(date, pending.to));
            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => handleDateHover(date)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={disabled}
                className={getDateClassName(date)}
                style={{ opacity: isCurrentMonth ? 1 : 0.3 }}
                aria-label={format(date, 'MMMM d, yyyy')}
                aria-pressed={isSelected || isEndSelected}
                aria-disabled={disabled}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Presets set the pending range (Apply still required to commit)
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
      case 'last90days':
        from = subDays(today, 89);
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

    setPending({ from, to });
  };

  // Apply — commit pending range to external value
  const handleApply = () => {
    onChange({ from: pending.from, to: pending.to });

    if (pending.from && pending.to) {
      setAnnouncement(
        `Selected range: ${format(pending.from, 'MMMM d, yyyy')} to ${format(pending.to, 'MMMM d, yyyy')}`,
      );
    } else if (pending.from) {
      setAnnouncement(`Start date selected: ${format(pending.from, 'MMMM d, yyyy')}`);
    } else {
      setAnnouncement('Date range cleared');
    }

    setIsOpen(false);
  };

  // Clear — reset pending and immediately fire onChange
  const handleClear = () => {
    setPending({ from: null, to: null });
    onChange({ from: null, to: null });
    setAnnouncement('Date range cleared');
    setIsOpen(false);
  };

  // Clear button inside the trigger button (inline clear, no popover)
  const handleInlineClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPending({ from: null, to: null });
    onChange({ from: null, to: null });
    setAnnouncement('Date range cleared');
  };

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      {/* Live region for screen-reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Trigger button */}
      <button
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-background-elevated border border-border rounded-lg text-white hover:border-accent-blue transition-colors min-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Calendar className="w-4 h-4 text-text-secondary" aria-hidden="true" />
        <span className="flex-1 text-left">{formatDateRange()}</span>
        {value.from && (
          <button
            onClick={handleInlineClear}
            className="p-1 rounded-full hover:bg-background-card transition-colors"
            aria-label="Clear date range"
          >
            <X className="w-4 h-4 text-text-secondary" aria-hidden="true" />
          </button>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Date range picker"
          aria-modal="true"
          className="absolute top-full left-0 mt-2 bg-background-card border border-border rounded-lg shadow-xl p-4 z-50 w-auto"
        >
          {/* Month navigation header — always visible */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-background-elevated transition-colors"
              aria-label="Previous month"
              disabled={
                !!(minDate &&
                isBefore(startOfMonth(subMonths(leftMonth, 1)), startOfMonth(minDate)))
              }
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            {/* On mobile: show only leftMonth name; on md+ show both */}
            <div className="flex items-center gap-8">
              <span className="font-semibold text-white">
                {format(leftMonth, 'MMMM yyyy')}
              </span>
              <span className="hidden md:block font-semibold text-white">
                {format(rightMonth, 'MMMM yyyy')}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-background-elevated transition-colors"
              aria-label="Next month"
              disabled={
                !!(maxDate &&
                isAfter(startOfMonth(addMonths(rightMonth, 1)), startOfMonth(maxDate)))
              }
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Calendar grid(s) */}
          <div className="flex gap-6">
            {/* Left calendar — always visible */}
            <div className="flex-1">{renderCalendar(leftMonth)}</div>

            {/* Right calendar — only on md+ */}
            <div className="hidden md:flex flex-1">{renderCalendar(rightMonth)}</div>
          </div>

          {/* Presets + Apply/Clear footer */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex gap-2 flex-wrap mb-3">
              {[
                { key: 'today', label: 'Today' },
                { key: 'last7days', label: 'Last 7 days' },
                { key: 'last30days', label: 'Last 30 days' },
                { key: 'last90days', label: 'Last 90 days' },
                { key: 'thisMonth', label: 'This month' },
                { key: 'lastMonth', label: 'Last month' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handlePreset(key)}
                  className="px-3 py-1.5 text-sm text-white bg-background-elevated rounded-md hover:bg-background-card hover:border-accent-blue border border-transparent transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Apply / Clear action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={handleClear}
                className="px-4 py-1.5 text-sm text-text-secondary bg-background-elevated border border-border rounded-md hover:text-white hover:border-accent-blue transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-1.5 text-sm text-white bg-accent-blue rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!pending.from}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
