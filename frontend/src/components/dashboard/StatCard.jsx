import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Carte KPI moderne avec indicateur de tendance
 * Design inspiré de Stripe/Vercel dashboards
 */
const StatCard = ({
    icon: Icon,
    label,
    value,
    trend = null,
    trendLabel = '',
    color = 'primary',
    onClick = null
}) => {
    const colors = {
        primary: {
            bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            light: '#dbeafe',
            text: '#1d4ed8'
        },
        success: {
            bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            light: '#d1fae5',
            text: '#047857'
        },
        warning: {
            bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            light: '#fef3c7',
            text: '#b45309'
        },
        info: {
            bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            light: '#ede9fe',
            text: '#6d28d9'
        },
        danger: {
            bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            light: '#fee2e2',
            text: '#b91c1c'
        }
    };

    const colorScheme = colors[color] || colors.primary;

    const getTrendIcon = () => {
        if (trend === null || trend === undefined) return null;
        if (trend > 0) return <TrendingUp size={14} />;
        if (trend < 0) return <TrendingDown size={14} />;
        return <Minus size={14} />;
    };

    const getTrendColor = () => {
        if (trend > 0) return '#10b981';
        if (trend < 0) return '#ef4444';
        return '#6b7280';
    };

    return (
        <div
            onClick={onClick}
            style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: onClick ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.06)';
            }}
        >
            {/* Icon Container */}
            <div
                style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: colorScheme.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${colorScheme.text}33`,
                    flexShrink: 0
                }}
            >
                {Icon && <Icon size={24} color="#ffffff" />}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p
                    style={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        margin: '0 0 4px 0',
                        letterSpacing: '0.01em'
                    }}
                >
                    {label}
                </p>
                <h3
                    style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1e293b',
                        margin: '0 0 4px 0',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                        fontFamily: "'Inter', 'Segoe UI', sans-serif"
                    }}
                >
                    {value}
                </h3>
                {(trend !== null || trendLabel) && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '8px'
                        }}
                    >
                        {trend !== null && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: getTrendColor(),
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}
                            >
                                {getTrendIcon()}
                                <span>{Math.abs(trend)}%</span>
                            </div>
                        )}
                        {trendLabel && (
                            <span
                                style={{
                                    color: '#94a3b8',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {trendLabel}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
