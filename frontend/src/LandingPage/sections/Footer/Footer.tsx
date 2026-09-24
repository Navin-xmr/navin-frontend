import { Github, Linkedin, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";

function Footer() {
    const { t } = useTranslation("landing");

    return (
        <footer className="relative py-20 px-4 bg-background-secondary overflow-hidden">
            {/* Background footer image */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
                style={{ backgroundImage: "url('/images/navin-footer.png')" }}
            />
            
            {/* Ambient glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto">
                {/* CTA Section */}
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-text-primary">
                        {t("footer.heading")} <span className="text-primary">{t("footer.headingHighlight")}</span>
                    </h2>
                    <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                        {t("footer.subtitle")}
                    </p>

                    {/* Email Subscribe Form */}
                    <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                        <input
                            type="email"
                            placeholder={t("footer.emailPlaceholder")}
                            className="flex-1 px-6 py-4 bg-background-card/60 backdrop-blur-lg border border-border-light rounded-2xl text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary-light focus:shadow-glow-blue transition-all duration-300 hover:border-primary-light/50"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-light text-background font-display font-semibold text-lg rounded-2xl transition-all duration-300 hover:shadow-glow-blue hover:scale-[1.02] active:scale-[0.98] border border-primary-light/40"
                        >
                            {t("footer.subscribe")}
                        </button>
                    </form>
                </div>
                
                {/* Footer Content */}
                <div className="pt-12 border-t border-border-light">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Logo and tagline */}
                        <div className="flex items-center gap-4">
                            <img 
                                src="/images/logo.svg" 
                                alt="Navin Logo" 
                                className="w-10 h-10 object-contain"
                            />
                            <div>
                                <h3 className="font-display text-xl font-bold text-text-primary">Navin</h3>
                                <p className="text-sm text-text-secondary">{t("footer.tagline")}</p>
                            </div>
                        </div>
                        
                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/Navin-xmr/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group w-12 h-12 rounded-xl bg-background-card/60 backdrop-blur-lg border border-border-light flex items-center justify-center hover:border-primary-light hover:shadow-glow-blue hover:scale-110 transition-all duration-300"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-300" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group w-12 h-12 rounded-xl bg-background-card/60 backdrop-blur-lg border border-border-light flex items-center justify-center hover:border-primary-light hover:shadow-glow-blue hover:scale-110 transition-all duration-300"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-300" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group w-12 h-12 rounded-xl bg-background-card/60 backdrop-blur-lg border border-border-light flex items-center justify-center hover:border-primary-light hover:shadow-glow-blue hover:scale-110 transition-all duration-300"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-300" />
                            </a>
                        </div>
                    </div>
                    
                    {/* Copyright */}
                    <div className="mt-8 text-center text-sm text-text-secondary">
                        <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
                    </div>
                </div>
            </div>

            {/* Giant watermark wordmark */}
            <div
                className="relative mt-12 select-none pointer-events-none overflow-hidden"
                aria-hidden="true"
            >
                <p
                    className="font-display font-extrabold leading-none text-center bg-gradient-to-b from-primary/25 via-accent-teal/15 to-transparent bg-clip-text text-transparent"
                    style={{
                        fontSize: 'clamp(6rem, 22vw, 16rem)',
                        transform: 'translateY(28%)',
                    }}
                >
                    Navin
                </p>
            </div>
        </footer>
    );
}

export default Footer;
