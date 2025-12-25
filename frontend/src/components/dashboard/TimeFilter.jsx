import { Calendar, RefreshCw } from 'lucide-react';

/**
 * Composant de filtres temporels pour le dashboard
 */
const TimeFilter = ({
    selectedPeriod = 'week',
    onPeriodChange = () => { },
    onExport = null,
    onRefresh = null,
    loading = false
}) => {
    const periods = [
        { id: 'today', label: "Aujourd'hui" },
        { id: 'week', label: 'Cette semaine' },
        { id: 'month', label: 'Ce mois' }
    ];

    return (
        <div
            style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '12px 16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
            }}
        >
            {/* Period Buttons */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginRight: '8px'
                    }}
                >
                    <Calendar size={18} color="#64748b" />
                    <span
                        style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            fontWeight: '500'
                        }}
                    >
                        Période:
                    </span>
                </div>

                <div
                    style={{
                        display: 'flex',
                        background: '#f1f5f9',
                        borderRadius: '10px',
                        padding: '4px'
                    }}
                >
                    {periods.map((period) => (
                        <button
                            key={period.id}
                            onClick={() => onPeriodChange(period.id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                background: selectedPeriod === period.id
                                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                    : 'transparent',
                                color: selectedPeriod === period.id ? '#fff' : '#64748b',
                                boxShadow: selectedPeriod === period.id
                                    ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                                    : 'none'
                            }}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            color: '#64748b',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                    >
                        <RefreshCw
                            size={16}
                            style={{
                                animation: loading ? 'spin 1s linear infinite' : 'none'
                            }}
                        />
                        Actualiser
                    </button>
                )}
            </div>
        </div>
    );
};

export default TimeFilter;
