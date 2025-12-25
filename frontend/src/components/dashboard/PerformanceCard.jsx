import { Activity, Globe, Layers, Percent } from 'lucide-react';

/**
 * Carte de performance globale avec métriques clés
 */
const PerformanceCard = ({
    tauxResolution = 0,
    provincesCount = 0,
    secteursCount = 0,
    incidentsBlocked = 0
}) => {
    const metrics = [
        {
            icon: Percent,
            label: 'Taux de résolution',
            value: `${tauxResolution}%`,
            color: tauxResolution >= 70 ? '#10b981' : tauxResolution >= 40 ? '#f59e0b' : '#ef4444',
            bgColor: tauxResolution >= 70 ? '#d1fae5' : tauxResolution >= 40 ? '#fef3c7' : '#fee2e2'
        },
        {
            icon: Globe,
            label: 'Provinces couvertes',
            value: provincesCount,
            color: '#3b82f6',
            bgColor: '#dbeafe'
        },
        {
            icon: Layers,
            label: 'Secteurs actifs',
            value: secteursCount,
            color: '#8b5cf6',
            bgColor: '#ede9fe'
        },
        {
            icon: Activity,
            label: 'Incidents bloqués',
            value: incidentsBlocked,
            color: incidentsBlocked > 0 ? '#ef4444' : '#10b981',
            bgColor: incidentsBlocked > 0 ? '#fee2e2' : '#d1fae5'
        }
    ];

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(30, 58, 138, 0.3)'
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <h3
                    style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#fff',
                        margin: '0 0 4px 0'
                    }}
                >
                    📊 Performance Globale
                </h3>
                <p
                    style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.85rem',
                        margin: 0
                    }}
                >
                    Vue d'ensemble des indicateurs clés
                </p>
            </div>

            {/* Metrics Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                }}
            >
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <div
                            key={index}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '12px',
                                padding: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}
                            >
                                <div
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '8px',
                                        background: metric.bgColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Icon size={14} color={metric.color} />
                                </div>
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontWeight: '500'
                                    }}
                                >
                                    {metric.label}
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#fff',
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                {metric.value}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Resolution Progress Bar */}
            <div style={{ marginTop: '16px' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}
                >
                    <span
                        style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.7)'
                        }}
                    >
                        Progression globale
                    </span>
                    <span
                        style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: '#fff'
                        }}
                    >
                        {tauxResolution}%
                    </span>
                </div>
                <div
                    style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        style={{
                            width: `${Math.min(tauxResolution, 100)}%`,
                            height: '100%',
                            background: tauxResolution >= 70
                                ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                                : tauxResolution >= 40
                                    ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
                                    : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease-out'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PerformanceCard;
