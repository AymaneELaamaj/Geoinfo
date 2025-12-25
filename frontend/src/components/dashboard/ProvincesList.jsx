import { MapPin, ChevronRight } from 'lucide-react';

/**
 * Liste des Top 5 provinces avec barres de progression modernes
 */
const ProvincesList = ({ data = [], title = "Top 5 Provinces", onViewMap = null }) => {
    // Données par défaut
    const defaultData = [
        { name: 'Casablanca', count: 45 },
        { name: 'Rabat', count: 32 },
        { name: 'Marrakech', count: 28 },
        { name: 'Fès', count: 15 },
        { name: 'Tanger', count: 12 }
    ];

    const provinces = data.length > 0 ? data : defaultData;
    const maxCount = Math.max(...provinces.map(p => p.count), 1);

    // Couleurs pour le gradient des barres
    const getBarGradient = (index) => {
        const gradients = [
            'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
            'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
            'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
            'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
            'linear-gradient(90deg, #ec4899 0%, #f472b6 100%)'
        ];
        return gradients[index % gradients.length];
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
                    marginBottom: '20px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <MapPin size={20} color="#fff" />
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
                {onViewMap && (
                    <button
                        onClick={onViewMap}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#3b82f6',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#eff6ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                        }}
                    >
                        Voir carte
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>

            {/* Province List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {provinces.slice(0, 5).map((province, index) => {
                    const percentage = (province.count / maxCount) * 100;
                    return (
                        <div key={index}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '8px',
                                            background: index === 0
                                                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                                                : '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            color: index === 0 ? '#fff' : '#64748b'
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                    <span
                                        style={{
                                            fontWeight: '500',
                                            color: '#1e293b',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        {province.name}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                        style={{
                                            fontSize: '0.8rem',
                                            color: '#94a3b8'
                                        }}
                                    >
                                        {provinces.reduce((sum, p) => sum + p.count, 0) > 0
                                            ? ((province.count / provinces.reduce((sum, p) => sum + p.count, 0)) * 100).toFixed(0)
                                            : 0}%
                                    </span>
                                    <span
                                        style={{
                                            fontWeight: '700',
                                            color: '#1e293b',
                                            fontSize: '1rem',
                                            minWidth: '40px',
                                            textAlign: 'right'
                                        }}
                                    >
                                        {province.count}
                                    </span>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#f1f5f9',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        background: getBarGradient(index),
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease-out'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}

                {provinces.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '32px',
                            color: '#94a3b8'
                        }}
                    >
                        <MapPin size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <p>Aucune donnée disponible</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProvincesList;
