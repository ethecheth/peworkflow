import React, { forwardRef } from 'react';

interface SafeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SafeInput = forwardRef<HTMLInputElement, SafeInputProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onChange(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      e.stopPropagation();
    };

    const handleKeyUp = (e: React.KeyboardEvent) => {
      e.stopPropagation();
    };

    const handleFocus = (e: React.FocusEvent) => {
      e.stopPropagation();
    };

    const handleBlur = (e: React.FocusEvent) => {
      e.stopPropagation();
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    const handleMouseUp = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={className}
        placeholder={placeholder}
      />
    );
  }
);

SafeInput.displayName = 'SafeInput';

export default SafeInput; 