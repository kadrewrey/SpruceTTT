import React from 'react';
import { styles, colors } from '../utils/styles';

// Reusable GameSelect component
interface GameSelectProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label: string;
  options: Array<{ value: number; label: string }>;
  minWidth?: string;
}

export const GameSelect: React.FC<GameSelectProps> = ({
  value,
  onChange,
  disabled = false,
  label,
  options,
  minWidth = '70px'
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <label style={{ 
      ...styles.labelText,
      marginBottom: '6px'
    }}>
      {label}
    </label>
    <select 
      value={value} 
      onChange={e => onChange(+e.target.value)}
      disabled={disabled}
      style={{
        background: colors.glassMorphismDark,
        border: `1px solid ${colors.borderMedium}`,
        borderRadius: '4px', // Reduced from 8px
        color: 'white',
        fontSize: '12px',
        padding: '6px 10px',
        minWidth,
        textAlign: 'center',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {options.map(option => (
        <option 
          key={option.value} 
          value={option.value} 
          style={{ background: colors.primary, color: 'white' }}
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Reusable FormInput component
interface FormInputProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
  required?: boolean;
  style?: React.CSSProperties;
}

export const FormInput: React.FC<FormInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  maxLength,
  required = false,
  style = {}
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      background: colors.glassMorphismLight,
      border: `1px solid ${colors.borderMedium}`,
      borderRadius: '4px', // Reduced from 8px
      padding: '8px 12px',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      fontFamily: 'inherit',
      ...style
    }}
    disabled={disabled}
    maxLength={maxLength}
    required={required}
  />
);

// Reusable PasswordInput component with toggle
interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  disabled?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  disabled = false
}) => (
  <div style={{ position: 'relative' }}>
    <FormInput
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        paddingRight: '40px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    />
    <button
      type="button"
      onClick={onTogglePassword}
      style={styles.authPasswordToggle}
    >
      {showPassword ? '👁️' : '👁️‍🗨️'}
    </button>
  </div>
);

// Unified Button component - standardized across app
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'link' | 'ghost';
  children: React.ReactNode;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  children,
  style = {},
  type = 'button',
  onMouseEnter,
  onMouseLeave
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: colors.glassMorphismLight,
          color: colors.white,
          border: `1px solid ${colors.borderMedium}`,
        };
      case 'link':
        return {
          background: 'none',
          color: colors.accent,
          border: 'none',
          textDecoration: 'underline',
          padding: '4px 16px', // Standardized padding
          fontSize: '14px',
        };
      case 'ghost':
        return {
          background: 'none',
          color: colors.white,
          border: `1px solid ${colors.borderMedium}`,
        };
      default: // primary
        return {
          background: colors.accent,
          color: colors.primary,
          border: 'none',
        };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        borderRadius: '4px', // Reduced from 8px (50% less)
        padding: '8px 16px', // Standardized padding
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        fontSize: '14px', // Standardized font size
        fontFamily: 'inherit',
        transition: 'all 0.3s ease',
        opacity: (disabled || loading) ? 0.6 : 1,
        minHeight: '36px', // Standardized minimum height
        minWidth: '80px', // Standardized minimum width
        ...getVariantStyle(),
        ...style
      }}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

// Legacy alias for backward compatibility
export const ActionButton = Button;

// Reusable ErrorMessage component
interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div style={styles.authError}>
    {message}
  </div>
);