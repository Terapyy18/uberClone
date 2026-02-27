import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ title, loading, variant = 'primary', style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === 'primary' && styles.primary,
                variant === 'secondary' && styles.secondary,
                variant === 'outline' && styles.outline,
                props.disabled && styles.disabled,
                style,
            ]}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? '#007AFF' : '#FFFFFF'} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        variant === 'primary' && styles.primaryText,
                        variant === 'secondary' && styles.secondaryText,
                        variant === 'outline' && styles.outlineText,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    primary: {
        backgroundColor: '#000000',
    },
    secondary: {
        backgroundColor: '#F3F4F6',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#000000',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#111827',
    },
    outlineText: {
        color: '#000000',
    }
});
