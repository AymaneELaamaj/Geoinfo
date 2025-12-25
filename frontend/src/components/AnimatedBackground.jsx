import { useEffect, useRef, useState } from 'react';

/**
 * AnimatedBackground - Composant de background animé avec particules flottantes
 * Inspiré du style antigravity.google
 * 
 * Features:
 * - Particules flottantes avec mouvement organique
 * - Gradient animé en arrière-plan
 * - Bordure lumineuse optionnelle
 * - Respect de prefers-reduced-motion
 * - Performance optimisée (pause quand l'onglet est inactif)
 */
const AnimatedBackground = ({
    enableParticles = true,
    enableGradient = true,
    enableBorder = false,
    particleCount = null // null = auto-detect based on device
}) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationFrameRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Détecter prefers-reduced-motion
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Détecter la visibilité de la page (pause animations quand onglet inactif)
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Initialiser et animer les particules
    useEffect(() => {
        if (!enableParticles || prefersReducedMotion || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Adapter la taille du canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Déterminer le nombre de particules basé sur la taille d'écran
        const isMobile = window.innerWidth < 768;
        const defaultParticleCount = isMobile ? 25 : 50;
        const numParticles = particleCount ?? defaultParticleCount;

        // Classe Particule
        class Particle {
            constructor() {
                this.reset();
                // Position initiale aléatoire sur tout le canvas
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1; // 1-4px
                this.speedX = (Math.random() - 0.5) * 0.24; // Réduit de 20% (0.3 → 0.24)
                this.speedY = (Math.random() - 0.5) * 0.24; // Plus lent et professionnel
                this.opacity = Math.random() * 0.35 + 0.15; // 0.15-0.5 opacity (plus subtil)
                // Couleurs professionnelles: bleu et cyan uniquement
                const colors = [
                    'rgba(59, 130, 246, ', // bleu
                    'rgba(6, 182, 212, ',  // cyan
                    'rgba(14, 165, 233, ', // bleu ciel
                    'rgba(30, 58, 138, '   // bleu foncé
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Rebondir sur les bords
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

                // Garder dans les limites
                this.x = Math.max(0, Math.min(canvas.width, this.x));
                this.y = Math.max(0, Math.min(canvas.height, this.y));
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + this.opacity + ')';
                // Ajout d'un flou léger pour plus de douceur
                ctx.shadowBlur = 0.5;
                ctx.shadowColor = this.color + this.opacity + ')';
                ctx.fill();
                // Reset shadow pour les prochaines particules
                ctx.shadowBlur = 0;
            }
        }

        // Initialiser les particules
        particlesRef.current = Array.from({ length: numParticles }, () => new Particle());

        // Fonction d'animation
        const animate = () => {
            if (!isVisible) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            // Effacer le canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Mettre à jour et dessiner chaque particule
            particlesRef.current.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [enableParticles, prefersReducedMotion, isVisible, particleCount]);

    // Ne rien afficher si prefers-reduced-motion est activé
    if (prefersReducedMotion) {
        return (
            <div className="animated-background static">
                <div className="gradient-layer-static"></div>
            </div>
        );
    }

    return (
        <div className="animated-background">
            {/* Gradient animé */}
            {enableGradient && <div className="gradient-layer"></div>}

            {/* Canvas pour les particules */}
            {enableParticles && (
                <canvas
                    ref={canvasRef}
                    className="particles-canvas"
                    aria-hidden="true"
                />
            )}

            {/* Bordure lumineuse (optionnelle) */}
            {enableBorder && <div className="luminous-border"></div>}
        </div>
    );
};

export default AnimatedBackground;
