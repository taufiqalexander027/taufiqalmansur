import React from 'react';

export const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    // Use 'decimal' style to get just the number with separators
    return new Intl.NumberFormat('id-ID', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const CurrencyInput = ({ value, onChange, style, ...props }) => {
    const [localValue, setLocalValue] = React.useState('');
    const [isEditing, setIsEditing] = React.useState(false);

    // Sync local value with prop value when not editing
    React.useEffect(() => {
        if (!isEditing) {
            setLocalValue(value !== 0 && !value ? '' : formatCurrency(value));
        }
    }, [value, isEditing]);

    const handleChange = (e) => {
        // Allow digits and math operators
        const rawValue = e.target.value;
        // Allow: digits, spaces, +, -, *, /, (, ), =
        if (/^[0-9\s+\-*/()=]*$/.test(rawValue)) {
            setLocalValue(rawValue);
        }
    };

    const evaluateExpression = () => {
        let expression = localValue;

        // Remove '=' if present
        if (expression.startsWith('=')) {
            expression = expression.substring(1);
        }

        // If it's just a number (formatted or not), parse it
        if (!/[+\-*/()]/.test(expression)) {
            const numeric = parseInt(expression.replace(/[^0-9]/g, ''), 10);
            onChange(isNaN(numeric) ? 0 : numeric);
            setIsEditing(false);
            return;
        }

        try {
            // Safety check: only allow valid math characters
            if (!/^[0-9\s+\-*/()]*$/.test(expression)) {
                throw new Error("Invalid characters");
            }

            // Evaluate safely using Function constructor
            // eslint-disable-next-line no-new-func
            const result = new Function(`return (${expression})`)();

            if (isFinite(result)) {
                onChange(Math.round(result));
            } else {
                // Revert if invalid result
                onChange(value);
            }
        } catch (err) {
            console.error("Calculation error:", err);
            // Revert to original value on error
            onChange(value);
        }
        setIsEditing(false);
    };

    const handleFocus = () => {
        setIsEditing(true);
        // On focus, show the raw number without formatting for easier editing if it's not an expression
        if (value !== 0 && value) {
            setLocalValue(value.toString());
        } else {
            setLocalValue('');
        }
    };

    const handleBlur = () => {
        evaluateExpression();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission if any
            evaluateExpression();
            // Optional: trigger the parent's onKeyDown if provided (for navigation)
            if (props.onKeyDown) {
                // We need to pass the event, but we've already handled the value update
                // The parent might move focus, which will trigger blur, so we're good.
                props.onKeyDown(e);
            }
        } else if (props.onKeyDown) {
            props.onKeyDown(e);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault(); // Prevent default paste behavior

        // Get pasted text from clipboard
        const pastedText = e.clipboardData.getData('text');

        // Check if it's multi-line data (from Excel or multiple cells)
        const lines = pastedText.split(/\r?\n/).filter(line => line.trim());

        // If pasting multiple rows and parent supports multi-paste
        if (lines.length > 1 && props.onMultiPaste) {
            // Extract numeric values from each line
            const values = lines.map(line => {
                const digitsOnly = line.replace(/\D/g, '');
                return digitsOnly ? parseInt(digitsOnly, 10) : 0;
            }).filter(val => !isNaN(val));

            // Trigger parent's multi-paste handler
            props.onMultiPaste(values);
            setIsEditing(false);
            return;
        }

        // Single value paste (original logic)
        const singleValue = lines[0] || pastedText;

        // Remove all non-digit characters (dots, commas, spaces, etc.) except math operators
        // If it contains math operators, keep them
        if (/[+\-*/=()]/.test(singleValue)) {
            // It's an expression, just remove formatting characters (dots, commas)
            const cleanedExpression = singleValue.replace(/[.,]/g, '');
            setLocalValue(cleanedExpression);
        } else {
            // It's just a number, extract only digits
            const digitsOnly = singleValue.replace(/\D/g, '');
            if (digitsOnly) {
                const numericValue = parseInt(digitsOnly, 10);
                if (!isNaN(numericValue)) {
                    // Immediately update the parent with the parsed value
                    onChange(numericValue);
                    // Show formatted value
                    setLocalValue(formatCurrency(numericValue));
                    setIsEditing(false);
                }
            }
        }
    };

    return (
        <input
            type="text"
            value={localValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            style={{
                ...style,
                textAlign: 'right'
            }}
            {...props}
        />
    );
};

export default CurrencyInput;
