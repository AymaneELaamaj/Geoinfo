import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChartIcon } from 'lucide-react';

/**
 * Graphique en anneau (donut) pour la répartition par secteur
 * Design moderne avec animation et interactions
 */
const DonutChartCard = ({ data = [], title = "Répartition par Secteur" }) => {
    // Couleurs par défaut pour les secteurs
    const COLORS = [
        '#3b82f6', // Infrastructure - Bleu
        '#10b981', // Environnement - Vert
        '#ef4444', // Sécurité - Rouge
        '#f59e0b', // Services Publics - Orange
        '#8b5cf6', // Transport - Violet
        '#ec4899'  // Santé - Rose
    ];

    // Données par défaut
    const defaultData = [
        { name: 'Infrastructure', value: 35, color: '#3b82f6' },
        { name: 'Environnement', value: 25, color: '#10b981' },
        { name: 'Sécurité', value: 15, color: '#ef4444' },
        { name: 'Services Publics', value: 12, color: '#f59e0b' },
        { name: 'Transport', value: 8, color: '#8b5cf6' },
        { name: 'Santé', value: 5, color: '#ec4899' }
    ];

    const chartData = data.length > 0 ? data : defaultData;
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(8px)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '4px',
                                background: data.color || data.fill
                            }}
                        />
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{data.name}</span>
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
                        <div>
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Incidents</span>
                            <p style={{ fontWeight: '700', color: '#1e293b', margin: 0 }}>{data.value}</p>
                        </div>
                        <div>
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Part</span>
                            <p style={{ fontWeight: '700', color: '#1e293b', margin: 0 }}>{percentage}%</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                height: '100%'
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px'
                }}
            >
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <PieChartIcon size={20} color="#fff" />
                </div>
                <h3
                    style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: 0
                    }}
                >
                    {title}
                </h3>
            </div>

            {/* Chart with Center Label */}
            <div style={{ position: 'relative', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color || COLORS[index % COLORS.length]}
                                    style={{
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Label */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}
                >
                    <div
                        style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            lineHeight: 1
                        }}
                    >
                        {total}
                    </div>
                    <div
                        style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            marginTop: '4px'
                        }}
                    >
                        Total
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    marginTop: '16px'
                }}
            >
                {chartData.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                        }}
                    >
                        <div
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '3px',
                                background: item.color || COLORS[index % COLORS.length],
                                flexShrink: 0
                            }}
                        />
                        <span
                            style={{
                                fontSize: '0.8rem',
                                color: '#64748b',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {item.name}
                        </span>
                        <span
                            style={{
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#1e293b'
                            }}
                        >
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChartCard;
