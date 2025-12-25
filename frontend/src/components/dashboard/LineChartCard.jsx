import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * Graphique d'évolution temporelle avec Recharts
 * Affiche les incidents déclarés/traités sur une période
 */
const LineChartCard = ({ data = [], title = "Évolution des Incidents" }) => {
    // Données par défaut si aucune donnée fournie
    const defaultData = [
        { name: 'Lun', declares: 4, traites: 2, enCours: 2 },
        { name: 'Mar', declares: 3, traites: 1, enCours: 2 },
        { name: 'Mer', declares: 6, traites: 4, enCours: 2 },
        { name: 'Jeu', declares: 8, traites: 5, enCours: 3 },
        { name: 'Ven', declares: 5, traites: 3, enCours: 2 },
        { name: 'Sam', declares: 2, traites: 2, enCours: 0 },
        { name: 'Dim', declares: 3, traites: 1, enCours: 2 }
    ];

    const chartData = data.length > 0 ? data : defaultData;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
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
                    <p style={{
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '8px',
                        fontSize: '0.9rem'
                    }}>
                        {label}
                    </p>
                    {payload.map((entry, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px'
                            }}
                        >
                            <div
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: entry.color
                                }}
                            />
                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                {entry.name}:
                            </span>
                            <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}>
                                {entry.value}
                            </span>
                        </div>
                    ))}
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
                    justifyContent: 'space-between',
                    marginBottom: '24px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <TrendingUp size={20} color="#fff" />
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
                <span
                    style={{
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        background: '#f8fafc',
                        padding: '6px 12px',
                        borderRadius: '8px'
                    }}
                >
                    7 derniers jours
                </span>
            </div>

            {/* Chart */}
            <div style={{ height: '250px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorDeclares" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorTraites" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorEnCours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px'
                            }}
                            formatter={(value) => (
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{value}</span>
                            )}
                        />
                        <Area
                            type="monotone"
                            dataKey="declares"
                            name="Déclarés"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorDeclares)"
                        />
                        <Area
                            type="monotone"
                            dataKey="traites"
                            name="Traités"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTraites)"
                        />
                        <Area
                            type="monotone"
                            dataKey="enCours"
                            name="En cours"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorEnCours)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default LineChartCard;
